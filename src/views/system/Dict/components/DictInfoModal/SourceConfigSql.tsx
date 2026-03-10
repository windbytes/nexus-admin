import { Form, Input, InputNumber, Select } from 'antd';
import { memo } from 'react';
import { CodeEditor } from '@/components/CodeEditor';
import { DB_TYPE_OPTIONS, REFRESH_MODE_OPTIONS } from '../../constants';

interface SourceConfigSqlProps {
  disabled?: boolean;
}

/**
 * SQL 数据源配置：查询 SQL 使用 CodeEditor，其余为数据库类型、数据源名称、刷新方式与间隔
 */
const SourceConfigSql: React.FC<SourceConfigSqlProps> = ({ disabled }) => (
  <>
    <Form.Item label="查询 SQL" name={['source', 'sqlText']} rules={[{ required: true, message: '请输入查询 SQL' }]}>
      <CodeEditor language="sql" height="200px" readOnly={disabled} placeholder="如: SELECT id, name FROM t_dict" />
    </Form.Item>
    <Form.Item label="数据库类型" name={['source', 'dbType']}>
      <Select
        placeholder="请选择"
        allowClear
        options={DB_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
        disabled={disabled}
      />
    </Form.Item>
    <Form.Item label="数据源名称" name={['source', 'dbDatasourceName']}>
      <Input placeholder="在配置中心解析为 DSN" allowClear maxLength={100} disabled={disabled} />
    </Form.Item>
    <Form.Item label="刷新方式" name={['source', 'refreshMode']} initialValue="AUTO">
      <Select options={REFRESH_MODE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))} disabled={disabled} />
    </Form.Item>
    <Form.Item
      label="刷新间隔(秒)"
      name={['source', 'refreshIntervalSec']}
      rules={[
        ({ getFieldValue }) => ({
          validator(_, value) {
            const mode = getFieldValue(['source', 'refreshMode']);
            if (mode === 'AUTO' && (value == null || value < 1)) {
              return Promise.reject(new Error('自动刷新时必填且大于 0'));
            }
            return Promise.resolve();
          },
        }),
      ]}
    >
      <InputNumber placeholder="如 300" min={1} className="w-full" disabled={disabled} />
    </Form.Item>
  </>
);

export default memo(SourceConfigSql);
