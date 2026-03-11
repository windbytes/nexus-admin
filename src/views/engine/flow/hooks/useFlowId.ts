/**
 * 根据 appId 解析当前编辑的 flowId（流程定义 ID）
 * 仅加载该应用下已配置的流程定义，不自动创建；创建/修改流程定义在用户点击保存时进行
 */
import { useQuery } from '@tanstack/react-query';
import { flowDefinitionService } from '@/services/engine/flow/api';
import type { FlowDefinition } from '@/services/engine/flow/types';

export const flowDefinitionQueryKeys = {
  listByApp: (appId: string) => ['engine', 'flow-definitions', appId] as const,
};

/**
 * 返回当前 app 下的 flowId（取第一个流程定义；若无则返回 undefined，由保存时再创建）
 * @param appId 应用 ID（来自路由）
 * @returns flowId、flowDefinition、loading、error、refetch
 */
export function useFlowId(appId: string | undefined) {
  const listQuery = useQuery({
    queryKey: flowDefinitionQueryKeys.listByApp(appId ?? ''),
    queryFn: () => (appId ? flowDefinitionService.listByAppId(appId) : Promise.resolve([])),
    enabled: !!appId,
  });

  const flowId = listQuery.data?.[0]?.id;
  const flowDefinition = listQuery.data?.[0] as FlowDefinition | undefined;

  return {
    flowId,
    flowDefinition,
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    refetch: listQuery.refetch,
  };
}
