import { NodeModalContext } from '@/context/workflow/node-modal-context';
import { SidebarContext } from '@/context/workflow/sidebar-context';
import { useNodeRenderContext } from '@/context/workflow/use-node-render-context';
import { usePreferencesStore } from '@/stores/store';
import { useClientContext, useNodeRender, WorkflowPortRender } from '@flowgram.ai/free-layout-editor';
import { useContext, useState } from 'react';
import './node-wrapper.scss';
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
  const nodeRenderCtx = useNodeRenderContext();
  const nodeRender = useNodeRender();
  const { selected, startDrag, ports, selectNode, nodeRef, onFocus, onBlur } = nodeRenderCtx;
  const [isDragging, setIsDragging] = useState(false);
  const sidebar = useContext(SidebarContext);
  // 弹窗
  const nodeModal = useContext(NodeModalContext);
  const form = nodeRenderCtx.form;
  // 获取节点注册器（内部可能配置自己的事件）
  const registry = nodeRender.node.getNodeRegistry();
  const ctx = useClientContext();

  // 节点端口渲染(端口样式-后续版本支持)
  const portsRender = ports.map((port) => (
    <WorkflowPortRender key={port.id} entity={port} secondaryColor={colorPrimary} />
  ));

  return (
    <>
      <div
        className="node-wrapper"
        ref={nodeRef}
        draggable
        onDragStart={(e) => {
          startDrag(e);
          setIsDragging(true);
        }}
        onClick={(e) => {
          selectNode(e);
          if (!isDragging) {
            sidebar.setNodeId(nodeRender.node.id);
            // 可选：将 isScrollToView 设为 true，可以让节点选中后滚动到画布中间
            if (isScrollToView) {
              scrollToView(ctx, nodeRender.node);
            }
          }
        }}
        onMouseUp={() => setIsDragging(false)}
        onFocus={onFocus}
        onBlur={onBlur}
        // onDoubleClick={() => registry.onDblClick?.(ctx, nodeRender.node)}
        onDoubleClick={(e) => {
          selectNode(e);
          // 触发节点配置的双击事件
          registry['onDblClick']?.(ctx, nodeRender.node);
          if (!isDragging) {
            nodeModal.setNodeId(nodeRender.node.id);
            // 可选：将 isScrollToView 设为 true，可以让节点选中后滚动到画布中间
            if (isScrollToView) {
              scrollToView(ctx, nodeRender.node);
            }
          }
        }}
        data-node-selected={String(selected)}
        style={{
          outline: form?.state.invalid ? '1px solid red' : 'none',
          border: selected ? `2px solid ${colorPrimary}` : 'none',
        }}
      >
        {children}
      </div>
      {portsRender}
    </>
  );
};
export default NodeWrapper;
