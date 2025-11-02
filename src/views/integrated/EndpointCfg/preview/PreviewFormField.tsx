import CodeEditor from '@/components/CodeEditor';
import type { SchemaField } from '@/services/integrated/endpointConfig/endpointConfigApi';
import { App, Checkbox, DatePicker, Form, Input, InputNumber, Radio, Select, Switch } from 'antd';
import React, { memo } from 'react';
import JSONDynamicForm from './JSONDynamicForm';

const { TextArea, Password } = Input;

interface PreviewFormFieldProps {
  /** 字段配置 */
  field: SchemaField;
  /** 表单值（用于动态显示条件判断） */
  formValues?: Record<string, any>;
}

/**
 * 预览表单字段组件
 * 根据字段配置动态渲染对应的表单组件
 * 使用 memo 避免不必要的重渲染
 */
const PreviewFormField: React.FC<PreviewFormFieldProps> = memo(({ field, formValues = {} }) => {
  const { message } = App.useApp();
  /**
   * 安全地解析条件字符串，移除潜在的危险代码
   * 只允许安全的操作符和表达式
   */
  const sanitizeCondition = React.useCallback((condition: string): string => {
    // 移除潜在危险的关键字和操作
    const dangerousPatterns = [
      /\beval\b/gi,
      /\bFunction\b/gi,
      /\bsetTimeout\b/gi,
      /\bsetInterval\b/gi,
      /\bwindow\b/gi,
      /\bdocument\b/gi,
      /\blocation\b/gi,
      /\bimport\b/gi,
      /\brequire\b/gi,
      /\b__proto__\b/gi,
      /\bconstructor\b/gi,
    ];

    let sanitized = condition.trim();

    // 检查是否包含危险模式
    for (const pattern of dangerousPatterns) {
      if (pattern.test(sanitized)) {
        console.warn(`⚠️ 检测到潜在危险的表达式: ${pattern}`);
        throw new Error(`条件表达式包含不允许的操作: ${pattern.source}`);
      }
    }

    return sanitized;
  }, []);

  /**
   * 创建并缓存显示条件函数
   * 只有当 field.showCondition 改变时才重新创建
   * 使用 new Function 替代 eval，避免安全风险
   */
  const conditionFunc = React.useMemo(() => {
    if (!field.showCondition) return null;

    try {
      const condition = field.showCondition.trim();

      // 安全检查
      const sanitized = sanitizeCondition(condition);

      // 判断是否为箭头函数形式
      const isArrowFunction = /^\s*\(.*\)\s*=>/.test(sanitized);

      if (isArrowFunction) {
        // 箭头函数形式：(formValues) => formValues.needAuth
        // 提取函数体
        const match = sanitized.match(/^\s*\((.*?)\)\s*=>\s*(.+)$/);
        if (match) {
          const params = match[1]?.trim() || 'formValues';
          const body = match[2]?.trim() || 'true';

          // 使用 new Function 安全地创建函数
          return new Function(params, `return ${body}`);
        }
      } else if (sanitized.includes('function')) {
        // 不支持 function 关键字形式，提示用户使用箭头函数
        throw new Error('请使用箭头函数语法，例如: (formValues) => formValues.needAuth');
      }

      // 默认方式：作为 JS 表达式执行
      // 例如：formValues.needAuth === true
      // 使用 new Function，将 formValues 作为参数传入
      return new Function('formValues', `return ${sanitized}`);
    } catch (error: any) {
      console.error(`字段 ${field.field} 的显示条件创建失败:`, error);
      message.error(`字段 ${field.field} 的显示条件创建失败: ${error.message}`);
      return null; // 创建失败返回 null
    }
  }, [field.showCondition, field.field, sanitizeCondition, message]);

  /**
   * 检查字段是否应该显示
   * 将函数创建和函数执行分离，优化性能
   */
  const shouldShow = React.useMemo(() => {
    if (!conditionFunc) return true; // 没有条件或条件创建失败时默认显示

    try {
      return Boolean(conditionFunc(formValues));
    } catch (error: any) {
      message.error(`字段 ${field.field} 的显示条件执行失败: ${error}`);
      return true; // 执行失败时默认显示
    }
  }, [conditionFunc, formValues, field.field]);

  /**
   * 解析验证规则
   */
  const rules = React.useMemo(() => {
    const baseRules: any[] = [];

    // 解析自定义验证规则
    if (field.rules) {
      try {
        const customRules = JSON.parse(field.rules);
        if (Array.isArray(customRules)) {
          baseRules.push(...customRules);
        }
      } catch (error: any) {
        message.error(`字段 ${field.field} 的规则解析失败: ${error}`);
      }
    }

    return baseRules;
  }, [field.rules, field.label, field.field]);

  /**
   * 根据组件类型渲染表单控件
   */
  const renderFormControl = () => {
    const { component, properties = {} } = field;
    const { value, defaultValue, ...rest } = properties;

    switch (component) {
      case 'Input':
        return <Input {...rest} />;

      case 'InputPassword':
        return <Password {...rest} />;

      case 'InputNumber':
        return <InputNumber {...rest} className="w-full" />;

      case 'TextArea':
        return <TextArea {...rest} />;

      case 'JSON':
        const editorMode = rest['editorMode'] || 'editor'; // 默认为编辑器模式

        if (editorMode === 'form') {
          // 表单模式：使用动态表单组件
          return <JSONDynamicForm properties={rest} />;
        } else {
          // 编辑器模式：使用 CodeEditor
          return (
            <CodeEditor
              language="json"
              height={rest['height'] || '300px'}
              theme={rest['theme'] || 'vs'}
              showLineNumbers={rest['showLineNumbers'] !== false}
              showMinimap={rest['showMinimap'] === true}
              value={value ? JSON.stringify(value, null, 2) : '{}'}
              options={{
                readOnly: rest['disabled'],
                formatOnSave: rest['formatOnSave'] !== false,
                validateOnChange: rest['validateOnChange'] !== false,
                ...rest['options'],
              }}
              placeholder={rest['placeholder'] || '请输入JSON数据'}
            />
          );
        }

      case 'Select':
        return (
          <Select
            {...rest}
            filterOption={(input, option) =>
              ((option?.label ?? '') as string).toLowerCase().includes(input.toLowerCase())
            }
          />
        );

      case 'Radio':
        return <Radio.Group {...rest} />;

      case 'Checkbox':
        return <Checkbox.Group {...rest} />;

      case 'Switch':
        return <Switch {...rest} />;

      case 'DatePicker':
        return <DatePicker {...rest} className="w-full" />;

      default:
        return <Input placeholder={`不支持的组件类型: ${component}`} disabled />;
    }
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <Form.Item
      name={field.field}
      label={field.label}
      rules={rules}
      tooltip={field.description}
      valuePropName={field.component === 'Switch' ? 'checked' : 'value'}
    >
      {renderFormControl()}
    </Form.Item>
  );
});

PreviewFormField.displayName = 'PreviewFormField';

export default PreviewFormField;
