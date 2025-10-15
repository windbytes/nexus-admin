import React, { useState } from 'react';
import { Form, Input, Switch, Button, Select, Row, Col, InputNumber, App } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ComponentConfigProps } from './index';

/**
 * 下拉选择组件配置
 */
const SelectConfig: React.FC<ComponentConfigProps> = ({ value = {}, onChange }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [options, setOptions] = useState<Array<{ label: string; value: string; disabled: boolean }>>(
    value.options || []
  );

  // 处理配置变更
  const handleChange = (changedValues: any) => {
    const newConfig = { ...value, ...changedValues, options };
    onChange(newConfig);
  };

  // 初始化表单值
  React.useEffect(() => {
    form.setFieldsValue(value);
  }, [value, form]);

  // 更新options到配置中
  React.useEffect(() => {
    const newConfig = { ...value, options };
    onChange(newConfig);
  }, [options, onChange]);

  // 添加选项
  const handleAddOption = () => {
    // 验证：如果已经有选项，检查最后一个选项是否完整
    if (options.length > 0) {
      const lastOption = options[options.length - 1];
      const hasEmptyLabel = !lastOption?.label || lastOption.label.trim() === '';
      const hasEmptyValue = !lastOption?.value || lastOption.value.trim() === '';
      
      if (hasEmptyLabel && hasEmptyValue) {
        message.warning({
          content: '请先填写上一个选项的显示文本和选项值后再添加新选项',
          duration: 3,
        });
        return;
      }
      
      if (hasEmptyLabel) {
        message.warning({
          content: '请先填写上一个选项的显示文本后再添加新选项',
          duration: 3,
        });
        return;
      }
      
      if (hasEmptyValue) {
        message.warning({
          content: '请先填写上一个选项的选项值后再添加新选项',
          duration: 3,
        });
        return;
      }
    }
    
    // 验证通过，添加新选项
    const newOption = { label: '', value: '', disabled: false };
    setOptions(prev => [...prev, newOption]);
  };

  // 更新选项
  const handleUpdateOption = (index: number, field: 'label' | 'value' | 'disabled', newValue: string | boolean) => {
    setOptions(prev => prev.map((option, i) =>
      i === index ? { ...option, [field]: newValue } : option
    ));
  };

  // 删除选项
  const handleDeleteOption = (index: number) => {
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <Form
        form={form}
        layout="horizontal"
        onValuesChange={handleChange}
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 14 }}
        initialValues={{
          placeholder: '',
          allowClear: true,
          listHeight: 256,
          placement: 'bottomLeft',
          prefix: '',
          showSearch: false,
          disabled: false,
          mode: 'single',
        }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="placeholder"
              label="占位符"
              tooltip="选择框占位符文本"
            >
              <Input placeholder="请输入占位符" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="mode"
              label="选择模式"
              tooltip="单选或多选模式"
            >
              <Select placeholder="single 或 multiple" options={[{ value: 'single', label: '单选' }, { value: 'multiple', label: '多选' }]} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="listHeight"
              label="列表高度"
              tooltip="选择框列表高度"
            >
              <InputNumber placeholder="请输入列表高度" min={100} max={1000} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="placement"
              label="列表位置"
              tooltip="选择框列表位置"
            >
              <Select placeholder="bottomLeft 或 bottomRight" options={[{ value: 'bottomLeft', label: '底部左侧' }, { value: 'bottomRight', label: '底部右侧' }, { value: 'topLeft', label: '顶部左侧' }, { value: 'topRight', label: '顶部右侧' }]} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="prefix"
              label="前缀"
              tooltip="选择框前缀"
            >
              <Input placeholder="请输入前缀" />
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
              name="showSearch"
              label="显示搜索"
              valuePropName="checked"
              tooltip="是否显示搜索框"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="disabled"
              label="禁用状态"
              valuePropName="checked"
              tooltip="是否禁用选择框"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <div style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 12, fontWeight: 500, fontSize: '14px' }}>选项配置</div>

        {/* 选项列表 */}
        {options.map((option, index) => (
          <Row gutter={8} key={index} className='p-4 mb-2 border rounded-md border-[#d9d9d9] bg-[#fafafa]'>
            <Col span={9}>
              <div style={{ marginBottom: 4, fontSize: '12px', color: '#666' }}>显示文本</div>
              <Input
                value={option.label}
                onChange={(e) => handleUpdateOption(index, 'label', e.target.value)}
                placeholder="请输入显示文本"
              />
            </Col>
            <Col span={9}>
              <div style={{ marginBottom: 4, fontSize: '12px', color: '#666' }}>选项值</div>
              <Input
                value={option.value}
                onChange={(e) => handleUpdateOption(index, 'value', e.target.value)}
                placeholder="请输入选项值"
              />
            </Col>
            <Col span={3} className='text-center'>
              <div style={{ marginBottom: 4, fontSize: '12px', color: '#666' }}>是否禁用</div>
              <Switch
                checked={option.disabled}
                onChange={(checked) => handleUpdateOption(index, 'disabled', checked)}
              />
            </Col>
            <Col span={3} className='text-center'>
              <div style={{ marginBottom: 4, fontSize: '12px', color: '#666' }}>操作</div>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteOption(index)}
              />
            </Col>
          </Row>
        ))}

        {/* 添加选项按钮 */}
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleAddOption}
          style={{ width: '100%', marginTop: 8 }}
          size="small"
        >
          添加选项
        </Button>

        {options.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#999',
            fontSize: '12px',
            marginTop: 8,
            padding: '16px'
          }}>
            暂无选项，点击上方按钮添加选项
          </div>
        )}
      </div>
    </>
  );
};

export default SelectConfig;
