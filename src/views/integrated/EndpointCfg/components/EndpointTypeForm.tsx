import React, { useEffect } from 'react';
import { Form, Input, Switch, Row, Col, Select } from 'antd';
import type { FormInstance } from 'antd';
import { MODE_OPTIONS, type EndpointTypeConfig } from '@/services/integrated/endpointConfig/endpointConfigApi';

const { TextArea } = Input;

interface EndpointTypeFormProps {
  /** 表单实例 */
  form: FormInstance;
  /** 初始值 */
  initialValues?: Partial<EndpointTypeConfig> | undefined;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 端点类型基本信息表单组件（右上）
 */
const EndpointTypeForm: React.FC<EndpointTypeFormProps> = ({
  form,
  initialValues,
  disabled = false,
}) => {
  /**
   * 初始化表单值
   */
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  return (
    <Form
      form={form}
      className="flex-shrink-0"
      layout="horizontal"
      labelCol={{ span: 6 }}
      disabled={disabled}
      initialValues={{
        status: true,
        schemaVersion: '1.0.0',
      }}
    >
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="typeName"
            label="类型名称"
            rules={[{ required: true, message: '请输入类型名称' }]}
          >
            <Input placeholder="请输入类型名称，如：HTTP端点" />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="typeCode"
            label="类型编码"
            rules={[
              { required: true, message: '请输入类型编码' },
              {
                pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
                message: '编码必须以字母开头，只能包含字母、数字和下划线',
              },
            ]}
          >
            <Input
              placeholder="请输入类型编码，如：http"
              disabled={!!initialValues?.id}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name="endpointType" label="端点类型">
            <Input placeholder="请输入端点类型标识" disabled={!!initialValues?.id} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="support_mode" label="支持模式">
            <Select options={MODE_OPTIONS as any} placeholder="请选择支持模式" />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name="icon" label="图标">
            <Input placeholder="请输入图标类名，如：icon-http" />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name="schemaVersion" label="Schema版本">
            <Input placeholder="请输入版本号，如：1.0.0" />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item name="description" label="描述" labelCol={{ span: 2 }}>
            <TextArea
              placeholder="请输入端点类型描述"
              rows={2}
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default React.memo(EndpointTypeForm);

