import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useState, useCallback, memo, useEffect } from 'react';
import type React from 'react';
import { permissionAssignService } from '@/services/system/permission/PermissionAssign/permissionAssignApi';
import RoleSelectorBar from './RoleSelectorBar';
import OperationButtons from './OperationButtons';
import PermissionTabsContainer from './PermissionTabsContainer';
import { Card, Row, Col } from 'antd';

/**
 * 角色权限分配组件Props
 */
interface RolePermissionAssignProps {
  /** 角色ID，如果提供则直接使用，否则需要选择角色 */
  roleCode?: string;
  /** 完成回调 */
  onComplete?: () => void;
  /** 是否显示角色选择器 */
  showRoleSelector?: boolean;
  /** 是否显示保存按钮 */
  showSaveButton?: boolean;
  /** 是否显示刷新按钮 */
  showRefreshButton?: boolean;
}

/**
 * 角色权限分配组件
 * 为角色分配菜单权限、按钮权限和接口权限
 */
const RolePermissionAssign: React.FC<RolePermissionAssignProps> = memo(({
  roleCode: propRoleCode,
  onComplete,
  showRoleSelector = true,
  showSaveButton = true,
  showRefreshButton = true,
}) => {
  const queryClient = useQueryClient();
  const [selectedRoleCode, setSelectedRoleCode] = useState<string | null>(propRoleCode || null);
  const [activeTab, setActiveTab] = useState<'menu' | 'button' | 'interface'>('menu');
  // 选中的权限keys
  const [menuCheckedKeys, setMenuCheckedKeys] = useState<string[]>([]);
  const [buttonCheckedKeys, setButtonCheckedKeys] = useState<string[]>([]);
  const [interfaceCheckedKeys, setInterfaceCheckedKeys] = useState<string[]>([]);

  // 使用传入的roleId或内部选择的roleId
  const currentRoleCode = propRoleCode || selectedRoleCode;

  /**
   * 查询角色当前权限详情
   */
  const { data: rolePermissions, isLoading: rolePermissionsLoading } = useQuery({
    queryKey: ['role-permissions', currentRoleCode],
    queryFn: () => permissionAssignService.getRolePermissionDetail(currentRoleCode || ''),
    enabled: !!currentRoleCode,
  });

  /**
   * 当角色权限查询成功时，初始化权限选中状态
   */
  useEffect(() => {
    if (rolePermissions) {
      setMenuCheckedKeys(rolePermissions.menuPermissions || []);
      setButtonCheckedKeys(rolePermissions.buttonPermissions || []);
      setInterfaceCheckedKeys(rolePermissions.interfacePermissions || []);
    }
  }, [rolePermissions]);

  /**
   * 分配权限的mutation
   */
  const assignPermissionMutation = useMutation({
    mutationFn: ({
      permissionType,
      permissionIds,
    }: {
      permissionType: 'menu' | 'button' | 'interface';
      permissionIds: string[];
    }) => permissionAssignService.assignRolePermission(currentRoleCode || '', permissionType, permissionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions', currentRoleCode] });
      onComplete?.();
    }
  });

  /**
   * 处理角色选择
   */
  const handleRoleSelect = useCallback((roleCode: string) => {
    setSelectedRoleCode(roleCode);
  }, []);

  /**
   * 处理菜单权限变化
   */
  const handleMenuPermissionChange = useCallback((checkedKeys: string[]) => {
    setMenuCheckedKeys(checkedKeys);
  }, []);

  /**
   * 处理按钮权限变化
   */
  const handleButtonPermissionChange = useCallback((checkedKeys: string[]) => {
    setButtonCheckedKeys(checkedKeys);
  }, []);

  /**
   * 处理接口权限变化
   */
  const handleInterfacePermissionChange = useCallback((checkedKeys: string[]) => {
    setInterfaceCheckedKeys(checkedKeys);
  }, []);

  /**
   * 处理保存权限
   */
  const handleSavePermissions = useCallback(() => {
    if (!currentRoleCode) {
      message.warning('请先选择角色');
      return;
    }

    const permissionIds =
      activeTab === 'menu' ? menuCheckedKeys : activeTab === 'button' ? buttonCheckedKeys : interfaceCheckedKeys;

    assignPermissionMutation.mutate({
      permissionType: activeTab,
      permissionIds,
    });
  }, [currentRoleCode, activeTab, menuCheckedKeys, buttonCheckedKeys, interfaceCheckedKeys, assignPermissionMutation]);

  /**
   * 处理刷新
   */
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['role-permissions', currentRoleCode] });
  }, [queryClient, currentRoleCode]);

  /**
   * 处理tab切换
   */
  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key as 'menu' | 'button' | 'interface');
  }, []);


  return (
    <div className="h-full flex flex-col gap-4">
      {/* 角色选择栏和操作按钮 */}
      {showRoleSelector && (
        <Card size="small">
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <RoleSelectorBar
                currentRoleCode={currentRoleCode}
                onRoleChange={handleRoleSelect}
              />
            </Col>
            <OperationButtons
              onSavePermissions={handleSavePermissions}
              onRefresh={handleRefresh}
              hasRole={!!currentRoleCode}
              showSaveButton={showSaveButton}
              showRefreshButton={showRefreshButton}
              saveLoading={assignPermissionMutation.isPending}
              activeTab={activeTab}
            />
          </Row>
        </Card>
      )}

      {/* 权限分配主要内容 */}
      <PermissionTabsContainer
        currentRoleCode={currentRoleCode}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        menuCheckedKeys={menuCheckedKeys}
        buttonCheckedKeys={buttonCheckedKeys}
        interfaceCheckedKeys={interfaceCheckedKeys}
        onMenuPermissionChange={handleMenuPermissionChange}
        onButtonPermissionChange={handleButtonPermissionChange}
        onInterfacePermissionChange={handleInterfacePermissionChange}
        isLoading={rolePermissionsLoading}
      />
    </div>
  );
});

export default RolePermissionAssign;
