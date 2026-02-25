/**
 * 工具栏下拉控件（带箭头，支持自定义 dropdownRender）
 */
import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import { memo } from 'react';
import { emit, type ToolEventPayload } from '../../core/eventBus';
import type { ToolItemConfig } from '../../types';

interface ToolItemDropdownProps {
  tool: ToolItemConfig;
  tabKey: string;
  groupKey?: string;
}

function ToolItemDropdown({ tool, tabKey, groupKey }: ToolItemDropdownProps) {
  const overlay = tool.dropdownRender?.() ?? null;

  const handleOpenChange = (open: boolean) => {
    if (open) {
      const payload: ToolEventPayload = { tabKey, groupKey, toolKey: tool.key, type: 'dropdown' };
      emit('tool.click', payload);
    }
  };

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomLeft"
      dropdownRender={() => (
        <div className="min-w-[120px] rounded border border-gray-200 bg-white p-2 shadow-lg">{overlay}</div>
      )}
      onOpenChange={handleOpenChange}
    >
      <Button
        type="text"
        size="small"
        title={tool.label}
        className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      >
        {tool.icon ?? tool.label}
        <DownOutlined className="ml-0.5 text-xs" />
      </Button>
    </Dropdown>
  );
}

export default memo(ToolItemDropdown);
