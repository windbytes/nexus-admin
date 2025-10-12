import React from 'react';
import { Form, Input, Switch, InputNumber } from 'antd';
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
      layout="vertical"
      onValuesChange={handleChange}
      initialValues={{
        placeholder: '',
        maxLength: undefined,
        showCount: false,
        allowClear: true,
        disabled: false,
        readOnly: false,
      }}
    >
      <Form.Item
        name="placeholder"
        label="占位符"
        tooltip="输入框占位符文本"
      >
        <Input placeholder="请输入占位符" />
      </Form.Item>

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

      <Form.Item
        name="showCount"
        label="显示字符数"
        valuePropName="checked"
        tooltip="是否显示字符数统计"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        name="allowClear"
        label="允许清除"
        valuePropName="checked"
        tooltip="是否显示清除按钮"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        name="disabled"
        label="禁用状态"
        valuePropName="checked"
        tooltip="是否禁用输入框"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        name="readOnly"
        label="只读状态"
        valuePropName="checked"
        tooltip="是否只读"
      >
        <Switch />
      </Form.Item>
    </Form>
  );
};

export default InputConfig;
