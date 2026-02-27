import { Handle, Position } from '@xyflow/react';
import { Form, Input } from 'antd';
import type { WorkflowNodeComponentProps, WorkflowNodeConfigPanelProps, WorkflowNodePlugin } from '../../types';

const MsgFilterNodeComponent: React.FC<WorkflowNodeComponentProps> = ({ id, data, selected }) => {
  const title = (data?.title as string) || '消息过滤';
  return (
    <div
      style={{
        padding: '12px 16px',
        minWidth: 160,
        borderRadius: 8,
        border: selected ? '2px solid #faad14' : '1px solid #ffe58f',
        backgroundColor: '#fffbe6',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <Handle type="target" position={Position.Left} id={`${id}-target`} />
      <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>处理器</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>{title}</div>
      <Handle type="source" position={Position.Right} id={`${id}-source`} />
    </div>
  );
};

const MsgFilterNodeConfigPanel: React.FC<WorkflowNodeConfigPanelProps> = ({ data, onChange }) => {
  return (
    <Form layout="vertical" size="small">
      <Form.Item label="节点标题">
        <Input
          value={(data?.title as string) ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="消息过滤"
        />
      </Form.Item>
      <Form.Item label="过滤表达式" help="Camel Simple 语法，如 ${header.type} == 'order'">
        <Input.TextArea
          value={(data?.['expression'] as string) ?? ''}
          onChange={(e) => onChange({ expression: e.target.value })}
          placeholder="${body} != null"
          rows={3}
        />
      </Form.Item>
    </Form>
  );
};

export const msgFilterNodePlugin: WorkflowNodePlugin = {
  meta: {
    id: 'MSG_FILTER',
    name: '消息过滤',
    version: '1.0.0',
    description: '根据 Simple 表达式过滤消息',
    endpointCategory: 'PROCESSOR',
  },
  defaultNodeData: {
    pluginId: 'MSG_FILTER',
    title: '消息过滤',
    endpointCategory: 'PROCESSOR',
    expression: 'true',
  },
  NodeComponent: MsgFilterNodeComponent,
  ConfigPanel: MsgFilterNodeConfigPanel,
};
