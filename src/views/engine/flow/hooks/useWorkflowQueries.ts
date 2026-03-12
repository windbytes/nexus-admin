/**
 * 流程编排数据查询：基于 flowId 的草稿配置与路由运行状态
 * 全部使用 flow API，不再依赖 workflow 服务
 */
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { flowVersionService, mapRouteStatusToRunStatus } from '@/services/engine/flow/api';
import type {
  FlowDraftEdge,
  FlowDraftNode,
  FlowDraftPayload,
  FlowRunStatusResponse,
} from '@/services/engine/flow/types';
import { useWorkflowStore } from '../store/workflowStore';
import type { WorkflowDocument, WorkflowEdge, WorkflowNode } from '../types';

export const workflowQueryKeys = {
  all: ['workflow'] as const,
  /** 草稿配置（画布初始数据） */
  config: (flowId: string) => [...workflowQueryKeys.all, 'config', flowId] as const,
  /** 路由运行状态 */
  runStatus: (flowId: string) => [...workflowQueryKeys.all, 'runStatus', flowId] as const,
};

/**
 * 将 GET draft 返回的 FlowDraftPayload 转为画布 WorkflowDocument（nodeKey→id, sourceNodeKey/targetNodeKey→source/target）
 */
function draftToWorkflowDocument(draft: FlowDraftPayload, flowId?: string): WorkflowDocument {
  const nodes: WorkflowNode[] = (draft.nodes ?? []).map((n: FlowDraftNode) => {
    const uiConfig = (n.uiConfig ?? {}) as { position?: { x: number; y: number } };
    return {
      id: n.nodeKey,
      type: n.pluginId,
      position: uiConfig?.position ?? { x: 0, y: 0 },
      data: {
        ...(n.config ?? {}),
        title: n.name,
        description: n.description,
        pluginId: n.pluginId,
      },
    } as WorkflowNode;
  });
  const edges: WorkflowEdge[] = (draft.edges ?? []).map((e: FlowDraftEdge, idx: number) => ({
    id: e.id ?? `e-${e.sourceNodeKey}-${e.targetNodeKey}-${idx}`,
    source: e.sourceNodeKey,
    target: e.targetNodeKey,
    data: e.conditionExpr ? { conditionExpr: e.conditionExpr } : undefined,
  }));
  return {
    version: 1,
    nodes,
    edges,
    meta: flowId ? { appId: flowId, updatedAt: new Date().toISOString() } : undefined,
  };
}

/**
 * 根据 flowId 查询草稿配置（用于加载画布）
 * 启用条件：flowId 存在
 */
export function useWorkflowConfigQuery(flowId: string | undefined) {
  return useQuery({
    queryKey: workflowQueryKeys.config(flowId ?? ''),
    queryFn: async () => {
      if (!flowId) {
        throw new Error('flowId is required');
      }
      return flowVersionService.getDraft(flowId);
    },
    enabled: !!flowId,
  });
}

/**
 * 根据 flowId 查询路由运行状态，并映射为 UI 展示类型
 */
export function useWorkflowRunStatusQuery(flowId: string | undefined) {
  return useQuery({
    queryKey: workflowQueryKeys.runStatus(flowId ?? ''),
    queryFn: async (): Promise<FlowRunStatusResponse | null> => {
      if (!flowId) {
        throw new Error('flowId is required');
      }
      const dto = await flowVersionService.getRouteStatus(flowId);
      return mapRouteStatusToRunStatus(dto);
    },
    enabled: !!flowId,
  });
}

/**
 * 同步草稿配置到 store：当 getDraft 成功后将结果转为 WorkflowDocument 并 loadDocument
 * 依赖 flowId；仅在初次加载或 flowId 变化时同步
 */
export function useWorkflowConfigSync(flowId: string | undefined) {
  const { data, isSuccess } = useWorkflowConfigQuery(flowId);
  const loadDocument = useWorkflowStore((s) => s.loadDocument);
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!flowId || !isSuccess || !data) {
      return;
    }
    const doc = draftToWorkflowDocument(data, flowId);
    loadDocument(doc);
    hasSyncedRef.current = true;
  }, [flowId, isSuccess, data, loadDocument]);

  useEffect(() => {
    if (!flowId) {
      hasSyncedRef.current = false;
    }
  }, [flowId]);
}
