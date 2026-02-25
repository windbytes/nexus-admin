/**
 * 工具栏按钮控件（直接点击）
 */
import { Button } from 'antd';
import { memo } from 'react';
import { executeCommand } from '../../core/extension';
import { emit, type ToolEventPayload } from '../../core/eventBus';
import type { ToolItemConfig } from '../../types';

interface ToolItemButtonProps {
  tool: ToolItemConfig;
  tabKey: string;
  groupKey?: string;
}

function ToolItemButton({ tool, tabKey, groupKey }: ToolItemButtonProps) {
  const handleClick = () => {
    const payload: ToolEventPayload = { tabKey, groupKey, toolKey: tool.key, type: 'button' };
    emit('tool.click', payload);
    if (tool.command) {
      executeCommand(tool.command, tool.key).catch(() => {});
    }
  };

  return (
    <Button
      type="text"
      size="small"
      title={tool.label}
      onClick={handleClick}
      className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    >
      {tool.icon ?? tool.label}
    </Button>
  );
}

export default memo(ToolItemButton);
