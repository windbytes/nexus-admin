import React from 'react';
import { Form, Input, Switch, Select } from 'antd';
import type { ComponentConfigProps } from './index';

/**
 * 开关组件配置
 */
const SwitchConfig: React.FC<ComponentConfigProps> = ({ value = {}, onChange }) => {
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
        checkedChildren: '启用',
        unCheckedChildren: '禁用',
        disabled: false,
        loading: false,
        size: 'default',
      }}
    >
      <Form.Item
        name="checkedChildren"
        label="选中时显示文本"
        tooltip="开关打开时显示的文字"
      >
        <Input placeholder="请输入选中时显示文本" />
      </Form.Item>

      <Form.Item
        name="unCheckedChildren"
        label="未选中时显示文本"
        tooltip="开关关闭时显示的文字"
      >
        <Input placeholder="请输入未选中时显示文本" />
      </Form.Item>

      <Form.Item
        name="size"
        label="开关大小"
        tooltip="开关的大小"
      >
        <Select 
          placeholder="请选择开关大小"
          options={[
            { value: 'default', label: '默认' },
            { value: 'small', label: '小' },
          ]}
        />
      </Form.Item>

      <Form.Item
        name="disabled"
        label="禁用状态"
        valuePropName="checked"
        tooltip="是否禁用开关"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        name="loading"
        label="加载状态"
        valuePropName="checked"
        tooltip="是否显示加载状态"
      >
        <Switch />
      </Form.Item>
    </Form>
  );
};

export default SwitchConfig;
