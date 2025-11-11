import { usePreferencesStore } from '@/stores/store';
import { useClientContext, WorkflowPortRender } from '@flowgram.ai/free-layout-editor';
import { usePanelManager } from '@flowgram.ai/panel-manager-plugin';
import { useState } from 'react';
import { useNodeRenderContext } from '../../context/use-node-render-context';
import { nodeFormPanelFactory } from '../sidebar';
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
  const nodeRender = useNodeRenderContext();
  const { selected, startDrag, ports, selectNode, nodeRef, onFocus, onBlur, readonly } = nodeRender;
  const [isDragging, setIsDragging] = useState(false);
  const form = nodeRender.form;
  const ctx = useClientContext();

  // 点击端口后唤起节点选择面板
  // const onPortClick = usePortClick()

  // 窗口管理器
  const panelManager = usePanelManager();

  // 节点端口渲染
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
        onTouchStart={(e: any) => {
          startDrag(e);
          setIsDragging(true);
        }}
        onClick={(e) => {
          selectNode(e);
          if (!isDragging) {
            panelManager.open(nodeFormPanelFactory.key, 'right', {
              props: {
                nodeId: nodeRender.node.id,
              },
            });
            // 可选：将 isScrollToView 设为 true，可以让节点选中后滚动到画布中间
            if (isScrollToView) {
              scrollToView(ctx, nodeRender.node);
            }
          }
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
      {portsRender}
    </>
  );
};
export default NodeWrapper;
