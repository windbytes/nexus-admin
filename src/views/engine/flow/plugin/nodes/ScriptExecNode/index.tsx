import { Handle, Position } from '@xyflow/react';
import { Form, Input, Select } from 'antd';
import type { WorkflowNodeComponentProps, WorkflowNodeConfigPanelProps, WorkflowNodePlugin } from '../../types';

const ScriptExecNodeComponent: React.FC<WorkflowNodeComponentProps> = ({ id, data, selected }) => {
  const title = (data?.title as string) || '脚本执行';
  const lang = (data?.['language'] as string) || 'simple';
  return (
    <div
      style={{
        padding: '12px 16px',
        minWidth: 160,
        borderRadius: 8,
        border: selected ? '2px solid #fa8c16' : '1px solid #ffd591',
        backgroundColor: '#fff7e6',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <Handle type="target" position={Position.Left} id={`${id}-target`} />
      <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>处理器</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>{title}</div>
      <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{lang}</div>
      <Handle type="source" position={Position.Right} id={`${id}-source`} />
    </div>
  );
};

const ScriptExecNodeConfigPanel: React.FC<WorkflowNodeConfigPanelProps> = ({ data, onChange }) => {
  return (
    <Form layout="vertical" size="small">
      <Form.Item label="节点标题">
        <Input
          value={(data?.title as string) ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="脚本执行"
        />
      </Form.Item>
      <Form.Item label="脚本语言">
        <Select
          style={{ width: '100%' }}
          value={(data?.['language'] as string) ?? 'simple'}
          onChange={(language) => onChange({ language })}
          options={[
            { value: 'simple', label: 'Simple' },
            { value: 'groovy', label: 'Groovy' },
            { value: 'js', label: 'JavaScript' },
          ]}
        />
      </Form.Item>
      <Form.Item label="脚本内容">
        <Input.TextArea
          value={(data?.['script'] as string) ?? ''}
          onChange={(e) => onChange({ script: e.target.value })}
          placeholder="${body}"
          rows={6}
          style={{ fontFamily: 'monospace' }}
        />
      </Form.Item>
    </Form>
  );
};

export const scriptExecNodePlugin: WorkflowNodePlugin = {
  meta: {
    id: 'SCRIPT_EXEC',
    name: '脚本执行',
    version: '1.0.0',
    description: '通过脚本语言处理消息',
    endpointCategory: 'PROCESSOR',
  },
  defaultNodeData: {
    pluginId: 'SCRIPT_EXEC',
    title: '脚本执行',
    endpointCategory: 'PROCESSOR',
    language: 'simple',
    script: '${body}',
  },
  NodeComponent: ScriptExecNodeComponent,
  ConfigPanel: ScriptExecNodeConfigPanel,
};
