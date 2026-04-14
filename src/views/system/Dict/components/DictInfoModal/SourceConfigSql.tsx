import { useQuery } from '@tanstack/react-query';
import { Button, Form, Input, InputNumber, Select } from 'antd';
import { memo, useEffect, useState } from 'react';
import { CodeEditor } from '@/components/CodeEditor';
import { datasourceService } from '@/services/resource/datasource/datasourceApi';
import { REFRESH_MODE_OPTIONS } from '../../constants';
import AddDatabaseConnectionModal from './AddDatabaseConnectionModal';

interface SourceConfigSqlProps {
  disabled?: boolean;
}

/**
 * SQL 数据源配置：查询 SQL 使用 CodeEditor；数据源为单选（后端连接列表）+ 新增连接入口；
 * 刷新方式与间隔
 */
const SourceConfigSql: React.FC<SourceConfigSqlProps> = ({ disabled }) => {
  const form = Form.useFormInstance();
  const [addConnectionOpen, setAddConnectionOpen] = useState(false);

  const { data: connections = [], isFetching } = useQuery({
    queryKey: ['resource', 'datasource', 'list'],
    queryFn: () => datasourceService.listBrief(),
    staleTime: 60_000,
  });

  useEffect(() => {
    const code = form.getFieldValue(['source', 'dbDatasourceName']) as string | undefined;
    if (!code || connections.length === 0) {
      return;
    }
    const found = connections.find((c) => c.code === code);
    if (found?.dbType != null) {
      form.setFieldValue(['source', 'dbType'], found.dbType);
    }
  }, [connections, form]);

  const syncDbTypeFromCode = (code: string | null) => {
    if (code == null) {
      form.setFieldValue(['source', 'dbType'], undefined);
      return;
    }
    const found = connections.find((c) => c.code === code);
    form.setFieldValue(['source', 'dbType'], found?.dbType);
  };

  return (
    <>
      <Form.Item label="查询 SQL" name={['source', 'sqlText']} rules={[{ required: true, message: '请输入查询 SQL' }]}>
        <CodeEditor language="sql" height="200px" readOnly={disabled} placeholder="如: SELECT id, name FROM t_dict" />
      </Form.Item>

      <Form.Item label="数据源" required>
        <div className="flex w-full min-w-0 gap-2">
          <Form.Item
            name={['source', 'dbDatasourceName']}
            noStyle
            rules={[{ required: true, message: '请选择数据源' }]}
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder={
                isFetching ? '加载中…' : connections.length ? '请选择数据源' : '暂无可用数据源，请先新增连接'
              }
              className="min-w-0 flex-1"
              disabled={disabled}
              loading={isFetching}
              options={connections.map((c) => ({
                label: `${c.name}（${c.dbType}）`,
                value: c.code,
              }))}
              onChange={syncDbTypeFromCode}
            />
          </Form.Item>
          <Button type="default" disabled={disabled} onClick={() => setAddConnectionOpen(true)}>
            新增连接
          </Button>
        </div>
      </Form.Item>

      <Form.Item name={['source', 'dbType']} hidden>
        <Input type="hidden" />
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

      <AddDatabaseConnectionModal open={addConnectionOpen} onCancel={() => setAddConnectionOpen(false)} />
    </>
  );
};

export default memo(SourceConfigSql);
