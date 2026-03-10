import { Handle, Position } from '@xyflow/react';
import { Form, Input } from 'antd';
import type { WorkflowNodeComponentProps, WorkflowNodeConfigPanelProps, WorkflowNodePlugin } from '../../types';

const ConditionNodeComponent: React.FC<WorkflowNodeComponentProps> = ({ id, data, selected }) => {
  const title = (data?.title as string) || '条件路由';
  return (
    <div
      style={{
        padding: '12px 16px',
        minWidth: 140,
        borderRadius: 8,
        border: selected ? '2px solid #eb2f96' : '1px solid #ffadd2',
        backgroundColor: '#fff0f6',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        transform: 'rotate(0deg)',
      }}
    >
      <Handle type="target" position={Position.Left} id={`${id}-target`} />
      <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>控制</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#333', textAlign: 'center' }}>{title}</div>
      <Handle type="source" position={Position.Right} id={`${id}-source-1`} style={{ top: '30%' }} />
      <Handle type="source" position={Position.Right} id={`${id}-source-2`} style={{ top: '70%' }} />
    </div>
  );
};

const ConditionNodeConfigPanel: React.FC<WorkflowNodeConfigPanelProps> = ({ data, onChange }) => {
  return (
    <Form layout="vertical" size="small">
      <Form.Item label="节点标题">
        <Input
          value={(data?.title as string) ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="条件路由"
        />
      </Form.Item>
      <Form.Item label="描述">
        <Input.TextArea
          value={(data?.['description'] as string) ?? ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="条件说明（分支条件在连线上配置）"
          rows={2}
        />
      </Form.Item>
    </Form>
  );
};

export const conditionNodePlugin: WorkflowNodePlugin = {
  meta: {
    id: 'CONDITION',
    name: '条件路由',
    version: '1.0.0',
    description: '根据条件表达式分流消息',
    endpointCategory: 'CONTROL',
  },
  defaultNodeData: {
    pluginId: 'CONDITION',
    title: '条件路由',
    endpointCategory: 'CONTROL',
  },
  NodeComponent: ConditionNodeComponent,
  ConfigPanel: ConditionNodeConfigPanel,
};
