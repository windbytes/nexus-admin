import React, { useState, useEffect } from 'react';
import { SettingOutlined } from '@ant-design/icons';
import {
  InputConfig,
  InputNumberConfig,
  SelectConfig,
  DatePickerConfig,
  TextAreaConfig,
  RadioConfig,
  SwitchConfig,
  JSONConfig,
  type ComponentConfigProps,
} from '../component-configs';
import DragModal from '@/components/modal/DragModal';

interface ComponentConfigModalProps {
  /** 是否显示弹窗 */
  open: boolean;
  /** 关闭弹窗回调 */
  onCancel: () => void;
  /** 确认回调 */
  onOk: (properties: any) => void;
  /** 组件类型 */
  componentType: string;
  /** 当前配置 */
  currentProperties?: any;
}

/**
 * 组件配置弹窗
 */
const ComponentConfigModal: React.FC<ComponentConfigModalProps> = ({
  open,
  onCancel,
  onOk,
  componentType,
  currentProperties = {},
}) => {
  const [properties, setProperties] = useState<any>(currentProperties);

  // 当弹窗打开时，重置配置
  useEffect(() => {
    if (open) {
      setProperties(currentProperties);
    }
  }, [open, currentProperties]);

  // 获取组件配置组件
  const getComponentConfig = () => {
    const configProps: ComponentConfigProps = {
      value: properties,
      onChange: setProperties,
      componentType,
    };

    switch (componentType) {
      case 'Input':
      case 'InputPassword':
        return <InputConfig {...configProps} />;
      case 'InputNumber':
        return <InputNumberConfig {...configProps} />;
      case 'Select':
        return <SelectConfig {...configProps} />;
      case 'DatePicker':
        return <DatePickerConfig {...configProps} />;
      case 'TextArea':
        return <TextAreaConfig {...configProps} />;
      case 'Radio':
        return <RadioConfig {...configProps} />;
      case 'Switch':
        return <SwitchConfig {...configProps} />;
      case 'JSON':
        return <JSONConfig {...configProps} />;
      default:
        return <div>该组件类型暂不支持配置</div>;
    }
  };

  // 处理确认
  const handleOk = () => {
    onOk(properties);
    onCancel();
  };

  // 获取组件类型的中文名称
  const getComponentTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      Input: '输入框',
      InputPassword: '密码输入框',
      InputNumber: '数字输入框',
      Select: '下拉选择',
      DatePicker: '日期选择器',
      TextArea: '文本域',
      Radio: '单选框',
      Switch: '开关',
      JSON: 'JSON编辑器',
    };
    return typeMap[type] || type;
  };

  return (
    <DragModal
      centered
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SettingOutlined />
          {getComponentTypeName(componentType)} - 属性配置
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      width={1000}
      okText="确定"
      cancelText="取消"
      styles={{
        body: {
          maxHeight: '60vh',
          overflow: 'auto',
        },
      }}
    >
      {getComponentConfig()}
    </DragModal>
  );
};

export default ComponentConfigModal;
