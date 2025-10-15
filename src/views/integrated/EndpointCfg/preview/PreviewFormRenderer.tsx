import React, { memo, useState, useCallback } from 'react';
import { Form, Row, Col } from 'antd';
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
const PreviewFormRenderer: React.FC<PreviewFormRendererProps> = memo(({
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
      if (field.defaultValue !== undefined && merged[field.field] === undefined) {
        merged[field.field] = field.defaultValue;
      }
    });
    
    return merged;
  }, [fields, initialValues]);

  const [formValues, setFormValues] = useState<Record<string, any>>(mergedInitialValues);

  /**
   * 表单值变化回调
   */
  const handleValuesChange = useCallback((_changedValues: any, allValues: any) => {
    setFormValues(allValues);
  }, []);

  /**
   * 根据作用模式过滤字段
   */
  const filteredFields = React.useMemo(() => {
    if (!mode) return fields;
    
    return fields.filter(field => {
      // 如果字段没有指定 mode，则在所有模式下都显示
      if (!field.mode) return true;
      
      // 检查字段的 mode 是否匹配当前模式
      return field.mode.includes(mode);
    });
  }, [fields, mode]);

  /**
   * 按排序号排序字段
   */
  const sortedFields = React.useMemo(() => {
    return [...filteredFields].sort((a, b) => {
      const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }, [filteredFields]);

  /**
   * 根据组件类型计算字段的响应式列宽
   */
  const getFieldColSpan = (component: string) => {
    // TextArea 和 JSON 编辑器占满一整行
    if (component === 'TextArea' || component === 'JSON') {
      return { xs: 24, sm: 24, md: 24, lg: 24, xl: 24, xxl: 24 };
    }
    
    // 其他组件在大屏显示 2 列，中小屏显示 1 列
    return { xs: 24, sm: 24, md: 24, lg: 12, xl: 12, xxl: 12 };
  };

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
    <div className="preview-form-renderer">
      <Form
        form={form}
        layout="vertical"
        initialValues={mergedInitialValues}
        onValuesChange={handleValuesChange}
        autoComplete="off"
      >
        <Row gutter={[16, 0]}>
          {sortedFields.map((field) => (
            <Col key={field.id || field.field} {...getFieldColSpan(field.component)}>
              <PreviewFormField field={field} formValues={formValues} />
            </Col>
          ))}
        </Row>
      </Form>

      <style>{`
        .preview-form-renderer .ant-form-item {
          margin-bottom: 20px;
        }
        
        .preview-form-renderer .ant-form-item-label {
          padding-bottom: 4px;
        }
        
        .preview-form-renderer .ant-form-item-label > label {
          font-weight: 500;
          color: #262626;
        }
      `}</style>
    </div>
  );
});

PreviewFormRenderer.displayName = 'PreviewFormRenderer';

export default PreviewFormRenderer;

