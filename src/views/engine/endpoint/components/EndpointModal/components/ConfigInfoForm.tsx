import { Divider } from 'antd';
import type React from 'react';
import type { SchemaField } from '@/services/engine/endpoint/types';
import SchemaFormFieldRenderer from '../../SchemaFormFieldRenderer';

interface ConfigInfoFormProps {
  /** 表单值（用于动态显示条件判断） */
  formValues: Record<string, any>;
  /** Schema 字段列表 */
  schemaFields: SchemaField[];
  /** 选中的模式 */
  selectedMode: string | undefined;
}

/**
 * 配置信息表单组件
 */
const ConfigInfoForm: React.FC<ConfigInfoFormProps> = ({ formValues, schemaFields, selectedMode }) => {
  if (!selectedMode || schemaFields.length === 0) {
    return <div className="text-center py-20 text-gray-400">当前端点类型在【{selectedMode}】模式下暂无配置项</div>;
  }

  return (
    <>
      <Divider titlePlacement="start">配置信息</Divider>
      <div className="flex flex-col gap-0">
        {schemaFields.map((field: SchemaField) => (
          <SchemaFormFieldRenderer key={field.field} field={field} formValues={formValues} />
        ))}
      </div>
    </>
  );
};

ConfigInfoForm.displayName = 'ConfigInfoForm';

export default ConfigInfoForm;
