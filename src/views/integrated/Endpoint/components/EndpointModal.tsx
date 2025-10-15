import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Tabs, Switch, Spin } from 'antd';
import type { Endpoint, FormSchemaField } from '@/services/integrated/endpoint/endpointApi';
import { ENDPOINT_CATEGORIES, ENDPOINT_TYPE_OPTIONS } from '@/services/integrated/endpoint/endpointApi';
import DynamicForm from '@/components/DynamicForm';
import { getEndpointConfigSchema } from '../../../../../mock/endpointConfigSchema.mock';

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
  const [configSchema, setConfigSchema] = useState<FormSchemaField[]>([]);
  const [schemaLoading, setSchemaLoading] = useState(false);

  // 监听端点类型变化
  const endpointType = Form.useWatch('endpointType', form);

  /**
   * 加载配置Schema
   */
  useEffect(() => {
    if (!endpointType) {
      setConfigSchema([]);
      return;
    }

    const loadSchema = async () => {
      setSchemaLoading(true);
      try {
        // 这里使用模拟数据，后续可替换为真实的API调用
        // const schema = await endpointService.getConfigSchema(endpointType);
        const schema = getEndpointConfigSchema(endpointType);
        setConfigSchema(schema);
      } catch (error) {
        console.error('加载配置Schema失败:', error);
        setConfigSchema([]);
      } finally {
        setSchemaLoading(false);
      }
    };

    loadSchema();
  }, [endpointType]);

  /**
   * 初始化表单值
   */
  useEffect(() => {
    if (open && initialValues) {
      // 合并基础信息和配置信息
      const formValues = {
        ...initialValues,
        ...(initialValues.config || {}),
      };
      form.setFieldsValue(formValues);
    } else if (!open) {
      form.resetFields();
      setConfigSchema([]);
    }
  }, [open, initialValues, form]);

  /**
   * 处理确定
   */
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // 分离基础字段和配置字段
      const {
        name,
        code,
        description,
        endpointType,
        category,
        status,
        tags,
        remark,
        ...config
      } = values;

      // 构造提交数据
      const submitData = {
        id: initialValues?.id,
        name,
        code,
        description,
        endpointType,
        category,
        status,
        tags,
        remark,
        config,
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
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        disabled={isViewMode || false}
        initialValues={{
          status: true,
        }}
      >
        <Tabs
          items={[
            {
              key: 'basic',
              label: '基础信息',
              children: (
                <div className="grid grid-cols-2 gap-x-4">
                  <Form.Item
                    name="name"
                    label="端点名称"
                    rules={[{ required: true, message: '请输入端点名称' }]}
                  >
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
                    <Input
                      placeholder="请输入端点编码"
                      disabled={!!initialValues?.id}
                    />
                  </Form.Item>

                  <Form.Item
                    name="endpointType"
                    label="端点类型"
                    rules={[{ required: true, message: '请选择端点类型' }]}
                    className="col-span-2"
                  >
                    <Select
                      placeholder="请选择端点类型"
                      disabled={!!initialValues?.id}
                      options={ENDPOINT_TYPE_OPTIONS as any}
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
                </div>
              ),
            },
            {
              key: 'config',
              label: '配置信息',
              disabled: !endpointType,
              children: (
                <div className="min-h-[300px] max-h-[500px] overflow-y-auto">
                  {schemaLoading ? (
                    <div className="flex justify-center items-center py-20">
                      <Spin tip="加载配置中..." />
                    </div>
                  ) : endpointType && configSchema.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-4">
                      <DynamicForm schema={configSchema} form={form} />
                    </div>
                  ) : (
                    <div className="text-center py-20 text-gray-400">
                      {endpointType ? '暂无配置项' : '请先选择端点类型'}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'other',
              label: '其他信息',
              children: (
                <div className="grid grid-cols-1 gap-4">
                  <Form.Item name="tags" label="标签">
                    <Select
                      mode="tags"
                      placeholder="请输入标签，回车添加"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>

                  <Form.Item name="remark" label="备注">
                    <TextArea placeholder="请输入备注信息" rows={4} />
                  </Form.Item>
                </div>
              ),
            },
          ]}
        />
      </Form>
    </Modal>
  );
};

export default React.memo(EndpointModal);

