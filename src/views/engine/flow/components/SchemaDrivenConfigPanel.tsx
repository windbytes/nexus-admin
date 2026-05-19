import { Form, Input, InputNumber, Select, Switch } from 'antd';
import { useEffect, useMemo } from 'react';

type JsonSchema = {
  type?: string;
  title?: string;
  description?: string;
  properties?: Record<string, JsonSchema & { enum?: unknown[]; default?: unknown }>;
  required?: string[];
};

export interface SchemaDrivenConfigPanelProps {
  /** JSON Schema（来自后端 t_engine_plugin_version.config_schema） */
  schema: unknown;
  /** 当前节点 data */
  value: Record<string, unknown>;
  /** 增量更新回调（写回 node.data） */
  onChange: (patch: Record<string, unknown>) => void;
}

function coerceSchema(schema: unknown): JsonSchema | null {
  if (!schema || typeof schema !== 'object') {
    return null;
  }
  return schema as JsonSchema;
}

function normalizeType(t: string | undefined): string | undefined {
  if (!t) {
    return undefined;
  }
  return t.toLowerCase();
}

/**
 * 通用 schema-driven 节点属性面板。
 *
 * - 仅覆盖常用字段类型：string/number/integer/boolean/enum
 * - 将表单值以“增量 patch”方式回写到 node.data，确保保存时进入 node_config
 */
export const SchemaDrivenConfigPanel: React.FC<SchemaDrivenConfigPanelProps> = ({ schema, value, onChange }) => {
  const jsonSchema = useMemo(() => coerceSchema(schema), [schema]);
  const [form] = Form.useForm();

  const properties = jsonSchema?.properties ?? {};
  const required = new Set(jsonSchema?.required ?? []);

  useEffect(() => {
    // 以 node.data 作为单一真源：每次外部 value 变化同步表单展示
    form.setFieldsValue(value);
  }, [form, value]);

  if (!jsonSchema || !properties || Object.keys(properties).length === 0) {
    return null;
  }

  return (
    <Form
      form={form}
      onValuesChange={(changed) => {
        onChange(changed as Record<string, unknown>);
      }}
    >
      {Object.entries(properties).map(([key, prop]) => {
        const type = normalizeType(prop.type);
        const label = prop.title ?? key;
        const help = prop.description;
        const rules = required.has(key) ? [{ required: true, message: `${label} 必填` }] : undefined;

        if (Array.isArray(prop.enum) && prop.enum.length > 0) {
          return (
            <Form.Item key={key} name={key} label={label} help={help} rules={rules}>
              <Select
                options={prop.enum.map((v) => ({ label: String(v), value: v as string | number | boolean }))}
                style={{ width: '100%' }}
              />
            </Form.Item>
          );
        }

        if (type === 'boolean') {
          return (
            <Form.Item key={key} name={key} label={label} help={help} valuePropName="checked" rules={rules}>
              <Switch />
            </Form.Item>
          );
        }

        if (type === 'number' || type === 'integer') {
          return (
            <Form.Item key={key} name={key} label={label} help={help} rules={rules}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          );
        }

        // 默认：string / unknown → Input
        return (
          <Form.Item key={key} name={key} label={label} help={help} rules={rules}>
            <Input />
          </Form.Item>
        );
      })}
    </Form>
  );
};
