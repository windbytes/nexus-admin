/**
 * 右键菜单渲染组件
 * 统一渲染画布右键菜单与节点右键菜单，包含 addNode / changeNode 的 submenu popupRender 逻辑
 */
import { Menu } from 'antd';
import { useCallback } from 'react';
import type { WorkflowNodePlugin } from '../../plugin/types';
import type { FlowPosition, WorkflowNode } from '../../types';
import { NodeListPanel } from '../NodeListPanel';
import type { ContextMenuState, NodeContextMenuActions, PaneContextMenuActions } from './types';
import { useNodeContextMenu } from './useNodeContextMenu';
import { usePaneContextMenu } from './usePaneContextMenu';

/** ContextMenuOverlay 组件 Props */
export interface ContextMenuOverlayProps {
  /** 当前菜单状态，null 时不渲染 */
  contextMenu: ContextMenuState | null;
  /** 关闭所有菜单 */
  onClose: () => void;
  /** 画布右键菜单回调 */
  paneActions: PaneContextMenuActions;
  /** 节点右键菜单回调 */
  nodeActions: NodeContextMenuActions;
  /** 添加节点到指定位置 */
  onAddNode: (plugin: WorkflowNodePlugin, position?: FlowPosition) => void;
  /** 替换指定节点为新的插件类型 */
  onReplaceNode: (nodeId: string, plugin: WorkflowNodePlugin) => void;
}

/**
 * 右键菜单浮层：根据 contextMenu.type 展示画布菜单或节点菜单
 * - 「添加节点」submenu 通过 popupRender 渲染 NodeListPanel
 * - 「更改节点」submenu 通过 popupRender 渲染 NodeListPanel（替换模式）
 */
export const ContextMenuOverlay: React.FC<ContextMenuOverlayProps> = ({
  contextMenu,
  onClose,
  paneActions,
  nodeActions,
  onAddNode,
  onReplaceNode,
}) => {
  const flowPosition = contextMenu?.type === 'pane' ? contextMenu.flowPosition : undefined;
  const currentNode = contextMenu?.node as WorkflowNode | undefined;

  const paneMenuItems = usePaneContextMenu(paneActions, flowPosition, onClose);
  const nodeMenuItems = useNodeContextMenu(currentNode, nodeActions, onClose);

  /** 统一的 popupRender：处理 addNode 和 changeNode 的 submenu 自定义渲染 */
  const popupRender = useCallback(
    (node: React.ReactNode, info?: { keys?: string[] }) => {
      const isAddNode = info?.keys?.includes('addNode');
      const isChangeNode = info?.keys?.includes('changeNode');

      if (isAddNode || isChangeNode) {
        return (
          <div
            style={{
              maxHeight: 500,
              overflowY: 'auto',
              backgroundColor: '#fff',
              borderRadius: 'var(--ant-border-radius)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              padding: 'var(--ant-padding-md)',
            }}
          >
            <NodeListPanel
              onAddNode={(plugin) => {
                if (isChangeNode && currentNode) {
                  onReplaceNode(currentNode.id, plugin);
                } else {
                  onAddNode(plugin, flowPosition);
                }
                onClose();
              }}
            />
          </div>
        );
      }

      return (
        <div
          style={{
            maxHeight: 460,
            overflowY: 'auto',
            backgroundColor: '#fff',
            borderRadius: 'var(--ant-border-radius)',
          }}
        >
          {node}
        </div>
      );
    },
    [flowPosition, currentNode, onAddNode, onReplaceNode, onClose]
  );

  if (!contextMenu) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: contextMenu.x,
        top: contextMenu.y,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        borderRadius: 'var(--ant-border-radius)',
        overflow: 'hidden',
      }}
    >
      <Menu
        items={contextMenu.type === 'pane' ? paneMenuItems : nodeMenuItems}
        style={{ minWidth: 160 }}
        onClick={() => onClose()}
        mode="vertical"
        popupRender={popupRender}
      />
    </div>
  );
};
