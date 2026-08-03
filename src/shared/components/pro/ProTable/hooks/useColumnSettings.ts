import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { ColumnFixed, ColumnSetting, ProColumnType } from '../types';

/**
 * 解析列唯一 key：优先 `col.key`，否则用 `dataIndex`（字符串或数组 join）。
 *
 * @typeParam T - 行数据类型
 * @param col - 列定义
 * @returns 列 key；无法解析时返回 `undefined`
 */
function getColumnKey<T>(col: ProColumnType<T>): string | undefined {
  if (col.key != null) {
    return String(col.key);
  }
  const dataIndex = col.dataIndex;
  if (typeof dataIndex === 'string') {
    return dataIndex;
  }
  if (Array.isArray(dataIndex)) {
    return dataIndex.map(String).join('.');
  }
  return undefined;
}

/**
 * 将 antd 列标题规范为 ReactNode（函数型 title 降级为 null）。
 *
 * @typeParam T - 行数据类型
 * @param title - 原始列标题
 * @returns 可用于列设置面板展示的 ReactNode
 */
function toTitleNode<T>(title: ProColumnType<T>['title']): ReactNode {
  if (typeof title === 'function') {
    return null;
  }
  return title as ReactNode;
}

/**
 * 从列定义生成列设置面板的初始配置。
 *
 * @typeParam T - 行数据类型
 * @param columns - ProTable 列定义
 * @returns 列设置项列表（含 key / title / show / fixed / order）
 */
function generateColumnSettings<T>(columns: ProColumnType<T>[]): ColumnSetting[] {
  const settings: ColumnSetting[] = [];

  const processColumns = (cols: ProColumnType<T>[], parentOrder = 0) => {
    cols.forEach((col, index) => {
      const key = getColumnKey(col);
      if (!key || col.hideInSetting) {
        return;
      }

      settings.push({
        key,
        title: toTitleNode(col.title),
        show: !col.defaultHidden,
        fixed: col.fixed as ColumnFixed,
        order: parentOrder + index,
        disabled: col.draggable === false,
      });

      if (col.children && col.children.length > 0) {
        processColumns(col.children, (parentOrder + index) * 1000);
      }
    });
  };

  processColumns(columns);
  return settings;
}

/**
 * 管理 ProTable 列的显示、排序与固定状态。
 *
 * @typeParam T - 行数据类型
 * @param columns - 原始列定义
 * @param initialSettings - 可选的持久化初始列设置；不传则由 `columns` 生成
 * @param onChange - 列设置变更回调（可用于持久化）
 * @returns 当前设置、更新/重置方法，以及按设置处理后的列定义
 */
export function useColumnSettings<T>(
  columns: ProColumnType<T>[],
  initialSettings?: ColumnSetting[],
  onChange?: (settings: ColumnSetting[]) => void
) {
  const defaultSettings = useMemo(() => generateColumnSettings(columns), [columns]);

  const [columnSettings, setColumnSettings] = useState<ColumnSetting[]>(() => {
    if (initialSettings && initialSettings.length > 0) {
      return initialSettings;
    }
    return defaultSettings;
  });

  const updateSettings = useCallback(
    (newSettings: ColumnSetting[]) => {
      setColumnSettings(newSettings);
      onChange?.(newSettings);
    },
    [onChange]
  );

  const resetSettings = useCallback(() => {
    updateSettings(defaultSettings);
  }, [defaultSettings, updateSettings]);

  const processedColumns = useMemo(() => {
    const settingsMap = new Map<string, ColumnSetting>();
    columnSettings.forEach((setting) => {
      settingsMap.set(setting.key, setting);
    });

    const processColumns = (cols: ProColumnType<T>[]): ProColumnType<T>[] => {
      return cols.flatMap((col) => {
        const key = getColumnKey(col);
        if (!key) {
          return [col];
        }

        const setting = settingsMap.get(key);
        if (!setting) {
          return [col];
        }

        if (!setting.show) {
          return [];
        }

        let children = col.children;
        if (children && children.length > 0) {
          children = processColumns(children);
        }

        return [
          {
            ...col,
            fixed: setting.fixed || col.fixed,
            children,
          },
        ];
      });
    };

    const sortedSettings = columnSettings.toSorted((a, b) => a.order - b.order);
    const orderMap = new Map<string, number>();
    sortedSettings.forEach((setting, index) => {
      orderMap.set(setting.key, index);
    });

    const sorted = columns.toSorted((a, b) => {
      const aKey = getColumnKey(a);
      const bKey = getColumnKey(b);
      const aOrder = aKey ? (orderMap.get(aKey) ?? 999) : 999;
      const bOrder = bKey ? (orderMap.get(bKey) ?? 999) : 999;
      return aOrder - bOrder;
    });

    return processColumns(sorted);
  }, [columns, columnSettings]);

  return {
    columnSettings,
    updateSettings,
    resetSettings,
    processedColumns,
  };
}
