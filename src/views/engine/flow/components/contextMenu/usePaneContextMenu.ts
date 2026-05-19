/**
 * 画布右键菜单项构建 hook
 * 生成画布空白处右键时展示的菜单数据
 */
import type { MenuProps } from 'antd';
import { useMemo } from 'react';
import type { FlowPosition } from '../../types';
import type { PaneContextMenuActions } from './types';

/**
 * 构建画布（Pane）右键菜单项
 * @param actions - 画布右键菜单回调集合
 * @param flowPosition - 右键点击处的 flow 坐标
 * @param onClose - 关闭菜单的回调
 * @returns antd Menu 所需的 items 数组
 */
export function usePaneContextMenu(
  actions: PaneContextMenuActions,
  flowPosition: FlowPosition | undefined,
  onClose: () => void
): MenuProps['items'] {
  const { onAddComment, onRun, onPaste, onExportDSL, onImportDSL, hasClipboard } = actions;

  return useMemo(
    (): MenuProps['items'] => [
      { key: 'addNode', label: '添加节点', children: [{ key: 'addNode-placeholder', label: '' }] },
      {
        key: 'addComment',
        label: '添加注释',
        onClick: () => {
          onAddComment();
          onClose();
        },
      },
      {
        key: 'testRun',
        label: '测试运行',
        onClick: () => {
          onRun();
          onClose();
        },
      },
      { type: 'divider' },
      {
        key: 'paste',
        label: '粘贴到这里',
        disabled: !hasClipboard,
        onClick: () => {
          onPaste(flowPosition);
          onClose();
        },
      },
      { type: 'divider' },
      {
        key: 'exportDSL',
        label: '导出 DSL',
        onClick: () => {
          onExportDSL();
          onClose();
        },
      },
      {
        key: 'importDSL',
        label: '导入 DSL',
        onClick: () => {
          onImportDSL();
          onClose();
        },
      },
    ],
    [onAddComment, onRun, onPaste, onExportDSL, onImportDSL, hasClipboard, flowPosition, onClose]
  );
}
