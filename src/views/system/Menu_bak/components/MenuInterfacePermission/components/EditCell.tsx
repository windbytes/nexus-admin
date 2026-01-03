import type { InputRef } from 'antd';
import { Form, Input, Select } from 'antd';
import type React from 'react';

interface EditCellProps {
  value: string;
  error?: string;
  inputRef?: React.RefObject<InputRef | null>;
  placeholder?: string;
  onChange: (value: string) => void;
  type?: 'input' | 'select';
  options?: Array<{ label: string; value: string }>;
}

/**
 * 编辑单元格组件
 */
const EditCell: React.FC<EditCellProps> = ({
  value,
  error,
  inputRef,
  placeholder,
  onChange,
  type = 'input',
  options,
}) => {
  if (type === 'select' && options) {
    return (
      <Form.Item validateStatus={error ? 'error' : ''} help={error} style={{ marginBottom: 0 }}>
        <Select
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          status={error ? 'error' : ''}
          options={options}
        />
      </Form.Item>
    );
  }

  return (
    <Form.Item validateStatus={error ? 'error' : ''} help={error} style={{ marginBottom: 0 }}>
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        status={error ? 'error' : ''}
      />
    </Form.Item>
  );
};

EditCell.displayName = 'EditCell';

export default EditCell;
