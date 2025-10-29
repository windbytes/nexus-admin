import type { Endpoint } from '@/services/integrated/endpoint/endpointApi';
import { ENDPOINT_CATEGORIES } from '@/services/integrated/endpoint/endpointApi';
import type { EndpointTypeConfig, SchemaField } from '@/services/integrated/endpointConfig/endpointConfigApi';
import { endpointConfigService } from '@/services/integrated/endpointConfig/endpointConfigApi';
import { useQuery } from '@tanstack/react-query';
import { Divider, Form, Input, Modal, Select, Switch } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
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

  // 监听端点类型变化
  const endpointTypeName = Form.useWatch('endpointType', form);

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
   * 端点类型选项
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
   * 根据选择的类型名称查找对应的配置
   */
  useEffect(() => {
    if (!endpointTypeName || !endpointTypeListModule?.records) {
      setSelectedEndpointTypeConfig(null);
      return;
    }

    const config = endpointTypeListModule.records.find((item) => item.typeName === endpointTypeName);

    if (config) {
      setSelectedEndpointTypeConfig(config);
    } else {
      setSelectedEndpointTypeConfig(null);
    }
  }, [endpointTypeName, endpointTypeListModule]);

  /**
   * 获取Schema字段列表（用于提交和渲染）
   */
  const getSchemaFields = useMemo(() => {
    if (!selectedEndpointTypeConfig?.schemaFields) return [];
    // 按照sortOrder排序
    return [...selectedEndpointTypeConfig.schemaFields].sort((a, b) => {
      const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }, [selectedEndpointTypeConfig]);

  /**
   * 监听表单值变化，用于字段显示条件判断
   */
  const handleValuesChange = (_changedValues: any, allValues: any) => {
    setFormValues(allValues);
  };

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
   * 当编辑已有数据时，根据 endpointType 加载对应的配置
   */
  useEffect(() => {
    if (open && initialValues?.endpointType && endpointTypeListModule?.records && !selectedEndpointTypeConfig) {
      const config = endpointTypeListModule.records.find((item) => item.typeName === initialValues.endpointType);
      if (config) {
        setSelectedEndpointTypeConfig(config);
      }
    }
  }, [open, initialValues, endpointTypeListModule, selectedEndpointTypeConfig]);

  /**
   * 处理确定
   */
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // 获取所有基础字段名
      const baseFieldNames = ['name', 'code', 'description', 'endpointType', 'category', 'status', 'tags', 'remark'];

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
  };

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      width={900}
      maskClosable={false}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        disabled={isViewMode || false}
        initialValues={{
          status: true,
        }}
        onValuesChange={handleValuesChange}
      >
        {/* 基础信息区域 */}
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item name="name" label="端点名称" rules={[{ required: true, message: '请输入端点名称' }]}>
            <Input placeholder="请输入端点名称" />
          </Form.Item>

          <Form.Item
            name="code"
            label="端点编码"
            rules={[
              { required: true, message: '请输入端点编码' },
              {
                pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
                message: '编码必须以字母开头，只能包含字母、数字和下划线',
              },
            ]}
          >
            <Input placeholder="请输入端点编码" disabled={!!initialValues?.id} />
          </Form.Item>

          <Form.Item
            name="endpointType"
            label="端点类型"
            rules={[{ required: true, message: '请选择端点类型' }]}
            className="col-span-2"
          >
            <Select
              placeholder="请选择端点类型"
              disabled={!!initialValues?.id || typeListLoading}
              loading={typeListLoading}
              options={endpointTypeOptions}
              showSearch
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>

          <Form.Item name="category" label="端点分类">
            <Select placeholder="请选择端点分类" options={ENDPOINT_CATEGORIES as any} />
          </Form.Item>

          <Form.Item name="status" label="启用状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item name="description" label="端点描述" className="col-span-2">
            <TextArea placeholder="请输入端点描述" rows={3} />
          </Form.Item>

          <Form.Item name="tags" label="标签" className="col-span-2">
            <Select mode="tags" placeholder="请输入标签，回车添加" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="remark" label="备注" className="col-span-2">
            <TextArea placeholder="请输入备注信息" rows={4} />
          </Form.Item>
        </div>

        {/* 配置信息区域 - 只有选择了类型才显示 */}
        {endpointTypeName && selectedEndpointTypeConfig && (
          <>
            <Divider orientation="left" plain>
              配置信息
            </Divider>
            <div className="min-h-[300px] max-h-[500px] overflow-y-auto border border-gray-200 rounded p-4">
              {getSchemaFields.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-4">
                  {getSchemaFields.map((field: SchemaField) => (
                    <SchemaFormFieldRenderer key={field.field} field={field} formValues={formValues} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400">该端点类型暂无配置项</div>
              )}
            </div>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default React.memo(EndpointModal);
