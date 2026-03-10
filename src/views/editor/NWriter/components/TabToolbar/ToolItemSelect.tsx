/**
 * 工具栏 Select 控件（字体、字号等）
 */
import { Select } from 'antd';
import { memo } from 'react';
import { emit, type ToolEventPayload } from '../../core/eventBus';
import { executeCommand } from '../../core/extension';
import type { ToolItemConfig } from '../../types';

interface ToolItemSelectProps {
  tool: ToolItemConfig;
  tabKey: string;
  groupKey?: string;
}

function ToolItemSelect({ tool, tabKey, groupKey }: ToolItemSelectProps) {
  const options = tool.options ?? [];
  const value = tool.value ?? options[0]?.value;

  const handleChange = (val: string) => {
    const payload: ToolEventPayload = { tabKey, groupKey, toolKey: tool.key, type: 'select', value: val };
    emit('tool.selectChange', payload);
    if (tool.command) {
      executeCommand(tool.command, tool.key, val).catch(() => {});
    }
  };

  return (
    <Select
      size="small"
      value={value}
      onChange={handleChange}
      options={options.map((o) => ({ value: o.value, label: o.label }))}
      className="min-w-[80px]"
      placeholder={tool.label}
    />
  );
}

export default memo(ToolItemSelect);
