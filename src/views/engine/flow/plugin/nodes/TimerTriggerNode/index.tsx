import { Position } from '@xyflow/react';
import { Form, Input } from 'antd';
import { FlowHandle } from '../../../components/FlowHandle';
import type { WorkflowNodeComponentProps, WorkflowNodeConfigPanelProps, WorkflowNodePlugin } from '../../types';

const TimerTriggerNodeComponent: React.FC<WorkflowNodeComponentProps> = ({ id, data, selected }) => {
  const title = (data?.title as string) || '定时触发';
  return (
    <div
      style={{
        padding: '12px 16px',
        minWidth: 160,
        borderRadius: 8,
        border: selected ? '2px solid #722ed1' : '1px solid #d3adf7',
        backgroundColor: '#f9f0ff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>触发器</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>{title}</div>
      <FlowHandle type="source" position={Position.Right} id={`${id}-source`} />
    </div>
  );
};

const TimerTriggerNodeConfigPanel: React.FC<WorkflowNodeConfigPanelProps> = ({ data, onChange }) => {
  return (
    <Form layout="vertical" size="small">
      <Form.Item label="节点标题">
        <Input
          value={(data?.title as string) ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="定时触发"
        />
      </Form.Item>
      <Form.Item label="Cron 表达式" help="Quartz cron 格式，如 0 0/5 * * * ?">
        <Input
          value={(data?.['cron'] as string) ?? ''}
          onChange={(e) => onChange({ cron: e.target.value })}
          placeholder="0/30 * * * * ?"
        />
      </Form.Item>
    </Form>
  );
};

export const timerTriggerNodePlugin: WorkflowNodePlugin = {
  meta: {
    id: 'TIMER_TRIGGER',
    name: '定时触发',
    version: '1.0.0',
    description: '按 Cron 表达式定时触发流程',
    endpointCategory: 'TRIGGER',
  },
  defaultNodeData: {
    pluginId: 'TIMER_TRIGGER',
    title: '定时触发',
    endpointCategory: 'TRIGGER',
    cron: '0/30 * * * * ?',
  },
  NodeComponent: TimerTriggerNodeComponent,
  ConfigPanel: TimerTriggerNodeConfigPanel,
};
