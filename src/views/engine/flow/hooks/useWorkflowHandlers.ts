/**
 * 流程编排页的交互逻辑：添加节点、DSL、保存草稿、发布等
 * 全部使用 flow API（flowId）；配置加载为 getDraft(flowId)，运行状态为 getRouteStatus(flowId)
 * 无 flowId 时点击保存会先创建流程定义再保存草稿
 */
import { useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { useCallback, useRef, useState } from 'react';
import { flowDefinitionService, flowVersionService } from '@/services/engine/flow/api';
import type { FlowDraftEdge, FlowDraftNode, FlowDraftPayload } from '@/services/engine/flow/types';
import type { WorkflowNodePlugin } from '../plugin/types';
import { useWorkflowStore } from '../store/workflowStore';
import type { FlowPosition, WorkflowDocument, WorkflowEdge, WorkflowNode } from '../types';
import { downloadDSL, importDSLFromFile } from '../utils/dsl';
import { generateEdgeId, generateNodeId } from '../utils/id';
import { flowDefinitionQueryKeys } from './useFlowId';

/**
 * 将画布文档转为后端草稿 DTO 格式（nodeKey / sourceNodeKey / targetNodeKey）
 * @param doc - 当前画布文档快照
 * @returns 后端 FlowDraftPayload
 */
function toFlowDraftPayload(doc: WorkflowDocument | null): FlowDraftPayload {
  const nodes: FlowDraftNode[] = (doc?.nodes ?? []).map((node: WorkflowNode) => ({
    nodeKey: node.id,
    name: (node.data as { title?: string })?.title,
    description: (node.data as { description?: string })?.description,
    config: (node.data as Record<string, unknown>) ?? {},
    uiConfig: { position: node.position },
    pluginId: node.type,
  }));
  const edges: FlowDraftEdge[] = (doc?.edges ?? []).map((edge: WorkflowEdge) => ({
    sourceNodeKey: edge.source,
    targetNodeKey: edge.target,
    conditionExpr: (edge.data as { conditionExpr?: string })?.conditionExpr,
  }));
  return { nodes, edges };
}

/**
 * 流程编排页核心交互 hook
 * @param appId - 应用 ID（来自路由，用于 getDocument 的 meta）
 * @param flowId - 流程定义 ID（用于草稿/发布等 flow API，可选；无则保存/发布不请求）
 * @returns 所有画布操作回调与相关状态
 */
export function useWorkflowHandlers(appId: string | undefined, flowId: string | undefined) {
  const queryClient = useQueryClient();
  const [propertyPanelOpen, setPropertyPanelOpen] = useState(false);
  const [checklistCount] = useState(1);
  const { message } = App.useApp();
  const clipboardRef = useRef<{ nodes: WorkflowNode[]; edges: WorkflowEdge[] } | null>(null);
  const [hasClipboard, setHasClipboard] = useState(false);

  const { nodes, edges, setNodes, setEdges, setLastSavedAt, pushHistory, loadDocument, getDocument } =
    useWorkflowStore();

  /**
   * 添加节点到画布
   * @param plugin - 要添加的节点插件
   * @param position - 放置位置（flow 坐标），缺省时自动排列
   */
  const handleAddNode = useCallback(
    (plugin: WorkflowNodePlugin, position?: FlowPosition) => {
      pushHistory();
      const id = generateNodeId();
      const pos = position ?? { x: 120 + nodes.length * 200, y: 100 + (nodes.length % 3) * 120 };
      const newNode = {
        id,
        type: plugin.meta.id,
        position: pos,
        data: { ...plugin.defaultNodeData },
      };
      setNodes((prev) => [...prev, newNode]);
    },
    [nodes.length, pushHistory, setNodes]
  );

  /**
   * 替换指定节点为新的插件类型（保留 id、position，替换 type 与 data）
   * @param nodeId - 要替换的节点 ID
   * @param plugin - 新的插件类型
   */
  const handleReplaceNode = useCallback(
    (nodeId: string, plugin: WorkflowNodePlugin) => {
      pushHistory();
      setNodes((prev) =>
        prev.map((n) => (n.id === nodeId ? { ...n, type: plugin.meta.id, data: { ...plugin.defaultNodeData } } : n))
      );
      message.success('已更换节点类型');
    },
    [pushHistory, setNodes]
  );

  /** 从文件导入 DSL 到画布 */
  const handleImportDSL = useCallback(async () => {
    const doc = await importDSLFromFile();
    if (doc) {
      loadDocument(doc);
      message.success('导入成功');
    } else {
      message.error('导入失败或已取消');
    }
  }, [loadDocument]);

  /** 将当前画布导出为 DSL JSON 文件 */
  const handleExportDSL = useCallback(() => {
    const doc = getDocument(appId);
    downloadDSL(doc, `workflow-${appId ?? 'export'}.json`);
    message.success('已导出');
  }, [appId, getDocument]);

  /** 预览流程（待接入） */
  const handlePreview = useCallback(() => {
    message.info('预览功能待接入');
  }, []);

  /**
   * 保存草稿到后端
   * 无 flowId 时会先创建流程定义再保存
   */
  const handleSave = useCallback(async () => {
    if (!appId) {
      message.warning('应用未就绪，请稍后再保存');
      return;
    }
    try {
      const doc = getDocument(appId);
      const payload = toFlowDraftPayload(doc);
      let targetFlowId = flowId;
      if (!targetFlowId) {
        const newFlow = await flowDefinitionService.create({
          appId,
          tenantId: '1',
          flowKey: 'DEFAULT',
          flowName: '默认流程',
        });
        targetFlowId = newFlow.id;
        void queryClient.invalidateQueries({ queryKey: flowDefinitionQueryKeys.listByApp(appId) });
      }
      await flowVersionService.saveDraft(targetFlowId, payload);
      setLastSavedAt(new Date().toISOString());
      message.success(targetFlowId === flowId ? '草稿已保存' : '流程已创建并保存');
    } catch {
      message.error('保存失败');
    }
  }, [appId, flowId, getDocument, setLastSavedAt, queryClient]);

  /**
   * 发布流程
   * 无 flowId 时会先创建流程定义、保存草稿再发布
   */
  const handlePublish = useCallback(async () => {
    if (!appId) {
      message.warning('应用未就绪，请稍后再发布');
      return;
    }
    try {
      const doc = getDocument(appId);
      const payload = toFlowDraftPayload(doc);
      let targetFlowId = flowId;
      if (!targetFlowId) {
        const newFlow = await flowDefinitionService.create({
          appId,
          tenantId: '1',
          flowKey: 'DEFAULT',
          flowName: '默认流程',
        });
        targetFlowId = newFlow.id;
        void queryClient.invalidateQueries({ queryKey: flowDefinitionQueryKeys.listByApp(appId) });
      }
      await flowVersionService.saveDraft(targetFlowId, payload);
      await flowVersionService.publish(targetFlowId);
      setLastSavedAt(new Date().toISOString());
      message.success('发布成功');
    } catch {
      message.error('发布失败');
    }
  }, [appId, flowId, getDocument, setLastSavedAt, queryClient]);

  /** 添加注释节点（待实现） */
  const handleAddComment = useCallback(() => {
    message.info('添加注释');
  }, []);

  /** 运行整个流程 */
  const handleRun = useCallback(() => {
    message.info('运行');
  }, []);

  /**
   * 运行单个节点（右键菜单「运行此步骤」）
   * @param nodeId - 要运行的节点 ID
   */
  const handleRunNode = useCallback((nodeId: string) => {
    message.info(`运行节点: ${nodeId}`);
  }, []);

  /** 获取当前选中节点的 ID 集合 */
  const getSelectedNodeIds = useCallback(() => {
    return new Set(nodes.filter((n) => n.selected).map((n) => n.id));
  }, [nodes]);

  /** 拷贝选中节点及其连线到剪贴板 */
  const handleCopy = useCallback(() => {
    const selectedIds = getSelectedNodeIds();
    if (selectedIds.size === 0) {
      return;
    }
    const copyNodes = nodes.filter((n) => n.selected);
    const copyEdges = edges.filter((e) => selectedIds.has(e.source) && selectedIds.has(e.target));
    clipboardRef.current = {
      nodes: JSON.parse(JSON.stringify(copyNodes)),
      edges: JSON.parse(JSON.stringify(copyEdges)),
    };
    setHasClipboard(true);
    message.success('已拷贝');
  }, [nodes, edges, getSelectedNodeIds]);

  /** 就地复制选中节点及其连线（偏移 50px） */
  const handleDuplicate = useCallback(() => {
    const selectedIds = getSelectedNodeIds();
    if (selectedIds.size === 0) {
      return;
    }
    const copyNodes = nodes.filter((n) => n.selected);
    const copyEdges = edges.filter((e) => selectedIds.has(e.source) && selectedIds.has(e.target));
    const offset = { x: 50, y: 50 };
    const oldToNew = new Map<string, string>();
    const newNodes: WorkflowNode[] = copyNodes.map((n) => {
      const newId = generateNodeId();
      oldToNew.set(n.id, newId);
      return {
        ...JSON.parse(JSON.stringify(n)),
        id: newId,
        position: {
          x: n.position.x + offset.x,
          y: n.position.y + offset.y,
        },
        selected: false,
      };
    });
    const newEdges = copyEdges.map((e) => ({
      ...JSON.parse(JSON.stringify(e)),
      id: generateEdgeId(),
      source: oldToNew.get(e.source) ?? e.source,
      target: oldToNew.get(e.target) ?? e.target,
    }));
    pushHistory();
    setNodes((prev) => [...prev, ...newNodes]);
    setEdges((prev) => [...prev, ...newEdges]);
    message.success('已复制');
  }, [nodes, edges, getSelectedNodeIds, pushHistory, setNodes, setEdges]);

  /** 删除所有选中的节点及关联边 */
  const handleDelete = useCallback(() => {
    const selectedIds = getSelectedNodeIds();
    if (selectedIds.size === 0) {
      return;
    }
    pushHistory();
    setNodes((prev) => prev.filter((n) => !n.selected));
    setEdges((prev) => prev.filter((e) => !selectedIds.has(e.source) && !selectedIds.has(e.target)));
    message.success('已删除');
  }, [getSelectedNodeIds, pushHistory, setNodes, setEdges]);

  /**
   * 从剪贴板粘贴节点及连线
   * @param position - 粘贴位置（flow 坐标），缺省时在原位偏移
   */
  const handlePaste = useCallback(
    (position?: FlowPosition) => {
      const clip = clipboardRef.current;
      if (!clip || clip.nodes.length === 0) {
        message.warning('剪贴板为空');
        return;
      }
      const minX = Math.min(...clip.nodes.map((n) => n.position.x));
      const minY = Math.min(...clip.nodes.map((n) => n.position.y));
      const origin = position ?? { x: minX + 50, y: minY + 50 };
      const oldToNew = new Map<string, string>();
      const newNodes: WorkflowNode[] = clip.nodes.map((n) => {
        const newId = generateNodeId();
        oldToNew.set(n.id, newId);
        return {
          ...JSON.parse(JSON.stringify(n)),
          id: newId,
          position: {
            x: n.position.x - minX + origin.x,
            y: n.position.y - minY + origin.y,
          },
          selected: false,
        };
      });
      const newEdges = clip.edges.map((e) => ({
        ...JSON.parse(JSON.stringify(e)),
        id: generateEdgeId(),
        source: oldToNew.get(e.source) ?? e.source,
        target: oldToNew.get(e.target) ?? e.target,
      }));
      pushHistory();
      setNodes((prev) => [...prev, ...newNodes]);
      setEdges((prev) => [...prev, ...newEdges]);
      message.success('已粘贴');
    },
    [pushHistory, setNodes, setEdges]
  );

  return {
    appId,
    flowId,
    propertyPanelOpen,
    setPropertyPanelOpen,
    checklistCount,
    handleAddNode,
    handleReplaceNode,
    handleImportDSL,
    handleExportDSL,
    handlePreview,
    handleSave,
    handlePublish,
    handleAddComment,
    handleRun,
    handleRunNode,
    handleCopy,
    handleDuplicate,
    handleDelete,
    handlePaste,
    hasClipboard,
  };
}
