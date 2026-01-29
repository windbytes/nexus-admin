import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DragOutlined,
  PushpinOutlined,
  SettingOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons';
import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Checkbox, Dropdown } from 'antd';
import { useState } from 'react';
import type { ColumnFixed, ColumnSetting } from '../types';
import './ColumnSetting.scss';

export interface ColumnSettingComponentProps {
  columns: ColumnSetting[];
  onChange: (settings: ColumnSetting[]) => void;
  onReset?: () => void;
}

interface SortableItemProps {
  column: ColumnSetting;
  onToggle: (key: string) => void;
  onFixedChange: (key: string, fixed: ColumnFixed) => void;
  onMoveUp: (key: string) => void;
  onMoveDown: (key: string) => void;
  isFirst: boolean;
  isLast: boolean;
}

/**
 * 可排序的列项
 */
function SortableItem({ column, onToggle, onFixedChange, onMoveUp, onMoveDown, isFirst, isLast }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.key,
    disabled: column.disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="column-setting-item">
      <div className="column-setting-item-content">
        <div className="column-setting-item-drag" {...attributes} {...listeners}>
          <DragOutlined />
        </div>
        <Checkbox checked={column.show} onChange={() => onToggle(column.key)} disabled={column.disabled}>
          {column.title as string}
        </Checkbox>
      </div>
      <div className="column-setting-item-actions">
        <Button
          type="text"
          size="small"
          icon={<ArrowUpOutlined />}
          disabled={isFirst || column.disabled}
          onClick={() => onMoveUp(column.key)}
        />
        <Button
          type="text"
          size="small"
          icon={<ArrowDownOutlined />}
          disabled={isLast || column.disabled}
          onClick={() => onMoveDown(column.key)}
        />
        <Dropdown
          menu={{
            items: [
              {
                key: 'left',
                label: '固定在左侧',
                icon: <VerticalAlignTopOutlined rotate={-90} />,
                onClick: () => onFixedChange(column.key, 'left'),
              },
              {
                key: 'none',
                label: '不固定',
                onClick: () => onFixedChange(column.key, false),
              },
              {
                key: 'right',
                label: '固定在右侧',
                icon: <VerticalAlignBottomOutlined rotate={-90} />,
                onClick: () => onFixedChange(column.key, 'right'),
              },
            ],
            selectedKeys: [column.fixed ? column.fixed : 'none'],
          }}
          trigger={['click']}
        >
          <Button type="text" size="small">
            {column.fixed === 'left' ? '左' : column.fixed === 'right' ? '右' : <PushpinOutlined />}
          </Button>
        </Dropdown>
      </div>
    </div>
  );
}

/**
 * 列设置面板组件
 */
export function ColumnSettingComponent({ columns, onChange, onReset }: ColumnSettingComponentProps) {
  const [open, setOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // 切换显示/隐藏
  const handleToggle = (key: string) => {
    const newColumns = columns.map((col) => (col.key === key ? { ...col, show: !col.show } : col));
    onChange(newColumns);
  };

  // 修改固定位置
  const handleFixedChange = (key: string, fixed: ColumnFixed) => {
    const newColumns = columns.map((col) => (col.key === key ? { ...col, fixed } : col));
    onChange(newColumns);
  };

  // 向上移动
  const handleMoveUp = (key: string) => {
    const index = columns.findIndex((col) => col.key === key);
    if (index <= 0) {
      return;
    }

    const newColumns = [...columns];
    [newColumns[index]!, newColumns[index - 1]!] = [newColumns[index - 1]!, newColumns[index]!];
    // 更新 order
    newColumns.forEach((col, idx) => {
      col.order = idx;
    });
    onChange(newColumns);
  };

  // 向下移动
  const handleMoveDown = (key: string) => {
    const index = columns.findIndex((col) => col.key === key);
    if (index < 0 || index >= columns.length - 1) {
      return;
    }

    const newColumns = [...columns];
    [newColumns[index]!, newColumns[index + 1]!] = [newColumns[index + 1]!, newColumns[index]!];
    // 更新 order
    newColumns.forEach((col, idx) => {
      col.order = idx;
    });
    onChange(newColumns);
  };

  // 拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = columns.findIndex((col) => col.key === active.id);
    const newIndex = columns.findIndex((col) => col.key === over.id);

    const newColumns = [...columns];
    const [removed] = newColumns.splice(oldIndex, 1);
    newColumns.splice(newIndex, 0, removed! as ColumnSetting);

    // 更新 order
    newColumns.forEach((col, idx) => {
      col.order = idx;
    });

    onChange(newColumns);
  };

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    const newColumns = columns.map((col) => (col.disabled ? col : { ...col, show: checked }));
    onChange(newColumns);
  };

  // 重置
  const handleReset = () => {
    onReset?.();
  };

  const content = (
    <div className="column-setting-panel">
      <div className="column-setting-header">
        <Checkbox
          indeterminate={columns.some((col) => col.show) && !columns.every((col) => col.show)}
          checked={columns.every((col) => col.show)}
          onChange={(e) => handleSelectAll(e.target.checked)}
        >
          列展示
        </Checkbox>
        <Button type="link" size="small" classNames={{ content: 'text-(--ant-color-primary)' }} onClick={handleReset}>
          重置
        </Button>
      </div>
      <div className="column-setting-list">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={columns.map((col) => col.key)} strategy={verticalListSortingStrategy}>
            {columns.map((col, index) => (
              <SortableItem
                key={col.key}
                column={col}
                onToggle={handleToggle}
                onFixedChange={handleFixedChange}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                isFirst={index === 0}
                isLast={index === columns.length - 1}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );

  return (
    <Dropdown
      popupRender={() => content}
      trigger={['click']}
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
    >
      <Button type="text" icon={<SettingOutlined />} />
    </Dropdown>
  );
}
