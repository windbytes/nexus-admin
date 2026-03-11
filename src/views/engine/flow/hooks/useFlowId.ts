/**
 * 根据 appId 解析当前编辑的 flowId（流程定义 ID）
 * 若该应用下无流程定义则自动创建一条默认流程，供版本/草稿/路由等接口使用
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { flowDefinitionService } from '@/services/engine/flow/api';
import type { FlowDefinition } from '@/services/engine/flow/types';

export const flowDefinitionQueryKeys = {
  listByApp: (appId: string) => ['engine', 'flow-definitions', appId] as const,
};

/**
 * 返回当前 app 下的 flowId（取第一个流程定义，若无则创建默认流程）
 * @param appId 应用 ID（来自路由）
 * @returns flowId、loading、error、refetch
 */
export function useFlowId(appId: string | undefined) {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: flowDefinitionQueryKeys.listByApp(appId ?? ''),
    queryFn: () => (appId ? flowDefinitionService.listByAppId(appId) : Promise.resolve([])),
    enabled: !!appId,
  });

  const createMutation = useMutation({
    mutationFn: (payload: { appId: string; tenantId: string; flowKey: string; flowName: string }) =>
      flowDefinitionService.create(payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: flowDefinitionQueryKeys.listByApp(variables.appId) });
    },
  });

  useEffect(() => {
    if (!appId || !listQuery.isSuccess || listQuery.data.length > 0) {
      return;
    }
    if (createMutation.isPending || createMutation.data) {
      return;
    }
    createMutation.mutate({
      appId,
      tenantId: '1',
      flowKey: 'DEFAULT',
      flowName: '默认流程',
    });
  }, [appId, listQuery.isSuccess, listQuery.data?.length, createMutation.isPending, createMutation.data]);

  const flowId = useMemo(() => {
    if (listQuery.data && listQuery.data.length > 0) {
      return listQuery.data[0].id;
    }
    return createMutation.data?.id;
  }, [listQuery.data, createMutation.data?.id]);

  const isLoading =
    listQuery.isLoading || (listQuery.isSuccess && listQuery.data.length === 0 && createMutation.isPending);

  return {
    flowId,
    flowDefinition: listQuery.data?.[0] as FlowDefinition | undefined,
    isLoading,
    error: listQuery.error ?? createMutation.error,
    refetch: listQuery.refetch,
  };
}
