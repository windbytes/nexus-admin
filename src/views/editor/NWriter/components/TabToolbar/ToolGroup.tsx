import { Tooltip } from 'antd';
import { memo, useMemo } from 'react';
import type { ToolGroupConfig, ToolItemConfig } from '../../types';
import ToolItem from './ToolItem';

interface ToolGroupProps {
  group: ToolGroupConfig;
  tabKey: string;
  groupIndex: number;
}

function splitToolsByRow(tools: ToolItemConfig[], rows: 1 | 2): [ToolItemConfig[], ToolItemConfig[]] {
  if (rows === 1) {
    return [tools, []];
  }
  const hasRowIndex = tools.some((t) => t.rowIndex !== undefined);
  if (hasRowIndex) {
    const row1: ToolItemConfig[] = [];
    const row2: ToolItemConfig[] = [];
    for (const t of tools) {
      if (t.rowIndex === 1) {
        row2.push(t);
      } else {
        row1.push(t);
      }
    }
    return [row1, row2];
  }
  const mid = Math.ceil(tools.length / 2);
  return [tools.slice(0, mid), tools.slice(mid)];
}

/**
 * 工具栏分组：组间竖线分隔，组内 1 行或 2 行排列工具
 */
function ToolGroup({ group, tabKey, groupIndex }: ToolGroupProps) {
  const groupKey = group.key ?? `group-${groupIndex}`;
  const rows = group.rows ?? 1;
  const [row1Tools, row2Tools] = useMemo(() => splitToolsByRow(group.tools, rows), [group.tools, rows]);

  return (
    <div className="flex shrink-0 flex-col border-l border-gray-200 pl-2 first:border-l-0 first:pl-0">
      <div className="flex flex-wrap items-center gap-0.5">
        {row1Tools.map((tool) => (
          <Tooltip key={tool.key} title={tool.tooltip} placement="bottom">
            <ToolItem key={tool.key} tool={tool} tabKey={tabKey} groupKey={groupKey} />
          </Tooltip>
        ))}
      </div>
      {rows === 2 && row2Tools.length > 0 && (
        <div className="mt-0.5 flex flex-wrap items-center gap-0.5">
          {row2Tools.map((tool) => (
            <Tooltip key={tool.key} title={tool.tooltip} placement="bottom">
              <ToolItem key={tool.key} tool={tool} tabKey={tabKey} groupKey={groupKey} />
            </Tooltip>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(ToolGroup);
