import React from 'react';
import { Form, Input, Switch, InputNumber, Row, Col } from 'antd';
import type { ComponentConfigProps } from './index';

/**
 * 输入框组件配置
 */
const InputConfig: React.FC<ComponentConfigProps> = ({ value = {}, onChange }) => {
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
      onValuesChange={handleChange}
      labelCol={{ span: 10 }}
      wrapperCol={{ span: 14 }}
      initialValues={{
        placeholder: '',
        maxLength: undefined,
        showCount: false,
        allowClear: true,
        disabled: false,
        readOnly: false,
      }}
    >
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item
            name="placeholder"
            label="占位符"
            tooltip="输入框占位符文本"
          >
            <Input placeholder="请输入占位符" />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            name="maxLength"
            label="最大长度"
            tooltip="输入内容的最大长度"
          >
            <InputNumber 
              min={1} 
              max={1000} 
              placeholder="请输入最大长度"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="addonAfter"
            label="后置标签"
            tooltip="后置标签内容"
          >
            <Input placeholder="请输入后置标签" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="addonBefore"
            label="前置标签"
            tooltip="前置标签内容"
          >
            <Input placeholder="请输入前置标签" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="prefix"
            label="前缀"
            tooltip="前缀内容"
          >
            <Input placeholder="请输入前缀" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="suffix"
            label="后缀"
            tooltip="后缀内容"
          >
            <Input placeholder="请输入后缀" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="defaultValue"
            label="默认值"
            tooltip="不填入时显示的默认值"
          >
            <Input placeholder="请输入默认值" />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            name="id"
            label="ID"
            tooltip="输入框ID"
          >
            <Input placeholder="请输入ID" />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            name="showCount"
            label="显示字符数"
            valuePropName="checked"
            tooltip="是否显示字符数统计"
          >
            <Switch />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            name="allowClear"
            label="允许清除"
            valuePropName="checked"
            tooltip="是否显示清除按钮"
          >
            <Switch />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            name="disabled"
            label="禁用状态"
            valuePropName="checked"
            tooltip="是否禁用输入框"
          >
            <Switch />
          </Form.Item>
        </Col>

        <Col span={6}>
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

export default InputConfig;
