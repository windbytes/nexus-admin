/**
 * 流程编排页的交互逻辑：添加节点、DSL、保存草稿、发布等
 * 全部使用 flow API（flowId）；配置加载为 getDraft(flowId)，运行状态为 getRouteStatus(flowId)
 * 无 flowId 时点击保存会先创建流程定义再保存草稿
 */
import { useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { useCallback, useState } from 'react';
import { flowDefinitionService, flowVersionService } from '@/services/engine/flow/api';
import type { FlowDraftEdge, FlowDraftNode, FlowDraftPayload } from '@/services/engine/flow/types';
import type { WorkflowNodePlugin } from '../plugin/types';
import { useWorkflowStore } from '../store/workflowStore';
import type { WorkflowDocument, WorkflowEdge, WorkflowNode } from '../types';
import { downloadDSL, importDSLFromFile } from '../utils/dsl';
import { flowDefinitionQueryKeys } from './useFlowId';

/**
 * 将画布文档转为后端草稿 DTO 格式（nodeKey / sourceNodeKey / targetNodeKey）
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
 * @param appId 应用 ID（来自路由，用于 getDocument 的 meta）
 * @param flowId 流程定义 ID（用于草稿/发布等 flow API，可选；无则保存/发布不请求）
 */
export function useWorkflowHandlers(appId: string | undefined, flowId: string | undefined) {
  const queryClient = useQueryClient();
  const [propertyPanelOpen, setPropertyPanelOpen] = useState(false);
  const [checklistCount] = useState(1);
  const { message } = App.useApp();

  const { nodes, setNodes, setLastSavedAt, pushHistory, loadDocument, getDocument } = useWorkflowStore();

  const handleAddNode = useCallback(
    (plugin: WorkflowNodePlugin) => {
      pushHistory();
      const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const newNode = {
        id,
        type: plugin.meta.id,
        position: { x: 120 + nodes.length * 200, y: 100 + (nodes.length % 3) * 120 },
        data: { ...plugin.defaultNodeData },
      };
      setNodes((prev) => [...prev, newNode]);
    },
    [nodes.length, pushHistory, setNodes]
  );

  const handleImportDSL = useCallback(async () => {
    const doc = await importDSLFromFile();
    if (doc) {
      loadDocument(doc);
      message.success('导入成功');
    } else {
      message.error('导入失败或已取消');
    }
  }, [loadDocument]);

  const handleExportDSL = useCallback(() => {
    const doc = getDocument(appId);
    downloadDSL(doc, `workflow-${appId ?? 'export'}.json`);
    message.success('已导出');
  }, [appId, getDocument]);

  const handlePreview = useCallback(() => {
    message.info('预览功能待接入');
  }, []);

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

  const handleAddComment = useCallback(() => {
    message.info('添加注释');
  }, []);

  const handleRun = useCallback(() => {
    message.info('运行');
  }, []);

  return {
    appId,
    flowId,
    propertyPanelOpen,
    setPropertyPanelOpen,
    checklistCount,
    handleAddNode,
    handleImportDSL,
    handleExportDSL,
    handlePreview,
    handleSave,
    handlePublish,
    handleAddComment,
    handleRun,
  };
}
