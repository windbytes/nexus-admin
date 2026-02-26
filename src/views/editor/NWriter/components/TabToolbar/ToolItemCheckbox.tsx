/**
 * 工具栏复选框控件（如标尺、网格线）
 */
import { Checkbox } from 'antd';
import { memo } from 'react';
import { emit, type ToolEventPayload } from '../../core/eventBus';
import { executeCommand } from '../../core/extension';
import type { ToolItemConfig } from '../../types';

interface ToolItemCheckboxProps {
  tool: ToolItemConfig;
  tabKey: string;
  groupKey?: string;
}

function ToolItemCheckbox({ tool, tabKey, groupKey }: ToolItemCheckboxProps) {
  const checked = tool.checked ?? false;

  const handleChange = (e: { target: { checked: boolean } }) => {
    const val = e.target.checked;
    const payload: ToolEventPayload = { tabKey, groupKey, toolKey: tool.key, type: 'checkbox', value: val };
    emit('tool.checkChange', payload);
    if (tool.command) {
      executeCommand(tool.command, tool.key, val).catch(() => {});
    }
  };

  return (
    <Checkbox checked={checked} onChange={handleChange} className="text-gray-700">
      {tool.icon ?? tool.label}
    </Checkbox>
  );
}

export default memo(ToolItemCheckbox);
