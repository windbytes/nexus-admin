import React from 'react';
import { Col, Form, Input, InputNumber, Row, Switch } from 'antd';
import type { ComponentConfigProps } from './index';

/**
 * 文本域组件配置
 */
const TextAreaConfig: React.FC<ComponentConfigProps> = ({ value = {}, onChange }) => {
  const [form] = Form.useForm();

  // 处理配置变更
  const handleChange = (changedValues: any) => {
    const newConfig = { ...value, ...changedValues };
    onChange(newConfig);
  };

  // 初始化表单值
  React.useEffect(() => {
    form.setFieldsValue(value);
  }, [value, form]);

  return (
    <Form
      form={form}
      layout="horizontal"
      labelCol={{ span: 10 }}
      wrapperCol={{ span: 14 }}
      onValuesChange={handleChange}
      initialValues={{
        placeholder: '',
        rows: 4,
        maxLength: undefined,
        showCount: false,
        autoSize: false,
        allowClear: true,
        disabled: false,
        readOnly: false,
      }}
    >
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="placeholder"
            label="占位符"
            tooltip="文本域占位符文本"
          >
            <Input placeholder="请输入占位符" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="rows"
            label="行数"
            tooltip="文本域行数"
          >
            <InputNumber
              min={1}
              max={20}
              placeholder="请输入行数"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="maxLength"
            label="最大长度"
            tooltip="输入内容的最大长度"
          >
            <InputNumber
              min={1}
              max={10000}
              placeholder="请输入最大长度"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="showCount"
            label="显示字符数"
            valuePropName="checked"
            tooltip="是否显示字符数统计"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="autoSize"
            label="自适应高度"
            valuePropName="checked"
            tooltip="是否根据内容自动调整高度"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="allowClear"
            label="允许清除"
            valuePropName="checked"
            tooltip="是否显示清除按钮"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="disabled"
            label="禁用状态"
            valuePropName="checked"
            tooltip="是否禁用文本域"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="readOnly"
            label="只读状态"
            valuePropName="checked"
            tooltip="是否只读"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default TextAreaConfig;
