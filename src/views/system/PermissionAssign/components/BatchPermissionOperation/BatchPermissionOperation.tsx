import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useState, useCallback, memo } from 'react';
import type React from 'react';
import { permissionAssignService } from '@/services/system/permission/PermissionAssign/permissionAssignApi';
import { permissionButtonService } from '@/services/system/permission/PermissionButton/permissionButtonApi';
import { roleService } from '@/services/system/role/roleApi';
import {
  OperationConfigBar,
  RoleSelector,
  PermissionSelector,
  BatchOperationModal,
} from './index';

/**
 * 批量权限操作组件
 * 提供批量分配和回收权限的功能
 */
const BatchPermissionOperation: React.FC = memo(() => {
  const queryClient = useQueryClient();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permissionType, setPermissionType] = useState<'menu' | 'button' | 'interface'>('menu');
  const [operationType, setOperationType] = useState<'assign' | 'revoke'>('assign');
  const [batchModalVisible, setBatchModalVisible] = useState(false);

  /**
   * 查询角色列表
   */
  const { data: roleListResponse, isLoading: roleListLoading } = useQuery({
    queryKey: ['role-list-page'],
    queryFn: () => roleService.getRoleListPage({ pageNum: 1, pageSize: 100 }),
  });

  /**
   * 查询权限列表
   */
  const { data: permissionList, isLoading: permissionListLoading } = useQuery({
    queryKey: ['permission-list', permissionType],
    queryFn: () => {
      switch (permissionType) {
        case 'menu':
          return permissionButtonService.getButtonList({}); // 这里应该调用菜单API
        case 'button':
          return permissionButtonService.getButtonList({});
        case 'interface':
          return Promise.resolve([]); // 接口权限API待实现
        default:
          return Promise.resolve([]);
      }
    },
  });

  /**
   * 批量操作权限的mutation
   */
  const batchOperationMutation = useMutation({
    mutationFn: async ({
      roleIds,
      permissionIds,
    }: {
      roleIds: string[];
      permissionIds: string[];
      operation: 'assign' | 'revoke';
    }) => {
      const promises = roleIds.map((roleId) =>
        permissionAssignService.assignRolePermission(roleId, permissionType, permissionIds),
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      message.success('批量操作成功');
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      setSelectedRoles([]);
      setSelectedPermissions([]);
      setBatchModalVisible(false);
    },
    onError: (error: any) => {
      message.error(error.message || '批量操作失败');
    },
  });

  /**
   * 处理角色选择
   * @param roleIds 选中的角色ID列表
   */
  const handleRoleSelect = useCallback((roleIds: string[]) => {
    setSelectedRoles(roleIds);
  }, []);

  /**
   * 处理权限选择
   * @param permissionIds 选中的权限ID列表
   */
  const handlePermissionSelect = useCallback((permissionIds: string[]) => {
    setSelectedPermissions(permissionIds);
  }, []);

  /**
   * 处理权限类型变化
   * @param type 权限类型
   */
  const handlePermissionTypeChange = useCallback((type: 'menu' | 'button' | 'interface') => {
    setPermissionType(type);
    setSelectedPermissions([]);
  }, []);

  /**
   * 处理操作类型变化
   * @param type 操作类型
   */
  const handleOperationTypeChange = useCallback((type: 'assign' | 'revoke') => {
    setOperationType(type);
  }, []);

  /**
   * 处理批量操作
   */
  const handleBatchOperation = useCallback(() => {
    if (selectedRoles.length === 0) {
      message.warning('请选择角色');
      return;
    }
    if (selectedPermissions.length === 0) {
      message.warning('请选择权限');
      return;
    }

    setBatchModalVisible(true);
  }, [selectedRoles, selectedPermissions]);

  /**
   * 处理确认批量操作
   */
  const handleConfirmBatchOperation = useCallback(() => {
    batchOperationMutation.mutate({
      roleIds: selectedRoles,
      permissionIds: selectedPermissions,
      operation: operationType,
    });
  }, [selectedRoles, selectedPermissions, operationType, batchOperationMutation]);

  /**
   * 处理刷新
   */
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['role-list-page'] });
    queryClient.invalidateQueries({ queryKey: ['permission-list', permissionType] });
  }, [queryClient, permissionType]);

  /**
   * 是否可以执行操作
   */
  const canExecute = selectedRoles.length > 0 && selectedPermissions.length > 0;

  /**
   * 是否正在加载
   */
  const isLoading = roleListLoading || permissionListLoading;

  return (
    <div className="h-full flex flex-col gap-4">
      {/* 操作配置栏 */}
      <OperationConfigBar
        permissionType={permissionType}
        operationType={operationType}
        isLoading={isLoading}
        canExecute={canExecute}
        onPermissionTypeChange={handlePermissionTypeChange}
        onOperationTypeChange={handleOperationTypeChange}
        onRefresh={handleRefresh}
        onBatchOperation={handleBatchOperation}
      />

      {/* 角色和权限选择 */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        {/* 角色选择 */}
        <RoleSelector
          selectedRoles={selectedRoles}
          roleList={roleListResponse?.records || []}
          isLoading={roleListLoading}
          onRoleSelect={handleRoleSelect}
        />

        {/* 权限选择 */}
        <PermissionSelector
          selectedPermissions={selectedPermissions}
          permissionList={permissionList || []}
          permissionType={permissionType}
          isLoading={permissionListLoading}
          onPermissionSelect={handlePermissionSelect}
        />
      </div>

      {/* 批量操作确认弹窗 */}
      <BatchOperationModal
        visible={batchModalVisible}
        operationType={operationType}
        selectedRoles={selectedRoles}
        selectedPermissions={selectedPermissions}
        roleList={roleListResponse?.records || []}
        permissionList={permissionList || []}
        confirmLoading={batchOperationMutation.isPending}
        onConfirm={handleConfirmBatchOperation}
        onCancel={() => setBatchModalVisible(false)}
      />
    </div>
  );
});

BatchPermissionOperation.displayName = 'BatchPermissionOperation';

export default BatchPermissionOperation;
