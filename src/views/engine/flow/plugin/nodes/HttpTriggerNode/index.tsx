import { Position } from '@xyflow/react';
import { Form, Input, Select } from 'antd';
import { FlowHandle } from '../../../components/FlowHandle';
import type { WorkflowNodeComponentProps, WorkflowNodeConfigPanelProps, WorkflowNodePlugin } from '../../types';

const HttpTriggerNodeComponent: React.FC<WorkflowNodeComponentProps> = ({ id, data, selected }) => {
  const title = (data?.title as string) || 'HTTP 接收';
  const method = (data?.['method'] as string) || 'POST';
  return (
    <div
      style={{
        padding: '12px 16px',
        minWidth: 160,
        borderRadius: 8,
        border: selected ? '2px solid #1677ff' : '1px solid #91caff',
        backgroundColor: '#e6f4ff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>触发器</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>{title}</div>
      <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{method}</div>
      <FlowHandle type="source" position={Position.Right} id={`${id}-source`} />
    </div>
  );
};

const HttpTriggerNodeConfigPanel: React.FC<WorkflowNodeConfigPanelProps> = ({ data, onChange }) => {
  return (
    <Form layout="vertical" size="small">
      <Form.Item label="节点标题">
        <Input
          value={(data?.title as string) ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="HTTP 接收"
        />
      </Form.Item>
      <Form.Item label="接收路径">
        <Input
          value={(data?.['path'] as string) ?? ''}
          onChange={(e) => onChange({ path: e.target.value })}
          placeholder="/webhook/..."
        />
      </Form.Item>
      <Form.Item label="HTTP 方法">
        <Select
          style={{ width: '100%' }}
          value={(data?.['method'] as string) ?? 'POST'}
          onChange={(method) => onChange({ method })}
          options={[
            { value: 'GET', label: 'GET' },
            { value: 'POST', label: 'POST' },
            { value: 'PUT', label: 'PUT' },
            { value: 'DELETE', label: 'DELETE' },
          ]}
        />
      </Form.Item>
    </Form>
  );
};

export const httpTriggerNodePlugin: WorkflowNodePlugin = {
  meta: {
    id: 'HTTP_TRIGGER',
    name: 'HTTP 接收',
    version: '1.0.0',
    description: '接收 HTTP 请求触发流程',
    endpointCategory: 'TRIGGER',
  },
  defaultNodeData: {
    pluginId: 'HTTP_TRIGGER',
    title: 'HTTP 接收',
    endpointCategory: 'TRIGGER',
    method: 'POST',
    path: '/webhook/',
  },
  NodeComponent: HttpTriggerNodeComponent,
  ConfigPanel: HttpTriggerNodeConfigPanel,
};
