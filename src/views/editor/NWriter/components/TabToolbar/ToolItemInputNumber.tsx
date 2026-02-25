/**
 * 工具栏数字输入控件（如页边距）
 */
import { InputNumber } from 'antd';
import { memo } from 'react';
import { executeCommand } from '../../core/extension';
import { emit, type ToolEventPayload } from '../../core/eventBus';
import type { ToolItemConfig } from '../../types';

interface ToolItemInputNumberProps {
  tool: ToolItemConfig;
  tabKey: string;
  groupKey?: string;
}

function ToolItemInputNumber({ tool, tabKey, groupKey }: ToolItemInputNumberProps) {
  const handleChange = (val: number | null) => {
    const payload: ToolEventPayload = { tabKey, groupKey, toolKey: tool.key, type: 'inputNumber', value: val };
    emit('tool.change', payload);
    if (tool.command) {
      executeCommand(tool.command, tool.key, val).catch(() => {});
    }
  };

  return (
    <span className="flex items-center gap-1">
      {tool.label && <span className="shrink-0 text-xs text-gray-600">{tool.label}</span>}
      <InputNumber
        size="small"
        min={tool.min}
        max={tool.max}
        step={tool.step ?? 0.1}
        addonAfter={tool.suffix}
        className="w-20"
        onChange={handleChange}
      />
    </span>
  );
}

export default memo(ToolItemInputNumber);
