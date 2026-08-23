/**
 * 根据 tool.type 分发到对应控件：Button / Dropdown / Select / Checkbox / InputNumber
 */
import { memo } from 'react';
import type { ToolItemConfig } from '../../types';
import ToolItemButton from './ToolItemButton';
import ToolItemCheckbox from './ToolItemCheckbox';
import ToolItemDropdown from './ToolItemDropdown';
import ToolItemInputNumber from './ToolItemInputNumber';
import ToolItemSelect from './ToolItemSelect';

interface ToolItemProps {
  tool: ToolItemConfig;
  tabKey: string;
  groupKey?: string;
}

function ToolItem({ tool, tabKey, groupKey }: ToolItemProps) {
  const type = tool.type ?? 'button';

  switch (type) {
    case 'button':
      return <ToolItemButton tool={tool} tabKey={tabKey} groupKey={groupKey} />;
    case 'dropdown':
      return <ToolItemDropdown tool={tool} tabKey={tabKey} groupKey={groupKey} />;
    case 'select':
      return <ToolItemSelect tool={tool} tabKey={tabKey} groupKey={groupKey} />;
    case 'checkbox':
      return <ToolItemCheckbox tool={tool} tabKey={tabKey} groupKey={groupKey} />;
    case 'inputNumber':
      return <ToolItemInputNumber tool={tool} tabKey={tabKey} groupKey={groupKey} />;
    default:
      return <ToolItemButton tool={tool} tabKey={tabKey} groupKey={groupKey} />;
  }
}

export default memo(ToolItem);
