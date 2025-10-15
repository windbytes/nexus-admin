import React from 'react';
import { Col, Form, InputNumber, Row, Switch, Input, Select } from 'antd';
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
      layout="horizontal"
      onValuesChange={handleChange}
      labelCol={{ span: 10 }}
      wrapperCol={{ span: 14 }}
      initialValues={{
        min: undefined,
        max: undefined,
        step: 1,
        precision: undefined,
        disabled: false,
        readOnly: false,
        placeholder: '',
        allowClear: true,
        controls: true,
        keyboard: true,
        stringMode: false,
        defaultValue: undefined,
        decimalSeparator: '.',
        size: 'middle',
        variant: 'outlined',
      }}
    >
      <Row gutter={16}>
        {/* 第一行：数值范围 */}
        <Col span={6}>
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
        </Col>

        <Col span={6}>
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
        </Col>

        <Col span={6}>
          <Form.Item
            name="step"
            label="步长"
            tooltip="每次改变步数，可以为小数"
          >
            <InputNumber
              min={0}
              step={0.1}
              placeholder="请输入步长"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            name="precision"
            label="精度"
            tooltip="数值精度，即小数位数"
          >
            <InputNumber
              min={0}
              max={20}
              placeholder="请输入精度"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>

        {/* 第二行：默认值和分隔符 */}
        <Col span={6}>
          <Form.Item
            name="defaultValue"
            label="默认值"
            tooltip="默认值"
          >
            <InputNumber
              placeholder="请输入默认值"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>

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
            name="decimalSeparator"
            label="小数点"
            tooltip="小数点符号"
          >
            <Input placeholder="默认为 ." />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            name="size"
            label="尺寸"
            tooltip="输入框大小"
          >
            <Select
              options={[
                { label: '大', value: 'large' },
                { label: '中', value: 'middle' },
                { label: '小', value: 'small' },
              ]}
              placeholder="请选择尺寸"
            />
          </Form.Item>
        </Col>

        {/* 第三行：前后缀 */}
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
            name="addonAfter"
            label="后置标签"
            tooltip="后置标签内容"
          >
            <Input placeholder="请输入后置标签" />
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
            name="variant"
            label="形态变体"
            tooltip="输入框形态变体"
          >
            <Select
              options={[
                { label: '描边', value: 'outlined' },
                { label: '填充', value: 'filled' },
                { label: '无边框', value: 'borderless' },
              ]}
              placeholder="请选择形态变体"
            />
          </Form.Item>
        </Col>

        {/* 第四行：开关选项 */}
        <Col span={6}>
          <Form.Item
            name="controls"
            label="增减按钮"
            valuePropName="checked"
            tooltip="是否显示增减按钮"
          >
            <Switch />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            name="keyboard"
            label="键盘快捷键"
            valuePropName="checked"
            tooltip="是否启用键盘快捷行为"
          >
            <Switch />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            name="stringMode"
            label="字符串模式"
            valuePropName="checked"
            tooltip="开启后支持高精度小数，以字符串形式返回值"
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

export default InputNumberConfig;
