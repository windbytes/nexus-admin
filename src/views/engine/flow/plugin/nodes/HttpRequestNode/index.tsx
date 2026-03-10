import { Handle, Position } from '@xyflow/react';
import { Form, Input, Select } from 'antd';
import type { WorkflowNodeComponentProps, WorkflowNodeConfigPanelProps, WorkflowNodePlugin } from '../../types';

/**
 * HTTP 请求节点组件
 * 这里可以根据类型决定出口和入口
 */
const HttpRequestNodeComponent: React.FC<WorkflowNodeComponentProps> = ({ id, data, selected }) => {
  const title = (data?.title as string) || 'HTTP 请求';
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
      <Handle type="target" position={Position.Left} id={`${id}-target`} />
      <div style={{ fontSize: 13, color: '#333' }}>{title}</div>
      <Handle type="source" position={Position.Right} id={`${id}-source`} />
    </div>
  );
};

/**
 * HTTP 请求节点配置面板组件
 */
const HttpRequestNodeConfigPanel: React.FC<WorkflowNodeConfigPanelProps> = ({ data, onChange }) => {
  return (
    <Form layout="vertical" size="small">
      <Form.Item label="节点标题">
        <Input
          value={(data?.title as string) ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="HTTP 请求"
        />
      </Form.Item>
      <Form.Item label="请求方法">
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
      <Form.Item label="URL">
        <Input
          value={(data?.['url'] as string) ?? ''}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="https://"
        />
      </Form.Item>
    </Form>
  );
};

export const httpRequestNodePlugin: WorkflowNodePlugin = {
  meta: {
    id: 'workflow.http',
    name: 'HTTP 请求',
    version: '1.0.0',
    description: '调用外部 HTTP 接口',
    endpointCategory: 'CONNECTOR',
  },
  defaultNodeData: {
    pluginId: 'workflow.http',
    title: 'HTTP 请求',
    endpointCategory: 'CONNECTOR',
    method: 'GET',
    url: '',
  },
  NodeComponent: HttpRequestNodeComponent,
  ConfigPanel: HttpRequestNodeConfigPanel,
};
