import DragModal from '@/components/modal/DragModal';
import type { Endpoint } from '@/services/integrated/endpoint/endpointApi';
import { ENDPOINT_CATEGORIES } from '@/services/integrated/endpoint/endpointApi';
import type { EndpointTypeConfig, SchemaField } from '@/services/integrated/endpointConfig/endpointConfigApi';
import { endpointConfigService, MODE_OPTIONS } from '@/services/integrated/endpointConfig/endpointConfigApi';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import type { CollapseProps, TabsProps } from 'antd';
import { Button, Card, Collapse, Divider, Form, Input, InputNumber, Select, Space, Switch, Tabs } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SchemaFormFieldRenderer from './SchemaFormFieldRenderer';

const { TextArea } = Input;

interface EndpointModalProps {
  /** 是否显示弹窗 */
  open: boolean;
  /** 弹窗标题 */
  title: string;
  /** 加载状态 */
  loading: boolean;
  /** 初始值 */
  initialValues?: Partial<Endpoint> | undefined;
  /** 是否查看模式 */
  isViewMode?: boolean;
  /** 确认回调 */
  onOk: (values: any) => void;
  /** 取消回调 */
  onCancel: () => void;
}

/**
 * 端点配置弹窗组件
 */
/**
 * 键值对接口
 */
interface KeyValuePair {
  key: string;
  value: string;
  id: string;
}

/**
 * 可收缩卡片组件 - 使用 Collapse + Card 组合
 */
interface CollapsibleCardProps {
  title: string;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({ title, children, defaultCollapsed = false }) => {
  const items: CollapseProps['items'] = [
    {
      key: '1',
      label: title,
      children: <Card variant="borderless">{children}</Card>,
    },
  ];

  return <Collapse defaultActiveKey={defaultCollapsed ? [] : ['1']} items={items} />;
};

const EndpointModal: React.FC<EndpointModalProps> = ({
  open,
  title,
  loading,
  initialValues,
  isViewMode,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [selectedEndpointTypeConfig, setSelectedEndpointTypeConfig] = useState<EndpointTypeConfig | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  // 测试Tab相关状态
  const [headers, setHeaders] = useState<KeyValuePair[]>([{ key: '', value: '', id: Date.now().toString() }]);
  const [bodyContent, setBodyContent] = useState<string>('');
  const [requestContent, setRequestContent] = useState<string>('');
  const [responseContent, setResponseContent] = useState<string>('');

  // 监听端点类型和模式变化
  const endpointTypeName = Form.useWatch('endpointType', form);
  const selectedMode = Form.useWatch('mode', form);
  // 监听是否启用指数退避策略
  const useExponentialBackoff = Form.useWatch('useExponentialBackoff', form);

  /**
   * 获取所有启用的端点类型配置列表
   */
  const { data: endpointTypeListModule, isLoading: typeListLoading } = useQuery({
    queryKey: ['endpoint_type_list_for_modal'],
    queryFn: async () => {
      const result = await endpointConfigService.getEndpointTypeList({
        pageNum: 1,
        pageSize: 1000, // 获取所有启用的类型
        status: true, // 只获取启用的类型
      });
      return result;
    },
    enabled: open, // 只在弹窗打开时查询
  });

  /**
   * 端点类型选项 - 使用 useMemo 缓存
   */
  const endpointTypeOptions = useMemo(() => {
    if (!endpointTypeListModule?.records) return [];
    return endpointTypeListModule.records.map((item) => ({
      value: item.typeName,
      label: item.typeName,
      config: item, // 保存完整配置对象
    }));
  }, [endpointTypeListModule]);

  /**
   * 模式选项 - 根据选择的端点类型的 supportMode 动态生成
   */
  const modeOptions = useMemo(() => {
    if (!selectedEndpointTypeConfig?.supportMode) return [];

    // 从 MODE_OPTIONS 中过滤出 supportMode 支持的选项
    return MODE_OPTIONS.filter((option) => selectedEndpointTypeConfig.supportMode.includes(option.value));
  }, [selectedEndpointTypeConfig]);

  /**
   * 根据选择的类型名称查找对应的配置
   * 当端点类型改变时，清空 mode 字段
   */
  useEffect(() => {
    if (!endpointTypeName || !endpointTypeListModule?.records) {
      setSelectedEndpointTypeConfig(null);
      return;
    }

    const config = endpointTypeListModule.records.find((item) => item.typeName === endpointTypeName);

    if (config) {
      setSelectedEndpointTypeConfig(config);
      // 类型改变时，清空 mode 字段
      form.setFieldValue('mode', undefined);
    } else {
      setSelectedEndpointTypeConfig(null);
    }
  }, [endpointTypeName, endpointTypeListModule]);

  /**
   * 获取Schema字段列表（根据选择的 mode 过滤并排序）
   * 性能优化：使用 useMemo 缓存，只有当配置或 mode 改变时才重新计算
   */
  const getSchemaFields = useMemo(() => {
    if (!selectedEndpointTypeConfig?.schemaFields || !selectedMode) return [];

    // 过滤出包含选择模式的字段
    const filteredFields = selectedEndpointTypeConfig.schemaFields.filter((field) => {
      // 如果字段没有 mode 配置，则默认显示
      if (!field.mode || field.mode.length === 0) return true;
      // 检查字段的 mode 是否包含当前选择的 mode
      return field.mode.includes(selectedMode);
    });

    // 按照 sortOrder 排序
    return filteredFields.sort((a, b) => {
      const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }, [selectedEndpointTypeConfig, selectedMode]);

  /**
   * 监听表单值变化，用于字段显示条件判断
   * 性能优化：使用 useCallback 避免重复创建函数
   */
  const handleValuesChange = useCallback((_changedValues: any, allValues: any) => {
    setFormValues(allValues);
  }, []);

  /**
   * 初始化表单值
   */
  useEffect(() => {
    if (open && initialValues) {
      // 合并基础信息和配置信息
      const formValuesData = {
        ...initialValues,
        ...(initialValues.config || {}),
      };
      form.setFieldsValue(formValuesData);
      setFormValues(formValuesData);
    } else if (!open) {
      form.resetFields();
      setSelectedEndpointTypeConfig(null);
      setFormValues({});
    }
  }, [open, initialValues, form]);

  /**
   * 当有 endpointType 时，根据 endpointType 加载对应的配置
   * 支持新增时通过 initialValues 传入 endpointType
   */
  useEffect(() => {
    if (open && initialValues?.endpointType && endpointTypeListModule?.records) {
      const config = endpointTypeListModule.records.find((item) => item.typeName === initialValues.endpointType);
      if (config && !selectedEndpointTypeConfig) {
        setSelectedEndpointTypeConfig(config);
      }
    }
  }, [open, initialValues?.endpointType, endpointTypeListModule, selectedEndpointTypeConfig]);

  /**
   * 添加键值对
   */
  const handleAddHeader = useCallback(() => {
    setHeaders([...headers, { key: '', value: '', id: Date.now().toString() }]);
  }, [headers]);

  /**
   * 更新键值对
   */
  const handleHeaderChange = useCallback(
    (id: string, field: 'key' | 'value', value: string) => {
      setHeaders(headers.map((header) => (header.id === id ? { ...header, [field]: value } : header)));
    },
    [headers]
  );

  /**
   * 删除键值对
   */
  const handleRemoveHeader = useCallback(
    (id: string) => {
      if (headers.length > 1) {
        setHeaders(headers.filter((header) => header.id !== id));
      }
    },
    [headers]
  );

  /**
   * 处理确定 - 优化：使用 useCallback 缓存
   */
  const handleOk = useCallback(async () => {
    try {
      const values = await form.validateFields();

      // 获取所有基础字段名（包括 model，对应后端的 mode 字段）
      const baseFieldNames = [
        'name',
        'code',
        'description',
        'endpointType',
        'category',
        'mode',
        'status',
        'tags',
        'remark',
      ];

      // 获取配置字段名（从schemaFields中提取）
      const configFieldNames = getSchemaFields.map((field) => field.field);

      // 分离基础字段和配置字段
      const baseFields: any = {};
      const configFields: any = {};

      Object.keys(values).forEach((key) => {
        if (baseFieldNames.includes(key)) {
          baseFields[key] = values[key];
        } else if (configFieldNames.includes(key)) {
          configFields[key] = values[key];
        }
      });

      // 构造提交数据
      const submitData = {
        id: initialValues?.id,
        ...baseFields,
        config: configFields,
      };

      onOk(submitData);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  }, [form, getSchemaFields, initialValues?.id, onOk]);

  // Tab配置
  const tabItems: TabsProps['items'] = [
    {
      key: 'config',
      label: '属性配置',
      children: (
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          disabled={isViewMode || false}
          onValuesChange={handleValuesChange}
        >
          {/* 基础信息区域 */}
          <div className="flex flex-col gap-0">
            <Form.Item name="name" label="端点名称" rules={[{ required: true, message: '请输入端点名称' }]}>
              <Input placeholder="请输入端点名称" />
            </Form.Item>
            <Form.Item name="endpointType" label="端点类型" rules={[{ required: true, message: '请选择端点类型' }]}>
              <Select
                placeholder="请选择端点类型"
                disabled={!!initialValues?.id || typeListLoading}
                loading={typeListLoading}
                options={endpointTypeOptions}
                showSearch
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              />
            </Form.Item>

            {/* 模式选择 - 一直显示，但只有选择了端点类型后才有选项 */}
            <Form.Item
              name="mode"
              label="端点模式"
              rules={[{ required: true, message: '请选择端点模式' }]}
              tooltip="端点的工作模式：IN（入站）、OUT（出站）、IN_OUT（双向）、OUT_IN（先出后入）"
            >
              <Select
                placeholder={endpointTypeName ? '请选择端点模式' : '请先选择端点类型'}
                options={modeOptions}
                disabled={!endpointTypeName || modeOptions.length === 0}
                notFoundContent={endpointTypeName ? '该端点类型暂无可用模式' : '请先选择端点类型'}
              />
            </Form.Item>

            <Form.Item name="category" label="端点分类">
              <Select placeholder="请选择端点分类" options={ENDPOINT_CATEGORIES as any} />
            </Form.Item>

            <Form.Item name="description" label="端点描述">
              <TextArea placeholder="请输入端点描述" rows={3} />
            </Form.Item>

            <Form.Item name="remark" label="备注">
              <TextArea placeholder="请输入备注信息" rows={4} />
            </Form.Item>
          </div>

          {/* 配置信息区域 - 只有选择了端点类型和模式后才显示 */}
          {endpointTypeName && selectedMode && selectedEndpointTypeConfig && (
            <>
              <Divider titlePlacement="start">配置信息</Divider>
              {getSchemaFields.length > 0 ? (
                <div className="flex flex-col gap-0">
                  {getSchemaFields.map((field: SchemaField) => (
                    <SchemaFormFieldRenderer key={field.field} field={field} formValues={formValues} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400">
                  当前端点类型在【{selectedMode}】模式下暂无配置项
                </div>
              )}
            </>
          )}
          {/* 如果端点配置支持重试，这里需要添加重试相关的配置 */}
          {selectedEndpointTypeConfig?.supportRetry && (
            <>
              <Divider titlePlacement="start">重试策略</Divider>
              <Form.Item
                name="maximumRedeliveries"
                label="重试次数"
                tooltip="最大重试次数"
                rules={[{ required: true, message: '请输入重试次数' }]}
              >
                <InputNumber
                  className="w-full"
                  placeholder="请输入重试次数"
                  min={1}
                  max={10}
                  step={1}
                  addonAfter="次"
                />
              </Form.Item>
              <Form.Item
                name="redeliveryDelay"
                label="初始延迟"
                tooltip="初始延迟时间"
                rules={[{ required: true, message: '请输入初始延迟' }]}
              >
                <InputNumber
                  className="w-full"
                  placeholder="请输入初始延迟"
                  min={50}
                  max={10000}
                  step={1000}
                  addonAfter="ms"
                />
              </Form.Item>
              <Form.Item name="useExponentialBackoff" label="启用指数退避" valuePropName="checked">
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
              <Form.Item
                name="backOffMultiplier"
                label="退避倍数"
                tooltip="退避倍数"
                rules={[{ required: useExponentialBackoff, message: '请输入退避倍数' }]}
              >
                <Space.Compact>
                    <InputNumber
                      disabled={!useExponentialBackoff}
                      className="w-full"
                      placeholder="请输入退避倍数"
                      min={1}
                      max={10}
                      step={1}
                    />
                  <Space.Addon>倍</Space.Addon>
                </Space.Compact>
              </Form.Item>
              <Form.Item
                name="maximumRedeliveryDelay"
                label="最大延迟"
                tooltip="最大延迟时间"
                rules={[{ required: true, message: '请输入最大延迟' }]}
              >
                <Space.Compact>
                  <InputNumber
                    className="w-full"
                    placeholder="请输入最大延迟"
                    min={50}
                    max={60000}
                    step={1000}
                  />
                  <Space.Addon>ms</Space.Addon>
                </Space.Compact>
                
              </Form.Item>
            </>
          )}
        </Form>
      ),
    },
    {
      key: 'test',
      label: '测试',
      children: (
        <div className="flex flex-col gap-4">
          {/* 头部 - 键值对输入 */}
          <CollapsibleCard title="头">
            <div className="flex flex-col gap-2">
              {headers.map((header) => (
                <Space key={header.id} style={{ width: '100%' }}>
                  <Input
                    placeholder="键"
                    value={header.key}
                    onChange={(e) => handleHeaderChange(header.id, 'key', e.target.value)}
                    style={{ width: 200 }}
                  />
                  <Input
                    placeholder="值"
                    value={header.value}
                    onChange={(e) => handleHeaderChange(header.id, 'value', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  {headers.length > 1 && (
                    <Button danger size="small" onClick={() => handleRemoveHeader(header.id)}>
                      删除
                    </Button>
                  )}
                </Space>
              ))}
              <Button type="dashed" onClick={handleAddHeader} icon={<PlusOutlined />} style={{ width: '100%' }}>
                添加键值对
              </Button>
            </div>
          </CollapsibleCard>

          {/* 主体内容 */}
          <CollapsibleCard title="主体内容">
            <TextArea
              placeholder="请输入主体内容"
              rows={6}
              value={bodyContent}
              onChange={(e) => setBodyContent(e.target.value)}
            />
          </CollapsibleCard>

          {/* 请求内容 */}
          <CollapsibleCard title="请求内容">
            <TextArea
              placeholder="请输入请求内容"
              rows={6}
              value={requestContent}
              onChange={(e) => setRequestContent(e.target.value)}
            />
          </CollapsibleCard>

          {/* 响应内容 */}
          <CollapsibleCard title="响应内容">
            <TextArea
              placeholder="响应内容将显示在这里"
              rows={6}
              value={responseContent}
              onChange={(e) => setResponseContent(e.target.value)}
            />
          </CollapsibleCard>

          {/* 运行测试按钮 */}
          <Button type="primary" size="large" style={{ width: '100%' }}>
            运行测试
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DragModal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      width={900}
      maskClosable={false}
      centered
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto',
        },
      }}
    >
      <Tabs defaultActiveKey="config" type="card" items={tabItems} />
    </DragModal>
  );
};

export default React.memo(EndpointModal);
