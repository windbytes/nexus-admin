import React from 'react';
import { Form, Input, Switch, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import type { ComponentConfigProps } from './index';

/**
 * 日期选择器组件配置
 */
const DatePickerConfig: React.FC<ComponentConfigProps> = ({ value = {}, onChange }) => {
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
        placeholder: '请选择日期',
        format: 'YYYY-MM-DD',
        showTime: false,
        allowClear: true,
        disabled: false,
        disabledDate: false,
        minDate: undefined,
        maxDate: undefined,
      }}
    >
      <Form.Item
        name="placeholder"
        label="占位符"
        tooltip="日期选择器占位符文本"
      >
        <Input placeholder="请输入占位符" />
      </Form.Item>

      <Form.Item
        name="format"
        label="日期格式"
        tooltip="日期显示格式"
      >
        <Select 
          placeholder="请选择日期格式"
          options={[
            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
            { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD' },
            { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY' },
            { value: 'YYYY-MM-DD HH:mm:ss', label: 'YYYY-MM-DD HH:mm:ss' },
            { value: 'YYYY/MM/DD HH:mm:ss', label: 'YYYY/MM/DD HH:mm:ss' },
          ]}
        />
      </Form.Item>

      <Form.Item
        name="showTime"
        label="显示时间"
        valuePropName="checked"
        tooltip="是否显示时间选择"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        name="minDate"
        label="最小日期"
        tooltip="可选择的最小日期"
      >
        <DatePicker 
          placeholder="请选择最小日期"
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        name="maxDate"
        label="最大日期"
        tooltip="可选择的最大日期"
      >
        <DatePicker 
          placeholder="请选择最大日期"
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
        tooltip="是否禁用日期选择器"
      >
        <Switch />
      </Form.Item>
    </Form>
  );
};

export default DatePickerConfig;
