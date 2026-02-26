/**
 * 工具栏下拉控件（带箭头，支持自定义 dropdownRender）
 * 点击下拉框内任意选项后自动关闭
 */
import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import { memo, useState } from 'react';
import { emit, type ToolEventPayload } from '../../core/eventBus';
import type { ToolItemConfig } from '../../types';

interface ToolItemDropdownProps {
  tool: ToolItemConfig;
  tabKey: string;
  groupKey?: string;
}

function ToolItemDropdown({ tool, tabKey, groupKey }: ToolItemDropdownProps) {
  const [open, setOpen] = useState(false);
  const overlay = tool.dropdownRender?.() ?? null;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      const payload: ToolEventPayload = { tabKey, groupKey, toolKey: tool.key, type: 'dropdown' };
      emit('tool.click', payload);
    }
  };

  const handleOverlayClick = () => {
    setOpen(false);
  };

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomLeft"
      open={open}
      onOpenChange={handleOpenChange}
      popupRender={() => (
        <div
          className="min-w-[120px] rounded border border-gray-200 bg-white p-2 shadow-lg"
          onClick={handleOverlayClick}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          role="presentation"
        >
          {overlay}
        </div>
      )}
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
