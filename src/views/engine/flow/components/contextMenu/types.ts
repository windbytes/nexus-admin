/**
 * 右键菜单相关类型定义
 */
import type { Node } from '@xyflow/react';
import type { FlowPosition } from '../../types';

/** 右键菜单触发来源 */
export type ContextMenuType = 'pane' | 'node';

/** 右键菜单状态 */
export interface ContextMenuState {
  /** 菜单类型 */
  type: ContextMenuType;
  /** 菜单显示的屏幕 x 坐标 */
  x: number;
  /** 菜单显示的屏幕 y 坐标 */
  y: number;
  /** 右键点击的节点（仅 node 类型时存在） */
  node?: Node;
  /** 右键点击处的 flow 坐标（仅 pane 类型时存在） */
  flowPosition?: FlowPosition;
}

/** 画布右键菜单回调集合 */
export interface PaneContextMenuActions {
  onAddNode: (position?: FlowPosition) => void;
  onAddComment: () => void;
  onRun: () => void;
  onPaste: (position?: FlowPosition) => void;
  onExportDSL: () => void;
  onImportDSL: () => void;
  hasClipboard: boolean;
}

/** 节点右键菜单回调集合 */
export interface NodeContextMenuActions {
  onRunNode: (nodeId: string) => void;
  onCopy: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}
