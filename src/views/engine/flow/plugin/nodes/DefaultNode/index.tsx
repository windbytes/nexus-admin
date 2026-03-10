import { Handle, Position } from '@xyflow/react';
import { Form, Input } from 'antd';
import type { WorkflowNodeComponentProps, WorkflowNodeConfigPanelProps, WorkflowNodePlugin } from '../../types';

/**
 * 默认渲染节点组件
 */
const DefaultNodeComponent: React.FC<WorkflowNodeComponentProps> = ({ id, data, selected }) => {
  const title = (data?.title as string) || '默认渲染节点部分';
  return (
    <div
      className="workflow-default-node"
      style={{
        padding: '12px 16px',
        minWidth: 160,
        borderRadius: 8,
        border: selected ? '2px solid #1677ff' : '1px solid #d9d9d9',
        backgroundColor: '#fff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <Handle type="target" position={Position.Top} id={`${id}-target`} style={{ top: '50%', left: 0 }} />
      <div className="workflow-default-node__label" style={{ fontSize: 13, color: '#333' }}>
        {title}
      </div>
      <Handle type="source" position={Position.Bottom} id={`${id}-source`} style={{ bottom: '50%', right: 0 }} />
    </div>
  );
};

/**
 * 默认渲染节点配置面板组件
 */
const DefaultNodeConfigPanel: React.FC<WorkflowNodeConfigPanelProps> = ({ nodeId, data, onChange }) => {
  return (
    <Form layout="vertical" size="small">
      <Form.Item label="节点标题">
        <Input
          value={(data?.title as string) ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="默认渲染节点部分"
        />
      </Form.Item>
      <Form.Item label="描述">
        <Input.TextArea
          value={(data?.['description'] as string) ?? ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="可选"
          rows={3}
        />
      </Form.Item>
    </Form>
  );
};

export const defaultNodePlugin: WorkflowNodePlugin = {
  meta: {
    id: 'workflow.default',
    name: '默认节点',
    version: '1.0.0',
    description: '默认渲染节点，用于占位或通用逻辑',
    endpointCategory: 'PROCESSOR',
  },
  defaultNodeData: {
    pluginId: 'workflow.default',
    title: '默认渲染节点部分',
    endpointCategory: 'PROCESSOR',
  },
  NodeComponent: DefaultNodeComponent,
  ConfigPanel: DefaultNodeConfigPanel,
};
