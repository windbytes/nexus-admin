import React, { useState } from 'react';
import { Form, Input, Switch, Button, Row, Col, App } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ComponentConfigProps } from './index';

/**
 * 复选框组件配置
 */
const CheckboxConfig: React.FC<ComponentConfigProps> = ({ value = {}, onChange }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [options, setOptions] = useState<Array<{ label: string; value: string }>>(
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
    const newOption = { label: '', value: '' };
    setOptions(prev => [...prev, newOption]);
  };

  // 更新选项
  const handleUpdateOption = (index: number, field: 'label' | 'value', newValue: string) => {
    setOptions(prev => prev.map((option, i) => 
      i === index ? { ...option, [field]: newValue } : option
    ));
  };

  // 删除选项
  const handleDeleteOption = (index: number) => {
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleChange}
        initialValues={{
          disabled: false,
        }}
      >
        <Form.Item
          name="disabled"
          label="禁用状态"
          valuePropName="checked"
          tooltip="是否禁用复选框组"
        >
          <Switch />
        </Form.Item>
      </Form>

      <div style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 12, fontWeight: 500, fontSize: '14px' }}>选项配置</div>
        
        {/* 选项列表 */}
        {options.map((option, index) => (
          <div 
            key={index}
            style={{ 
              padding: '12px',
              marginBottom: 8,
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              backgroundColor: '#fafafa'
            }}
          >
            <Row gutter={12}>
              <Col span={10}>
                <div style={{ marginBottom: 4, fontSize: '12px', color: '#666' }}>显示文本</div>
                <Input
                  value={option.label}
                  onChange={(e) => handleUpdateOption(index, 'label', e.target.value)}
                  placeholder="请输入显示文本"
                />
              </Col>
              <Col span={10}>
                <div style={{ marginBottom: 4, fontSize: '12px', color: '#666' }}>选项值</div>
                <Input
                  value={option.value}
                  onChange={(e) => handleUpdateOption(index, 'value', e.target.value)}
                  placeholder="请输入选项值"
                />
              </Col>
              <Col span={4}>
                <div style={{ marginBottom: 4, fontSize: '12px', color: '#666' }}>操作</div>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteOption(index)}
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
          </div>
        ))}

        {/* 添加选项按钮 */}
        <Button 
          type="dashed" 
          icon={<PlusOutlined />} 
          onClick={handleAddOption}
          style={{ width: '100%', marginTop: 8 }}
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
    </div>
  );
};

export default CheckboxConfig;