import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useState, useCallback, memo } from 'react';
import type React from 'react';
import { permissionAssignService } from '@/services/system/permission/PermissionAssign/permissionAssignApi';
import { permissionButtonService } from '@/services/system/permission/PermissionButton/permissionButtonApi';
import { roleService } from '@/services/system/role/roleApi';
import {
  RoleSelectorBar,
  RoleInfoCard,
  PermissionStatistics,
  DetailPermissionTabs,
} from './components';

/**
 * 权限预览组件Props
 */
interface PermissionPreviewProps {
  /** 角色ID，如果提供则直接使用，否则需要选择角色 */
  roleCode?: string;
  /** 是否显示角色选择器 */
  showRoleSelector?: boolean;
  /** 是否显示刷新按钮 */
  showRefreshButton?: boolean;
}

/**
 * 权限预览组件
 * 展示角色的完整权限信息
 */
const PermissionPreview: React.FC<PermissionPreviewProps> = memo(({
  roleCode: propRoleCode,
  showRoleSelector = true,
  showRefreshButton = true,
}) => {
  const [selectedRoleCode, setSelectedRoleCode] = useState<string | null>(propRoleCode || null);
  const queryClient = useQueryClient();
  // 使用传入的roleId或内部选择的roleId
  const currentRoleCode = propRoleCode || selectedRoleCode;

  /**
   * 查询角色列表
   */
  const { data: roleListResponse, isLoading: roleListLoading } = useQuery({
    queryKey: ['role-list-page'],
    queryFn: () => roleService.getRoleListPage({ pageNum: 1, pageSize: 100 }),
    enabled: showRoleSelector,
  });

  /**
   * 查询角色基本信息
   */
  const { data: roleInfo, isLoading: roleInfoLoading } = useQuery({
    queryKey: ['role-info', currentRoleCode],
    queryFn: () => roleService.getRoleDetail(currentRoleCode || ''),
    enabled: !!currentRoleCode,
  });

  /**
   * 查询角色权限详情
   */
  const { data: rolePermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['role-permissions', currentRoleCode],
    queryFn: () => permissionAssignService.getRolePermissionDetail(currentRoleCode || ''),
    enabled: !!currentRoleCode,
  });

  /**
   * 查询菜单权限详情
   */
  const { data: menuDetails, isLoading: menuDetailsLoading } = useQuery({
    queryKey: ['menu-details', rolePermissions?.menuPermissions],
    queryFn: () => {
      if (!rolePermissions?.menuPermissions?.length) return [];
      // 这里应该根据菜单ID查询菜单详情
      return Promise.resolve([]);
    },
    enabled: !!rolePermissions?.menuPermissions?.length,
  });

  /**
   * 查询按钮权限详情
   */
  const { data: buttonDetails, isLoading: buttonDetailsLoading } = useQuery({
    queryKey: ['button-details', rolePermissions?.buttonPermissions],
    queryFn: () => {
      if (!rolePermissions?.buttonPermissions?.length) return [];
      return permissionButtonService
        .getButtonList({})
        .then((response) =>
          response.filter((button: any) => rolePermissions.buttonPermissions?.includes(button.id)),
        );
    },
    enabled: !!rolePermissions?.buttonPermissions?.length,
  });

  /**
   * 处理角色选择
   * @param roleCode 选中的角色编码
   */
  const handleRoleSelect = useCallback((roleCode: string) => {
    setSelectedRoleCode(roleCode);
  }, []);

  /**
   * 处理刷新
   */
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['role-permissions', currentRoleCode] });
  }, [queryClient, currentRoleCode]);

  const isLoading = roleInfoLoading || permissionsLoading;

  return (
    <div className="h-full flex flex-col gap-4">
      {/* 角色选择栏 */}
      {showRoleSelector && (
        <RoleSelectorBar
          currentRoleCode={currentRoleCode}
          roleList={roleListResponse?.records || []}
          isLoading={roleListLoading}
          showRefreshButton={showRefreshButton}
          onRoleSelect={handleRoleSelect}
          onRefresh={handleRefresh}
        />
      )}

      {/* 权限预览内容 */}
      {!currentRoleCode ? (
        <Card className="h-full flex items-center justify-center">
          <div className="text-center text-gray-500">
            <UserOutlined className="text-4xl mb-4" />
            <p>请先选择角色</p>
          </div>
        </Card>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <div className="flex-1 space-y-4">
          {/* 角色基本信息 */}
          <RoleInfoCard roleInfo={roleInfo} />

          {/* 权限统计 */}
          <PermissionStatistics
            menuCount={rolePermissions?.menuPermissions?.length || 0}
            buttonCount={rolePermissions?.buttonPermissions?.length || 0}
            interfaceCount={rolePermissions?.interfacePermissions?.length || 0}
          />

          {/* 详细权限列表 */}
          <div className="flex-1">
            <DetailPermissionTabs
              menuDetails={menuDetails}
              menuDetailsLoading={menuDetailsLoading}
              buttonDetails={buttonDetails}
              buttonDetailsLoading={buttonDetailsLoading}
              menuCount={rolePermissions?.menuPermissions?.length || 0}
              buttonCount={rolePermissions?.buttonPermissions?.length || 0}
              interfaceCount={rolePermissions?.interfacePermissions?.length || 0}
            />
          </div>
        </div>
      )}
    </div>
  );
});

PermissionPreview.displayName = 'PermissionPreview';

export default PermissionPreview;
