import { usePermission } from '@/hooks/usePermission';

/**
 * 端点权限相关的 hooks
 */
export const useEndpointPermissions = () => {
  // 新增端点权限
  const canAddEndpoint = usePermission(['integrated:endpoint:add']);
  // 编辑端点权限
  const canEditEndpoint = usePermission(['integrated:endpoint:edit']);
  // 删除端点权限
  const canDeleteEndpoint = usePermission(['integrated:endpoint:delete']);
  // 导出端点权限
  const canExportEndpoint = usePermission(['integrated:endpoint:export']);
  // 导入端点权限
  const canImportEndpoint = usePermission(['integrated:endpoint:import']);
  // 测试端点权限
  const canTestEndpoint = usePermission(['integrated:endpoint:test']);
  // 查看端点详情权限
  const canViewEndpoint = usePermission(['integrated:endpoint:view']);

  return {
    canAddEndpoint,
    canEditEndpoint,
    canDeleteEndpoint,
    canExportEndpoint,
    canImportEndpoint,
    canTestEndpoint,
    canViewEndpoint,
  };
};
