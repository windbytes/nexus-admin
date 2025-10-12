import React from 'react';
import { Form, InputNumber, Switch } from 'antd';
import type { ComponentConfigProps } from './index';

/**
 * 数字输入框组件配置
 */
const InputNumberConfig: React.FC<ComponentConfigProps> = ({ value = {}, onChange }) => {
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
        min: undefined,
        max: undefined,
        step: 1,
        precision: undefined,
        disabled: false,
        readOnly: false,
        placeholder: '',
        allowClear: true,
      }}
    >
      <Form.Item
        name="min"
        label="最小值"
        tooltip="输入的最小值"
      >
        <InputNumber 
          placeholder="请输入最小值"
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        name="max"
        label="最大值"
        tooltip="输入的最大值"
      >
        <InputNumber 
          placeholder="请输入最大值"
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        name="step"
        label="步长"
        tooltip="每次改变步数，可以为小数"
      >
        <InputNumber 
          min={0.1}
          step={0.1}
          placeholder="请输入步长"
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        name="precision"
        label="精度"
        tooltip="数值精度，即小数位数"
      >
        <InputNumber 
          min={0}
          max={10}
          placeholder="请输入精度"
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        name="placeholder"
        label="占位符"
        tooltip="输入框占位符文本"
      >
        <InputNumber 
          placeholder="请输入占位符"
          style={{ width: '100%' }}
        />
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

export default InputNumberConfig;
