import React, { useState } from 'react';
import { Form, Input, Switch, Button, Space, Tag, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ComponentConfigProps } from './index';

/**
 * 下拉选择组件配置
 */
const SelectConfig: React.FC<ComponentConfigProps> = ({ value = {}, onChange }) => {
  const [form] = Form.useForm();
  const [options, setOptions] = useState<Array<{ label: string; value: string }>>(
    value.options || []
  );
  const [optionModalVisible, setOptionModalVisible] = useState(false);
  const [editingOption, setEditingOption] = useState<{ label: string; value: string } | null>(null);

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
    setEditingOption({ label: '', value: '' });
    setOptionModalVisible(true);
  };

  // 编辑选项
  const handleEditOption = (option: { label: string; value: string }) => {
    setEditingOption(option);
    setOptionModalVisible(true);
  };

  // 删除选项
  const handleDeleteOption = (value: string) => {
    setOptions(prev => prev.filter(option => option.value !== value));
  };

  // 保存选项
  const handleSaveOption = () => {
    if (!editingOption?.label || !editingOption?.value) return;

    const isEdit = options.some(option => option.value === editingOption.value);
    
    if (isEdit) {
      setOptions(prev => 
        prev.map(option => 
          option.value === editingOption.value ? editingOption : option
        )
      );
    } else {
      setOptions(prev => [...prev, editingOption]);
    }

    setOptionModalVisible(false);
    setEditingOption(null);
  };

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleChange}
        initialValues={{
          placeholder: '请选择',
          allowClear: true,
          disabled: false,
          mode: 'single',
        }}
      >
        <Form.Item
          name="placeholder"
          label="占位符"
          tooltip="选择框占位符文本"
        >
          <Input placeholder="请输入占位符" />
        </Form.Item>

        <Form.Item
          name="mode"
          label="选择模式"
          tooltip="单选或多选模式"
        >
          <Input placeholder="single 或 multiple" />
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
          tooltip="是否禁用选择框"
        >
          <Switch />
        </Form.Item>
      </Form>

      <div style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>选项配置</div>
        <Button 
          type="dashed" 
          icon={<PlusOutlined />} 
          onClick={handleAddOption}
          style={{ width: '100%' }}
        >
          添加选项
        </Button>
        
        <div style={{ marginTop: 8 }}>
          {options.map((option) => (
            <div 
              key={option.value} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '8px 12px',
                marginBottom: 4,
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                backgroundColor: '#fafafa'
              }}
            >
              <Space>
                <Tag color="blue">{option.label}</Tag>
                <span style={{ color: '#666' }}>{option.value}</span>
              </Space>
              <Space>
                <Button 
                  type="link" 
                  size="small" 
                  onClick={() => handleEditOption(option)}
                >
                  编辑
                </Button>
                <Button 
                  type="link" 
                  size="small" 
                  danger
                  onClick={() => handleDeleteOption(option.value)}
                >
                  删除
                </Button>
              </Space>
            </div>
          ))}
        </div>
      </div>

      <Modal
        title={editingOption && options.some(opt => opt.value === editingOption.value) ? "编辑选项" : "添加选项"}
        open={optionModalVisible}
        onOk={handleSaveOption}
        onCancel={() => {
          setOptionModalVisible(false);
          setEditingOption(null);
        }}
      >
        <Form layout="vertical">
          <Form.Item label="显示文本" required>
            <Input
              value={editingOption?.label}
              onChange={(e) => setEditingOption(prev => ({ ...prev!, label: e.target.value }))}
              placeholder="请输入显示文本"
            />
          </Form.Item>
          <Form.Item label="选项值" required>
            <Input
              value={editingOption?.value}
              onChange={(e) => setEditingOption(prev => ({ ...prev!, value: e.target.value }))}
              placeholder="请输入选项值"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SelectConfig;
