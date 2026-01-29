import { DatePicker, Form, Input, Select, Switch } from 'antd';
import React from 'react';
import type { ComponentConfigProps } from './index';

// 根据选择器类型返回对应的日期格式选项
const getFormatOptions = (pickerType: string): Array<{ value: string; label: string }> => {
  const formatOptionsMap: Record<string, Array<{ value: string; label: string }>> = {
    date: [
      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
      { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD' },
      { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY' },
      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
      { value: 'YYYY-MM-DD HH:mm:ss', label: 'YYYY-MM-DD HH:mm:ss' },
      { value: 'YYYY/MM/DD HH:mm:ss', label: 'YYYY/MM/DD HH:mm:ss' },
      { value: 'YYYY-MM-DD HH:mm', label: 'YYYY-MM-DD HH:mm' },
    ],
    week: [
      { value: 'YYYY-wo', label: 'YYYY-wo (第几周)' },
      { value: 'YYYY-[W]ww', label: 'YYYY-Www (W+周数)' },
      { value: 'gggg-wo', label: 'gggg-wo (ISO 年份)' },
    ],
    month: [
      { value: 'YYYY-MM', label: 'YYYY-MM' },
      { value: 'YYYY/MM', label: 'YYYY/MM' },
      { value: 'MM-YYYY', label: 'MM-YYYY' },
      { value: 'YYYY年MM月', label: 'YYYY年MM月' },
    ],
    quarter: [
      { value: 'YYYY-[Q]Q', label: 'YYYY-Q1/Q2/Q3/Q4' },
      { value: 'YYYY-[第]Q[季度]', label: 'YYYY-第1季度' },
      { value: 'YYYY[年第]Q[季度]', label: 'YYYY年第1季度' },
    ],
    year: [
      { value: 'YYYY', label: 'YYYY' },
      { value: 'YYYY[年]', label: 'YYYY年' },
    ],
  };

  return formatOptionsMap[pickerType] ?? formatOptionsMap['date']!;
};

// 根据选择器类型返回默认格式
const getDefaultFormat = (pickerType: string) => {
  const defaultFormatMap: Record<string, string> = {
    date: 'YYYY-MM-DD',
    week: 'YYYY-wo',
    month: 'YYYY-MM',
    quarter: 'YYYY-[Q]Q',
    year: 'YYYY',
  };

  return defaultFormatMap[pickerType] || 'YYYY-MM-DD';
};

/**
 * 日期选择器组件配置
 */
const DatePickerConfig: React.FC<ComponentConfigProps> = ({ value = {}, onChange }) => {
  const [form] = Form.useForm();

  // 监听 picker 类型变化
  const pickerType = Form.useWatch('picker', form) || 'date';

  // 处理配置变更
  const handleChange = (changedValues: any) => {
    const newConfig = { ...value, ...changedValues };

    // 如果 picker 类型改变，自动更新 format 为对应的默认格式
    if (changedValues.picker && changedValues.picker !== value.picker) {
      newConfig.format = getDefaultFormat(changedValues.picker);
      form.setFieldValue('format', newConfig.format);
    }

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
        picker: 'date',
        size: 'middle',
        showTime: false,
        allowClear: true,
        disabled: false,
        variant: 'outlined',
        inputReadOnly: false,
        showNow: false,
        showToday: true,
        needConfirm: false,
        placement: 'bottomLeft',
        minDate: undefined,
        maxDate: undefined,
      }}
    >
      <Form.Item name="picker" label="选择器类型" tooltip="设置选择器类型：日期、周、月、季度或年">
        <Select
          placeholder="请选择选择器类型"
          options={[
            { value: 'date', label: '日期选择器' },
            { value: 'week', label: '周选择器' },
            { value: 'month', label: '月选择器' },
            { value: 'quarter', label: '季度选择器' },
            { value: 'year', label: '年选择器' },
          ]}
        />
      </Form.Item>

      <Form.Item name="placeholder" label="占位符" tooltip="日期选择器占位符文本">
        <Input placeholder="请输入占位符" />
      </Form.Item>

      <Form.Item name="format" label="日期格式" tooltip="日期显示格式（根据选择器类型动态变化）">
        <Select placeholder="请选择日期格式" options={getFormatOptions(pickerType)} />
      </Form.Item>

      <Form.Item name="size" label="尺寸大小" tooltip="设置输入框尺寸">
        <Select
          placeholder="请选择尺寸"
          options={[
            { value: 'large', label: '大' },
            { value: 'middle', label: '中' },
            { value: 'small', label: '小' },
          ]}
        />
      </Form.Item>

      <Form.Item name="placement" label="弹出位置" tooltip="选择器弹出的位置">
        <Select
          placeholder="请选择弹出位置"
          options={[
            { value: 'bottomLeft', label: '底部左对齐' },
            { value: 'bottomRight', label: '底部右对齐' },
            { value: 'topLeft', label: '顶部左对齐' },
            { value: 'topRight', label: '顶部右对齐' },
          ]}
        />
      </Form.Item>

      <Form.Item name="showTime" label="显示时间" valuePropName="checked" tooltip="是否显示时间选择">
        <Switch />
      </Form.Item>

      <Form.Item name="showToday" label="显示今天按钮" valuePropName="checked" tooltip="是否显示【今天】按钮">
        <Switch />
      </Form.Item>

      <Form.Item
        name="showNow"
        label="显示此刻按钮"
        valuePropName="checked"
        tooltip="面板是否显示【此刻】按钮（showTime 为 true 时生效）"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        name="needConfirm"
        label="需要确认"
        valuePropName="checked"
        tooltip="是否需要确认按钮，默认点击日期即选中"
      >
        <Switch />
      </Form.Item>

      <Form.Item name="minDate" label="最小日期" tooltip="可选择的最小日期">
        <DatePicker placeholder="请选择最小日期" style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="maxDate" label="最大日期" tooltip="可选择的最大日期">
        <DatePicker placeholder="请选择最大日期" style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="allowClear" label="允许清除" valuePropName="checked" tooltip="是否显示清除按钮">
        <Switch />
      </Form.Item>

      <Form.Item name="disabled" label="禁用状态" valuePropName="checked" tooltip="是否禁用日期选择器">
        <Switch />
      </Form.Item>

      <Form.Item name="variant" label="形态变体" tooltip="形态变体">
        <Select
          placeholder="请选择形态变体"
          options={[
            { value: 'outlined', label: '描边' },
            { value: 'filled', label: '填充' },
            { value: 'borderless', label: '无边框' },
            { value: 'underlined', label: '下划线' },
          ]}
        />
      </Form.Item>

      <Form.Item
        name="inputReadOnly"
        label="输入框只读"
        valuePropName="checked"
        tooltip="设置输入框为只读（避免在移动设备上打开虚拟键盘）"
      >
        <Switch />
      </Form.Item>
    </Form>
  );
};

export default DatePickerConfig;
