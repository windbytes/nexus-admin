import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { workflowService } from '@/services/integrated/workflow/workflowApi';
import type { WorkflowConfigResponse } from '@/services/integrated/workflow/type';
import { useWorkflowStore } from '../store/workflowStore';
import type { WorkflowDocument } from '../types';

export const workflowQueryKeys = {
  all: ['workflow'] as const,
  config: (appId: string) => [...workflowQueryKeys.all, 'config', appId] as const,
  runStatus: (appId: string) => [...workflowQueryKeys.all, 'runStatus', appId] as const,
};

/**
 * 根据 appId 查询流程配置（节点、边、节点属性配置）
 * 启用条件：appId 存在
 */
export function useWorkflowConfigQuery(appId: string | undefined) {
  return useQuery({
    queryKey: workflowQueryKeys.config(appId ?? ''),
    queryFn: () => {
      if (!appId) {
        throw new Error('appId is required');
      }
      return workflowService.getWorkflowConfig(appId);
    },
    enabled: !!appId,
  });
}

/**
 * 根据 appId 查询流程运行状态
 * 可选轮询（如 5s）用于运行中状态刷新
 */
export function useWorkflowRunStatusQuery(appId: string | undefined) {
  return useQuery({
    queryKey: workflowQueryKeys.runStatus(appId ?? ''),
    queryFn: () => {
      if (!appId) {
        throw new Error('appId is required');
      }
      return workflowService.getWorkflowRunStatus(appId);
    },
    enabled: !!appId,
  });
}

/** 将后端配置转为 WorkflowDocument，供 loadDocument 使用 */
function toWorkflowDocument(res: WorkflowConfigResponse, appId?: string): WorkflowDocument {
  return {
    version: res.version ?? 1,
    nodes: res.nodes as WorkflowDocument['nodes'],
    edges: res.edges as WorkflowDocument['edges'],
    meta: res.meta ?? (appId ? { appId, updatedAt: new Date().toISOString() } : undefined),
  };
}

/**
 * 同步流程配置查询结果到 store：当接口返回数据时写入 loadDocument
 * 仅在初次加载或 appId 变化时同步，避免覆盖用户未保存的本地编辑
 */
export function useWorkflowConfigSync(appId: string | undefined) {
  const { data, isSuccess } = useWorkflowConfigQuery(appId);
  const loadDocument = useWorkflowStore((s) => s.loadDocument);
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!appId || !isSuccess || !data) {
      return;
    }
    const doc = toWorkflowDocument(data, appId);
    loadDocument(doc);
    hasSyncedRef.current = true;
  }, [appId, isSuccess, data, loadDocument]);

  useEffect(() => {
    if (!appId) {
      hasSyncedRef.current = false;
    }
  }, [appId]);
}
