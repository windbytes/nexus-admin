import { Position } from '@xyflow/react';
import { Form, Input, Select } from 'antd';
import { FlowHandle } from '../../../components/FlowHandle';
import type { WorkflowNodeComponentProps, WorkflowNodeConfigPanelProps, WorkflowNodePlugin } from '../../types';

const HttpConnectorNodeComponent: React.FC<WorkflowNodeComponentProps> = ({ id, data, selected }) => {
  const title = (data?.title as string) || 'HTTP 调用';
  const method = (data?.['method'] as string) || 'GET';
  return (
    <div
      style={{
        padding: '12px 16px',
        minWidth: 160,
        borderRadius: 8,
        border: selected ? '2px solid #52c41a' : '1px solid #b7eb8f',
        backgroundColor: '#f6ffed',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <FlowHandle type="target" position={Position.Left} id={`${id}-target`} />
      <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>连接器</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>{title}</div>
      <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{method}</div>
      <FlowHandle type="source" position={Position.Right} id={`${id}-source`} />
    </div>
  );
};

const HttpConnectorNodeConfigPanel: React.FC<WorkflowNodeConfigPanelProps> = ({ data, onChange }) => {
  return (
    <Form layout="vertical" size="small">
      <Form.Item label="节点标题">
        <Input
          value={(data?.title as string) ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="HTTP 调用"
        />
      </Form.Item>
      <Form.Item label="目标 URL">
        <Input
          value={(data?.['url'] as string) ?? ''}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="https://api.example.com/data"
        />
      </Form.Item>
      <Form.Item label="HTTP 方法">
        <Select
          style={{ width: '100%' }}
          value={(data?.['method'] as string) ?? 'GET'}
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

export const httpConnectorNodePlugin: WorkflowNodePlugin = {
  meta: {
    id: 'HTTP_CONNECTOR',
    name: 'HTTP 调用',
    version: '1.0.0',
    description: '向外部 HTTP 服务发起请求',
    endpointCategory: 'CONNECTOR',
  },
  defaultNodeData: {
    pluginId: 'HTTP_CONNECTOR',
    title: 'HTTP 调用',
    endpointCategory: 'CONNECTOR',
    method: 'GET',
    url: '',
  },
  NodeComponent: HttpConnectorNodeComponent,
  ConfigPanel: HttpConnectorNodeConfigPanel,
};
