import React, { useEffect, useRef, useImperativeHandle } from 'react';
import { Form, Input, Switch, Row, Col, Select } from 'antd';
import type { FormInstance } from 'antd';
import { MODE_OPTIONS, type EndpointTypeConfig } from '@/services/integrated/endpointConfig/endpointConfigApi';
import { ENDPOINT_TYPE_OPTIONS } from '@/services/integrated/endpoint/endpointApi';

const { TextArea } = Input;

interface EndpointTypeFormProps {
  /** 表单实例 */
  form: FormInstance;
  /** 初始值 */
  initialValues?: Partial<EndpointTypeConfig> | undefined;
  /** 是否禁用 */
  disabled?: boolean;
  /** ref引用 */
  ref?: React.Ref<EndpointTypeFormRef>;
}

export interface EndpointTypeFormRef {
  /** 聚焦到类型名称输入框 */
  focusTypeName: () => void;
}

/**
 * 端点类型基本信息表单组件（右上）
 */
const EndpointTypeForm: React.FC<EndpointTypeFormProps> = ({
  form,
  initialValues,
  disabled = false,
  ref,
}) => {
  // 类型名称输入框的引用
  const typeNameInputRef = useRef<any>(null);

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    focusTypeName: () => {
      // 使用setTimeout确保DOM已渲染
      setTimeout(() => {
        if (typeNameInputRef.current) {
          typeNameInputRef.current.focus();
        }
      }, 100);
    },
  }));

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
            <Input 
              ref={typeNameInputRef}
              placeholder="请输入类型名称，如：HTTP端点" 
            />
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
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name="endpointType" label="端点分类" rules={[{ required: true, message: '请选择端点类型分类' }]}>
            <Select placeholder="请选择端点类型分类" options={ENDPOINT_TYPE_OPTIONS as any} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="supportMode" label="支持模式" rules={[{ required: true, message: '请选择支持模式' }]}>
            <Select 
              mode="multiple"
              options={MODE_OPTIONS as any} 
              placeholder="请选择支持模式" 
              maxTagCount="responsive"
            />
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

