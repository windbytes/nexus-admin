import { Button } from 'antd';
import { memo } from 'react';
import { emit, type ToolEventPayload } from '../../core/eventBus';
import { executeCommand } from '../../core/extension';
import type { ToolItemConfig } from '../../types';

interface ToolItemButtonProps {
  tool: ToolItemConfig;
  tabKey: string;
  groupKey?: string;
}
/**
 * 工具栏按钮控件（直接点击）
 */
function ToolItemButton({ tool, tabKey, groupKey }: ToolItemButtonProps) {
  const handleClick = () => {
    const payload: ToolEventPayload = { tabKey, groupKey, toolKey: tool.key, type: 'button' };
    emit('tool.click', payload);
    if (tool.command) {
      executeCommand(tool.command, tool.key).catch(() => {});
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {tool.label && <span className="shrink-0 text-xs text-gray-600">{tool.icon}</span>}
      <Button
        type="text"
        size="small"
        onClick={handleClick}
        className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      >
        {tool.label ?? tool.icon}
      </Button>
    </div>
  );
}

export default memo(ToolItemButton);
