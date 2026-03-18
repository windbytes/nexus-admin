import { Position } from '@xyflow/react';
import { Form, Input } from 'antd';
import { FlowHandle } from '../../../components/FlowHandle';
import type { WorkflowNodeComponentProps, WorkflowNodeConfigPanelProps, WorkflowNodePlugin } from '../../types';

const DbQueryNodeComponent: React.FC<WorkflowNodeComponentProps> = ({ id, data, selected }) => {
  const title = (data?.title as string) || '数据库操作';
  return (
    <div
      style={{
        padding: '12px 16px',
        minWidth: 160,
        borderRadius: 8,
        border: selected ? '2px solid #13c2c2' : '1px solid #87e8de',
        backgroundColor: '#e6fffb',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <FlowHandle type="target" position={Position.Left} id={`${id}-target`} />
      <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>连接器</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>{title}</div>
      <FlowHandle type="source" position={Position.Right} id={`${id}-source`} />
    </div>
  );
};

const DbQueryNodeConfigPanel: React.FC<WorkflowNodeConfigPanelProps> = ({ data, onChange }) => {
  return (
    <Form layout="vertical" size="small">
      <Form.Item label="节点标题">
        <Input
          value={(data?.title as string) ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="数据库操作"
        />
      </Form.Item>
      <Form.Item label="SQL 语句">
        <Input.TextArea
          value={(data?.['query'] as string) ?? ''}
          onChange={(e) => onChange({ query: e.target.value })}
          placeholder="SELECT * FROM ..."
          rows={4}
        />
      </Form.Item>
      <Form.Item label="数据源" help="Spring DataSource Bean 名称">
        <Input
          value={(data?.['dataSource'] as string) ?? ''}
          onChange={(e) => onChange({ dataSource: e.target.value })}
          placeholder="dataSource"
        />
      </Form.Item>
    </Form>
  );
};

export const dbQueryNodePlugin: WorkflowNodePlugin = {
  meta: {
    id: 'DB_QUERY',
    name: '数据库操作',
    version: '1.0.0',
    description: '执行 SQL 查询或写入',
    endpointCategory: 'CONNECTOR',
    runnable: true,
  },
  defaultNodeData: {
    pluginId: 'DB_QUERY',
    title: '数据库操作',
    endpointCategory: 'CONNECTOR',
    query: 'SELECT 1',
    dataSource: 'dataSource',
  },
  NodeComponent: DbQueryNodeComponent,
  ConfigPanel: DbQueryNodeConfigPanel,
};
