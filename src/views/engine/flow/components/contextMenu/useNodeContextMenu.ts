/**
 * 节点右键菜单项构建 hook
 * 根据节点类型和插件元信息动态生成菜单项
 */
import type { MenuProps } from 'antd';
import { useMemo } from 'react';
import { getNodePlugin } from '../../plugin/registry';
import type { WorkflowNode } from '../../types';
import type { NodeContextMenuActions } from './types';

/**
 * 构建节点右键菜单项
 * @param node - 当前右键的节点
 * @param actions - 节点右键菜单回调集合
 * @param onClose - 关闭菜单的回调
 * @returns antd Menu 所需的 items 数组
 */
export function useNodeContextMenu(
  node: WorkflowNode | undefined,
  actions: NodeContextMenuActions,
  onClose: () => void
): MenuProps['items'] {
  const { onRunNode, onCopy, onDuplicate, onDelete } = actions;

  return useMemo((): MenuProps['items'] => {
    if (!node) {
      return [];
    }

    const plugin = node.type ? getNodePlugin(node.type) : undefined;
    const items: NonNullable<MenuProps['items']> = [];

    if (plugin?.meta?.runnable) {
      items.push({
        key: 'runStep',
        label: '运行此步骤',
        onClick: () => {
          onRunNode(node.id);
          onClose();
        },
      });
    }

    if (plugin?.meta?.contextMenuItems) {
      for (const cfg of plugin.meta.contextMenuItems) {
        const visible = cfg.visible ? cfg.visible(node) : true;
        if (!visible) {
          continue;
        }
        items.push({
          key: cfg.key,
          label: cfg.shortcut ? `${cfg.label}  ${cfg.shortcut}` : cfg.label,
          disabled: cfg.disabled ? cfg.disabled(node) : false,
        });
        if (cfg.dividerAfter) {
          items.push({ type: 'divider' });
        }
      }
    }

    items.push({
      key: 'changeNode',
      label: '更改节点',
      children: [{ key: 'changeNode-placeholder', label: '' }],
    });
    items.push({ type: 'divider' });
    items.push({
      key: 'copy',
      label: '拷贝',
      onClick: () => {
        onCopy();
        onClose();
      },
    });
    items.push({
      key: 'duplicate',
      label: '复制',
      onClick: () => {
        onDuplicate();
        onClose();
      },
    });
    items.push({ type: 'divider' });
    items.push({
      key: 'delete',
      label: '删除',
      danger: true,
      onClick: () => {
        onDelete();
        onClose();
      },
    });
    items.push({ type: 'divider' });
    items.push({ key: 'help', label: '查看帮助文档', onClick: onClose });

    const description = plugin?.meta?.description;
    if (description) {
      items.push({
        key: 'about',
        label: '关于',
        children: [{ key: 'aboutDesc', label: description, disabled: true }],
      });
    }

    return items;
  }, [node, onRunNode, onCopy, onDuplicate, onDelete, onClose]);
}
