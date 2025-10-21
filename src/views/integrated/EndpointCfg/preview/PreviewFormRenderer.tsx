import React, { memo, useState } from 'react';
import { Form } from 'antd';
import type { FormInstance } from 'antd';
import { AppstoreAddOutlined } from '@ant-design/icons';
import type { SchemaField } from '@/services/integrated/endpointConfig/endpointConfigApi';
import PreviewFormField from './PreviewFormField';

interface PreviewFormRendererProps {
  /** 表单实例 */
  form: FormInstance;
  /** 字段配置列表 */
  fields: SchemaField[];
  /** 作用模式 */
  mode?: string;
  /** 初始值 */
  initialValues?: Record<string, any>;
}

/**
 * 预览表单渲染组件
 * 根据字段配置动态渲染整个表单
 * 使用 memo 避免不必要的重渲染
 */
const PreviewFormRenderer: React.FC<PreviewFormRendererProps> = ({
  form,
  fields,
  mode,
  initialValues = {},
}) => {
  /**
   * 合并字段的默认值到初始值中
   */
  const mergedInitialValues = React.useMemo(() => {
    const merged = { ...initialValues };
    
    fields.forEach(field => {
      // 如果字段有默认值且初始值中没有该字段，则使用默认值
      if (field.properties?.['defaultValue'] !== undefined && merged[field.field] === undefined) {
        merged[field.field] = field.properties?.['defaultValue'];
      }
    });
    
    return merged;
  }, [fields, initialValues]);

  const [formValues, setFormValues] = useState<Record<string, any>>(mergedInitialValues);

  /**
   * 表单值变化回调 - 使用 useCallback 优化
   */
  const handleValuesChange = React.useCallback((_changedValues: any, allValues: any) => {
    setFormValues(allValues);
  }, []);

  /**
   * 根据作用模式过滤并排序字段
   * 合并过滤和排序操作，减少一次遍历
   */
  const sortedFields = React.useMemo(() => {
    // 先过滤
    let filtered = fields;
    if (mode) {
      filtered = fields.filter(field => {
        // 如果字段没有指定 mode，则在所有模式下都显示
        if (!field.mode) return true;
        // 检查字段的 mode 是否匹配当前模式
        return field.mode.includes(mode);
      });
    }
    
    // 再排序
    return [...filtered].sort((a, b) => {
      const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }, [fields, mode]);

  if (sortedFields.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <AppstoreAddOutlined className="text-6xl text-gray-300 mb-4" />
          <p className="text-gray-400 text-base">
            {mode ? `当前模式 (${mode}) 下暂无字段配置` : '暂无字段配置'}
          </p>
        </div>
      </div>
    );
  }

  return (
      <Form
        form={form}
        layout="horizontal"
        initialValues={mergedInitialValues}
        onValuesChange={handleValuesChange}
        autoComplete="off"
      >
          {sortedFields.map((field: SchemaField) => (
            <div 
              key={field.field}
              style={{
                gridColumn: (field.component === 'TextArea' || field.component === 'JSON') 
                  ? '1 / -1' 
                  : 'auto'
              }}
            >
              <PreviewFormField field={field} formValues={formValues} />
            </div>
          ))}
      </Form>
  );
};

PreviewFormRenderer.displayName = 'PreviewFormRenderer';

// 使用 memo 优化，添加深度比较
export default memo(PreviewFormRenderer, (prevProps, nextProps) => {
  // 只有当关键属性真正改变时才重新渲染
  return (
    prevProps.form === nextProps.form &&
    prevProps.fields === nextProps.fields &&
    prevProps.mode === nextProps.mode &&
    prevProps.initialValues === nextProps.initialValues
  );
});

