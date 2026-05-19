import { AppstoreAddOutlined } from '@ant-design/icons';
import type { FormInstance, InputNumberProps } from 'antd';
import { Divider, Form, InputNumber, Switch } from 'antd';
import React, { memo, useState } from 'react';
import type { EndpointTypeConfig, SchemaField } from '@/services/engine';
import PreviewFormField from './PreviewFormField';

/** 预览区内数字框占满控件列，避免 antd 默认 controlWidth=90px 过窄 */
const previewInputNumberStyles = {
  root: { width: '100%', maxWidth: '100%' },
} satisfies NonNullable<InputNumberProps['styles']>;

interface PreviewFormRendererProps {
  /** 表单实例 */
  form: FormInstance;
  /** 端点配置 */
  config: EndpointTypeConfig;
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
const PreviewFormRenderer: React.FC<PreviewFormRendererProps> = ({ form, config, mode = 'IN', initialValues = {} }) => {
  const { schemaFields: fields = [], supportRetry = false } = config;
  /**
   * 合并字段的默认值到初始值中
   */
  const mergedInitialValues = React.useMemo(() => {
    const merged = { ...initialValues };

    fields.forEach((field) => {
      // 如果字段有默认值且初始值中没有该字段，则使用默认值
      if (field.properties?.['defaultValue'] !== undefined && merged[field.field] === undefined) {
        merged[field.field] = field.properties?.['defaultValue'];
      }
    });

    return merged;
  }, [fields, initialValues]);

  const [formValues, setFormValues] = useState<Record<string, any>>(mergedInitialValues);
  /** 监听是否启用指数退避策略 */
  const useExponentialBackoff = Form.useWatch('useExponentialBackoff', form);
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
      filtered = fields.filter((field) => {
        // 如果字段没有指定 mode，则在所有模式下都显示
        if (!field.mode) {
          return true;
        }
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
          <p className="text-gray-400 text-base">{mode ? `当前模式 (${mode}) 下暂无字段配置` : '暂无字段配置'}</p>
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
      labelCol={{ flex: '0 0 120px' }}
      wrapperCol={{ flex: '1 1 auto', style: { minWidth: 0 } }}
      autoComplete="off"
    >
      {sortedFields.map((field: SchemaField) => (
        <PreviewFormField key={field.field} field={field} formValues={formValues} />
      ))}
      {/* 如果端点配置支持重试，这里需要添加重试相关的配置 */}
      {supportRetry && (
        <>
          <Divider orientation="horizontal" titlePlacement="left">
            重试策略
          </Divider>
          <Form.Item
            name="maximumRedeliveries"
            label="重试次数"
            tooltip="最大重试次数"
            rules={[{ required: true, message: '请输入重试次数' }]}
          >
            <InputNumber
              className="w-full min-w-0"
              placeholder="请输入重试次数"
              min={1}
              max={10}
              step={1}
              suffix="次"
              styles={previewInputNumberStyles}
            />
          </Form.Item>
          <Form.Item
            name="redeliveryDelay"
            label="初始延迟"
            tooltip="初始延迟时间"
            rules={[{ required: true, message: '请输入初始延迟' }]}
          >
            <InputNumber
              className="w-full min-w-0"
              placeholder="请输入初始延迟"
              min={50}
              max={10000}
              step={1000}
              suffix="ms"
              styles={previewInputNumberStyles}
            />
          </Form.Item>
          <Form.Item name="useExponentialBackoff" label="启用指数退避" valuePropName="checked">
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
          <Form.Item
            name="backOffMultiplier"
            label="退避倍数"
            tooltip="退避倍数"
            rules={[{ required: useExponentialBackoff, message: '请输入退避倍数' }]}
          >
            <InputNumber
              disabled={!useExponentialBackoff}
              className="w-full min-w-0"
              placeholder="请输入退避倍数"
              min={1}
              max={10}
              step={1}
              suffix="倍"
              styles={previewInputNumberStyles}
            />
          </Form.Item>
          <Form.Item
            name="maximumRedeliveryDelay"
            label="最大延迟"
            tooltip="最大延迟时间"
            rules={[{ required: true, message: '请输入最大延迟' }]}
          >
            <InputNumber
              className="w-full min-w-0"
              placeholder="请输入最大延迟"
              min={50}
              max={60000}
              step={1000}
              suffix="ms"
              styles={previewInputNumberStyles}
            />
          </Form.Item>
        </>
      )}
    </Form>
  );
};

PreviewFormRenderer.displayName = 'PreviewFormRenderer';

// 使用 memo 优化，添加深度比较
export default memo(PreviewFormRenderer, (prevProps, nextProps) => {
  // 只有当关键属性真正改变时才重新渲染
  return (
    prevProps.form === nextProps.form &&
    prevProps.config.schemaFields === nextProps.config.schemaFields &&
    prevProps.mode === nextProps.mode &&
    prevProps.initialValues === nextProps.initialValues
  );
});
