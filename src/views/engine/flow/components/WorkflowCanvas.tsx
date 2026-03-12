/**
 * 流程画布组件
 * 职责：ReactFlow 画布渲染、节点/边变更事件、右键菜单状态管理
 * 菜单项构建与渲染逻辑已抽取至 contextMenu 模块
 */
import {
  Background,
  Controls,
  type DefaultEdgeOptions,
  type FitViewOptions,
  MiniMap,
  type Node,
  type OnConnect,
  type OnNodesChange,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import { type ComponentType, forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import type { WorkflowNodePlugin } from '../plugin/types';
import { useWorkflowStore } from '../store/workflowStore';
import type { FlowPosition } from '../types';
import {
  ContextMenuOverlay,
  type ContextMenuState,
  type NodeContextMenuActions,
  type PaneContextMenuActions,
} from './contextMenu';

const fitViewOptions: FitViewOptions = { padding: 0.2 };
const defaultEdgeOptions: DefaultEdgeOptions = { animated: true };

/** 流程画布 Props */
export interface WorkflowCanvasProps {
  /** 已注册的 ReactFlow nodeTypes */
  nodeTypes: Record<string, ComponentType<any>>;
  /** 打开属性面板 */
  onOpenPropertyPanel: () => void;
  /** 添加节点（带可选坐标） */
  onAddNode: (plugin: WorkflowNodePlugin, position?: FlowPosition) => void;
  /** 添加注释 */
  onAddComment: () => void;
  /** 测试运行 */
  onRun: () => void;
  /** 导入 DSL */
  onImportDSL: () => void;
  /** 导出 DSL */
  onExportDSL: () => void;
  /** 拷贝选中节点 */
  onCopy: () => void;
  /** 粘贴（带可选坐标） */
  onPaste: (position?: FlowPosition) => void;
  /** 复制选中节点 */
  onDuplicate: () => void;
  /** 删除选中节点 */
  onDelete: () => void;
  /** 运行单个节点 */
  onRunNode: (nodeId: string) => void;
  /** 替换节点类型 */
  onReplaceNode: (nodeId: string, plugin: WorkflowNodePlugin) => void;
  /** 剪贴板是否有内容 */
  hasClipboard: boolean;
}

/** 通过 ref 暴露的方法 */
export interface WorkflowCanvasRef {
  /** 关闭所有右键菜单 */
  closeContextMenu: () => void;
}

/**
 * 流程画布：渲染 ReactFlow、处理节点选中、委托右键菜单给 ContextMenuOverlay
 */
export const WorkflowCanvas = forwardRef<WorkflowCanvasRef, WorkflowCanvasProps>((props, ref) => {
  const {
    nodeTypes,
    onOpenPropertyPanel,
    onAddNode,
    onAddComment,
    onRun,
    onImportDSL,
    onExportDSL,
    onCopy,
    onPaste,
    onDuplicate,
    onDelete,
    onRunNode,
    onReplaceNode,
    hasClipboard,
  } = props;

  const { screenToFlowPosition } = useReactFlow();
  const {
    nodes,
    edges,
    onNodesChange: storeOnNodesChange,
    onEdgesChange: storeOnEdgesChange,
    onConnect: storeOnConnect,
    setSelectedNodeId,
    setNodes,
  } = useWorkflowStore();

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const closeMenus = useCallback(() => {
    setContextMenu(null);
  }, []);

  useImperativeHandle(ref, () => ({ closeContextMenu: closeMenus }), [closeMenus]);

  /** 画布空白处右键 */
  const onPaneContextMenu = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      e.preventDefault();
      const flowPosition = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      setContextMenu({ type: 'pane', x: e.clientX, y: e.clientY, flowPosition });
    },
    [screenToFlowPosition]
  );

  /** 节点上右键 */
  const onNodeContextMenu = useCallback(
    (e: React.MouseEvent | MouseEvent, node: Node) => {
      e.preventDefault();
      setSelectedNodeId(node.id);
      setNodes((prev) => prev.map((n) => ({ ...n, selected: n.id === node.id })));
      setContextMenu({ type: 'node', x: e.clientX, y: e.clientY, node });
    },
    [setSelectedNodeId, setNodes]
  );

  /** 节点变更包装：处理选中事件联动属性面板 */
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

  const onConnect: OnConnect = useCallback((conn) => storeOnConnect(conn), [storeOnConnect]);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
    closeMenus();
  }, [setSelectedNodeId, closeMenus]);

  const paneActions: PaneContextMenuActions = useMemo(
    () => ({
      onAddNode: (position) => onAddNode(undefined as unknown as WorkflowNodePlugin, position),
      onAddComment,
      onRun,
      onPaste,
      onExportDSL,
      onImportDSL,
      hasClipboard,
    }),
    [onAddComment, onRun, onPaste, onExportDSL, onImportDSL, hasClipboard]
  );

  const nodeActions: NodeContextMenuActions = useMemo(
    () => ({ onRunNode, onCopy, onDuplicate, onDelete }),
    [onRunNode, onCopy, onDuplicate, onDelete]
  );

  return (
    <>
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
        onPaneClick={handlePaneClick}
        onPaneContextMenu={onPaneContextMenu}
        onNodeContextMenu={onNodeContextMenu}
      >
        <Background />
        <Controls className="p-[3px]" />
        <MiniMap />
      </ReactFlow>

      <ContextMenuOverlay
        contextMenu={contextMenu}
        onClose={closeMenus}
        paneActions={paneActions}
        nodeActions={nodeActions}
        onAddNode={onAddNode}
        onReplaceNode={onReplaceNode}
      />
    </>
  );
});
