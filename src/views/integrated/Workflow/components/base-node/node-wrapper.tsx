import {
  type FreeLayoutPluginContext,
  useClientContext,
  type WorkflowNodeEntity,
  WorkflowPortRender,
} from '@flowgram.ai/free-layout-editor';
import { Dropdown } from 'antd';
import { useState } from 'react';
import { usePreferencesStore } from '@/stores/store';
import { useNodeRenderContext } from '../../context/use-node-render-context';
import { usePortClick } from '../../hooks/usePortClick';
import './node-wrapper.scss';
import { useNodeFormPanel } from '../../plugins/panel-manager-plugin/hooks';
import { scrollToView } from './util';

/**
 * 节点包裹器属性
 */
export interface NodeWrapperProps {
  isScrollToView?: boolean;
  children: React.ReactNode;
}

/**
 * 节点包裹器组件
 * 主要用于包裹节点使用
 * 用于节点的拖拽、点击事件、和点位渲染
 *
 * @param props 节点包裹器属性
 * @returns 节点包裹器组件
 */
const NodeWrapper: React.FC<NodeWrapperProps> = ({ isScrollToView = false, children }) => {
  // 获取主题配置
  const colorPrimary = usePreferencesStore((state) => state.preferences.theme.colorPrimary);

  // 获取当前渲染的节点
  const nodeRender = useNodeRenderContext();
  const { selected, startDrag, ports, selectNode, nodeRef, onFocus, onBlur, readonly, node } = nodeRender;
  const [isDragging, setIsDragging] = useState(false);
  const form = nodeRender.form;
  const ctx = useClientContext();

  // 点击端口后唤起节点选择面板
  const onPortClick = usePortClick();

  const { open } = useNodeFormPanel();

  // 节点端口渲染
  const portsRender = ports.map((port) => (
    <WorkflowPortRender
      key={port.id}
      entity={port}
      secondaryColor={colorPrimary}
      {...(!readonly ? { onClick: onPortClick } : {})}
    />
  ));

  // 获取节点配置的右键菜单
  const menuItems = (node.getNodeRegistry().meta['contextMenu'] ?? []).map((item: any) => {
    const { onClick, ...rest } = item;
    if (item.type === 'divider') {
      return {
        type: 'divider',
      };
    }
    return {
      ...rest,
      onClick: (e: React.MouseEvent<HTMLDivElement>) => {
        onClick?.(ctx as FreeLayoutPluginContext, node as WorkflowNodeEntity);
        e.preventDefault();
        e.stopPropagation();
      },
    };
  });

  return (
    <>
      <Dropdown
        trigger={['contextMenu']}
        menu={{
          items: menuItems,
        }}
        getPopupContainer={() => document.body}
        classNames={{
          root: 'w-[240px]',
        }}
      >
        <div
          className="node-wrapper"
          ref={nodeRef}
          draggable
          onDragStart={(e) => {
            startDrag(e);
            setIsDragging(true);
          }}
          onTouchStart={(e: any) => {
            startDrag(e);
            setIsDragging(true);
          }}
          onClick={(e) => {
            selectNode(e);
            if (!isDragging) {
              open({
                nodeId: nodeRender.node.id,
              });
              // 可选：将 isScrollToView 设为 true，可以让节点选中后滚动到画布中间
              if (isScrollToView) {
                scrollToView(ctx, nodeRender.node);
              }
            }
          }}
          onContextMenu={(e) => {
            // 阻止冒泡，避免触发到全局的右键插件绑定事件上（节点上右键，则显示组件相关的右键操作）
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseUp={() => setIsDragging(false)}
          onFocus={onFocus}
          onBlur={onBlur}
          data-node-selected={String(selected)}
          style={{
            outline: form?.state.invalid ? '1px solid red' : 'none',
            border: selected ? `2px solid ${colorPrimary}` : 'none',
          }}
        >
          {children}
        </div>
      </Dropdown>
      {portsRender}
    </>
  );
};
export default NodeWrapper;
