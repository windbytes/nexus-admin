import React, { useMemo } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Radio,
  Switch,
  DatePicker,
  type FormInstance,
} from 'antd';
import type { FormSchemaField } from '@/services/integrated/endpoint/endpointApi';

const { TextArea, Password } = Input;

interface DynamicFormProps {
  /** Schema配置 */
  schema: FormSchemaField[];
  /** 表单实例 */
  form: FormInstance;
}

/**
 * 动态表单渲染组件
 * 根据Schema配置自动生成表单字段
 */
const DynamicForm: React.FC<DynamicFormProps> = ({ schema, form }) => {
  // 监听表单值变化
  const formValues = Form.useWatch([], form) || {};

  // 组件映射表
  const componentMap: Record<string, React.ComponentType<any>> = useMemo(
    () => ({
      Input,
      InputPassword: Password,
      InputNumber,
      TextArea,
      Select,
      Radio: Radio.Group,
      Switch,
      DatePicker,
    }),
    []
  );

  /**
   * 计算字段的实际值
   * @param value 配置值，可能是静态值或函数
   * @param context 上下文（表单值）
   */
  const computeValue = <T,>(
    value: T | ((values: any) => T) | undefined,
    context: any
  ): T | undefined => {
    if (typeof value === 'function') {
      return (value as (values: any) => T)(context);
    }
    return value;
  };

  /**
   * 渲染单个表单项
   */
  const renderFormItem = (item: FormSchemaField) => {
    // 获取对应的组件
    const Component = componentMap[item.component];

    if (!Component) {
      console.warn(`未找到组件: ${item.component}`);
      return null;
    }

    // 判断是否显示该字段
    if (item.show && !item.show(formValues)) {
      return null;
    }

    // 动态计算属性
    const componentProps = computeValue(item.componentProps, formValues) || {};
    const required = computeValue(item.required, formValues) || false;
    const defaultValue = computeValue(item.defaultValue, formValues);

    // 构建验证规则
    const rules = [...(item.rules || [])];
    if (required && !rules.some((rule) => rule.required)) {
      rules.push({
        required: true,
        message: `请${item.component === 'Select' ? '选择' : '输入'}${item.label}`,
      });
    }

    return (
      <Form.Item
        key={item.field}
        name={item.field}
        label={item.label}
        rules={rules}
        {...item.formItemProps}
        initialValue={defaultValue}
      >
        <Component {...componentProps} />
      </Form.Item>
    );
  };

  return <>{schema.map(renderFormItem)}</>;
};

export default React.memo(DynamicForm);

