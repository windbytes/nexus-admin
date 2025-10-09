import type React from 'react';
import { memo } from 'react';
import { FormOutlined, UploadOutlined, LinkOutlined } from '@ant-design/icons';
import './InputTypeSelector.scss';

export type InputType = 'manual' | 'file' | 'url';

interface InputTypeOption {
  value: InputType;
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface InputTypeSelectorProps {
  value?: InputType;
  onChange?: (value: InputType) => void;
  disabled?: boolean;
}

const inputTypeOptions: InputTypeOption[] = [
  {
    value: 'manual',
    icon: <FormOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
    title: '图形化编辑',
    description: '手动维护WSDL信息',
  },
  {
    value: 'file',
    icon: <UploadOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
    title: '上传文件',
    description: '上传WSDL文件',
  },
  {
    value: 'url',
    icon: <LinkOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
    title: 'URL获取',
    description: '通过URL获取WSDL',
  },
];

/**
 * 录入方式选择器组件（卡片样式）
 */
const InputTypeSelector: React.FC<InputTypeSelectorProps> = memo(
  ({ value, onChange, disabled }) => {
    const handleSelect = (typeValue: InputType) => {
      if (!disabled && onChange) {
        onChange(typeValue);
      }
    };

    return (
      <div className="input-type-selector">
        <div className="input-type-cards">
          {inputTypeOptions.map((option) => (
            <div
              key={option.value}
              className={`input-type-card ${value === option.value ? 'active' : ''} ${
                disabled ? 'disabled' : ''
              }`}
              onClick={() => handleSelect(option.value)}
            >
              <div className="card-icon">{option.icon}</div>
              <div className="card-title">{option.title}</div>
              <div className="card-description">{option.description}</div>
              {value === option.value && <div className="card-check">✓</div>}
            </div>
          ))}
        </div>
      </div>
    );
  },
);

InputTypeSelector.displayName = 'InputTypeSelector';

export default InputTypeSelector;

