import { useCallback, useMemo, useState } from 'react';
import type { ColumnFixed, ColumnSetting, ProColumnType } from '../types';

/**
 * 从列配置生成列设置
 */
function generateColumnSettings<T>(columns: ProColumnType<T>[]): ColumnSetting[] {
  const settings: ColumnSetting[] = [];

  const processColumns = (cols: ProColumnType<T>[], parentOrder = 0) => {
    cols.forEach((col, index) => {
      // 跳过没有 key 或 dataIndex 的列
      const key = col.key || (typeof col.dataIndex === 'string' ? col.dataIndex : col.dataIndex?.join('.'));
      if (!key || col.hideInSetting) {
        return;
      }

      settings.push({
        key,
        title: col.title,
        show: !col.defaultHidden,
        fixed: col.fixed as ColumnFixed,
        order: parentOrder + index,
        disabled: col.draggable === false,
      });

      // 处理子列
      if (col.children && col.children.length > 0) {
        processColumns(col.children, (parentOrder + index) * 1000);
      }
    });
  };

  processColumns(columns);
  return settings;
}

/**
 * 列配置管理 Hook
 */
export function useColumnSettings<T>(
  columns: ProColumnType<T>[],
  initialSettings?: ColumnSetting[],
  onChange?: (settings: ColumnSetting[]) => void
) {
  // 初始化列设置
  const defaultSettings = useMemo(() => generateColumnSettings(columns), [columns]);

  const [columnSettings, setColumnSettings] = useState<ColumnSetting[]>(() => {
    if (initialSettings && initialSettings.length > 0) {
      return initialSettings;
    }
    return defaultSettings;
  });

  // 更新列设置
  const updateSettings = useCallback(
    (newSettings: ColumnSetting[]) => {
      setColumnSettings(newSettings);
      onChange?.(newSettings);
    },
    [onChange]
  );

  // 重置列设置
  const resetSettings = useCallback(() => {
    updateSettings(defaultSettings);
  }, [defaultSettings, updateSettings]);

  // 根据列设置生成实际的列配置
  const processedColumns = useMemo(() => {
    // 创建列设置映射
    const settingsMap = new Map<string, ColumnSetting>();
    columnSettings.forEach((setting) => {
      settingsMap.set(setting.key, setting);
    });

    // 处理列
    const processColumns = (cols: ProColumnType<T>[]): ProColumnType<T>[] => {
      return cols
        .map((col) => {
          const key = col.key || (typeof col.dataIndex === 'string' ? col.dataIndex : col.dataIndex?.join('.'));
          if (!key) {
            return col;
          }

          const setting = settingsMap.get(key);
          if (!setting) {
            return col;
          }

          // 如果列被隐藏，返回 null
          if (!setting.show) {
            return null;
          }

          // 处理子列
          let children = col.children;
          if (children && children.length > 0) {
            children = processColumns(children);
          }

          // 返回处理后的列
          return {
            ...col,
            fixed: setting.fixed || col.fixed,
            children,
          };
        })
        .filter(Boolean) as ProColumnType<T>[];
    };

    // 根据 order 排序
    const sortedSettings = [...columnSettings].sort((a, b) => a.order - b.order);

    // 创建列顺序映射
    const orderMap = new Map<string, number>();
    sortedSettings.forEach((setting, index) => {
      orderMap.set(setting.key, index);
    });

    // 排序并处理列
    const sorted = [...columns].sort((a, b) => {
      const aKey = a.key || (typeof a.dataIndex === 'string' ? a.dataIndex : a.dataIndex?.join('.'));
      const bKey = b.key || (typeof b.dataIndex === 'string' ? b.dataIndex : b.dataIndex?.join('.'));

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
