import {
  Background,
  Controls,
  type DefaultEdgeOptions,
  type FitViewOptions,
  MiniMap,
  type OnConnect,
  type OnNodesChange,
  ReactFlow,
} from '@xyflow/react';
import { type ComponentType, useCallback } from 'react';
import { useWorkflowStore } from '../store/workflowStore';

const fitViewOptions: FitViewOptions = { padding: 0.2 };
const defaultEdgeOptions: DefaultEdgeOptions = { animated: true };

/** 流程画布 props */
export interface WorkflowCanvasProps {
  nodeTypes: Record<string, ComponentType<any>>;
  onOpenPropertyPanel: () => void;
}

/**
 * 流程画布：单一数据源来自 store，选中节点时打开属性面板
 */
export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ nodeTypes, onOpenPropertyPanel }) => {
  const {
    nodes,
    edges,
    onNodesChange: storeOnNodesChange,
    onEdgesChange: storeOnEdgesChange,
    onConnect: storeOnConnect,
    setSelectedNodeId,
  } = useWorkflowStore();

  /**
   * 包装 store 的 onNodesChange，处理选中节点时打开属性面板
   */
  const onNodesChangeWrap: OnNodesChange = useCallback(
    (changes) => {
      storeOnNodesChange(changes);
      const selectChange = changes.find((c) => c.type === 'select' && 'selected' in c);
      if (selectChange && selectChange.type === 'select') {
        const id = 'id' in selectChange ? selectChange.id : null;
        setSelectedNodeId(selectChange.selected && id ? id : null);
        if (selectChange.selected && id) {
          onOpenPropertyPanel();
        }
      }
    },
    [storeOnNodesChange, setSelectedNodeId, onOpenPropertyPanel]
  );

  /**
   * 包装 store 的 onConnect
   */
  const onConnect: OnConnect = useCallback((conn) => storeOnConnect(conn), [storeOnConnect]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChangeWrap}
      onEdgesChange={storeOnEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitViewOptions={fitViewOptions}
      defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      defaultEdgeOptions={defaultEdgeOptions}
      onNodeClick={(_, node) => {
        setSelectedNodeId(node.id);
        onOpenPropertyPanel();
      }}
      onPaneClick={() => setSelectedNodeId(null)}
    >
      <Background />
      <Controls className="p-[3px]" />
      <MiniMap />
    </ReactFlow>
  );
};
