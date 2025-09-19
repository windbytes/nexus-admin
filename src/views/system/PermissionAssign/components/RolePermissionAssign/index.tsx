import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Select, Button, Space, message, Spin, Tabs, Row, Col } from 'antd';
import { UserOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { useState, useCallback, useMemo } from 'react';
import type React from 'react';
import { permissionAssignService } from '@/services/system/permission/PermissionAssign/permissionAssignApi';
import { roleService } from '@/services/system/role/roleApi';
import MenuPermissionTree from './MenuPermissionTree';
import ButtonPermissionTree from './ButtonPermissionTree';
import InterfacePermissionGrid from './InterfacePermissionGrid';
import type { RoleModel } from '@/services/system/role/type';

/**
 * 角色权限分配组件Props
 */
interface RolePermissionAssignProps {
  /** 角色ID，如果提供则直接使用，否则需要选择角色 */
  roleId?: string;
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
const RolePermissionAssign: React.FC<RolePermissionAssignProps> = ({
  roleId: propRoleId,
  onComplete,
  showRoleSelector = true,
  showSaveButton = true,
  showRefreshButton = true,
}) => {
  const queryClient = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(propRoleId || null);
  const [activeTab, setActiveTab] = useState<'menu' | 'button' | 'interface'>('menu');
  const [menuCheckedKeys, setMenuCheckedKeys] = useState<string[]>([]);
  const [buttonCheckedKeys, setButtonCheckedKeys] = useState<string[]>([]);
  const [interfaceCheckedKeys, setInterfaceCheckedKeys] = useState<string[]>([]);

  // 使用传入的roleId或内部选择的roleId
  const currentRoleId = propRoleId || selectedRoleId;

  /**
   * 查询角色列表
   */
  const { data: roleListResponse, isLoading: roleListLoading } = useQuery({
    queryKey: ['role-list'],
    queryFn: () => roleService.getRoleListPage({ pageNum: 1, pageSize: 100 }),
    enabled: showRoleSelector,
  });

  /**
   * 查询角色当前权限
   */
  const { data: rolePermissions, isLoading: rolePermissionsLoading } = useQuery({
    queryKey: ['role-permissions', currentRoleId],
    queryFn: () => permissionAssignService.getRolePermissionDetail(currentRoleId || ''),
    enabled: !!currentRoleId,
  });

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
    }) => permissionAssignService.assignRolePermission(currentRoleId || '', permissionType, permissionIds),
    onSuccess: () => {
      message.success('权限分配成功');
      queryClient.invalidateQueries({ queryKey: ['role-permissions', currentRoleId] });
      onComplete?.();
    },
    onError: (error: any) => {
      message.error(error.message || '权限分配失败');
    },
  });

  /**
   * 初始化选中的权限
   */
  useMemo(() => {
    if (rolePermissions) {
      setMenuCheckedKeys(rolePermissions.menuPermissions || []);
      setButtonCheckedKeys(rolePermissions.buttonPermissions || []);
      setInterfaceCheckedKeys(rolePermissions.interfacePermissions || []);
    }
  }, [rolePermissions]);

  /**
   * 处理角色选择
   * @param roleId 选中的角色ID
   */
  const handleRoleSelect = useCallback((roleId: string) => {
    setSelectedRoleId(roleId);
  }, []);

  /**
   * 处理菜单权限变化
   * @param checkedKeys 选中的菜单权限keys
   */
  const handleMenuPermissionChange = useCallback((checkedKeys: string[]) => {
    setMenuCheckedKeys(checkedKeys);
  }, []);

  /**
   * 处理按钮权限变化
   * @param checkedKeys 选中的按钮权限keys
   */
  const handleButtonPermissionChange = useCallback((checkedKeys: string[]) => {
    setButtonCheckedKeys(checkedKeys);
  }, []);

  /**
   * 处理接口权限变化
   * @param checkedKeys 选中的接口权限keys
   */
  const handleInterfacePermissionChange = useCallback((checkedKeys: string[]) => {
    setInterfaceCheckedKeys(checkedKeys);
  }, []);

  /**
   * 处理保存权限
   */
  const handleSavePermissions = useCallback(() => {
    if (!currentRoleId) {
      message.warning('请先选择角色');
      return;
    }

    const permissionIds =
      activeTab === 'menu' ? menuCheckedKeys : activeTab === 'button' ? buttonCheckedKeys : interfaceCheckedKeys;

    assignPermissionMutation.mutate({
      permissionType: activeTab,
      permissionIds,
    });
  }, [currentRoleId, activeTab, menuCheckedKeys, buttonCheckedKeys, interfaceCheckedKeys, assignPermissionMutation]);

  /**
   * 处理刷新
   */
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['role-permissions', currentRoleId] });
  }, [queryClient, currentRoleId]);

  /**
   * 获取角色选项
   */
  const roleOptions = useMemo(() => {
    if (!roleListResponse?.records) return [];
    return roleListResponse.records.map((role: RoleModel) => ({
      label: role.roleName,
      value: role.id,
    }));
  }, [roleListResponse?.records]);

  /**
   * 渲染权限内容
   * @param permissionComponent 权限组件
   */
  const renderPermissionContent = (permissionComponent: React.ReactNode) => {
    if (!currentRoleId) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <UserOutlined className="text-4xl mb-4" />
            <p>请先选择角色</p>
          </div>
        </div>
      );
    }

    if (rolePermissionsLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      );
    }

    return permissionComponent;
  };


  return (
    <div className="h-full flex flex-col gap-4">
      {/* 角色选择栏 */}
      {showRoleSelector && (
        <Card size="small" variant="borderless">
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Space>
                <UserOutlined className="text-gray-500" />
                <span className="font-medium">选择角色：</span>
                <Select
                  placeholder="请选择要分配权限的角色"
                  style={{ width: 300 }}
                  value={currentRoleId}
                  onChange={handleRoleSelect}
                  loading={roleListLoading}
                  showSearch
                  filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                  options={roleOptions}
                />
              </Space>
            </Col>
            <Col>
              <Space>
                {showRefreshButton && (
                  <Button
                    type="text"
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    loading={rolePermissionsLoading}
                  >
                    刷新
                  </Button>
                )}
                {showSaveButton && (
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSavePermissions}
                    loading={assignPermissionMutation.isPending}
                    disabled={!currentRoleId}
                  >
                    保存权限
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      {/* 权限分配内容 */}
      <div className="flex-1">
        <Card
          title={`${activeTab === 'menu' ? '菜单' : activeTab === 'button' ? '按钮' : '接口'}权限分配`}
          className="h-full flex flex-col"
          styles={{ body: { flex: 1 } }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as 'menu' | 'button' | 'interface')}
            items={[
              {
                key: 'menu',
                label: '菜单权限',
                children: renderPermissionContent(
                  <MenuPermissionTree checkedKeys={menuCheckedKeys} onCheck={handleMenuPermissionChange} />
                ),
              },
              {
                key: 'button',
                label: '按钮权限',
                children: renderPermissionContent(
                  <ButtonPermissionTree checkedKeys={buttonCheckedKeys} onCheck={handleButtonPermissionChange} />
                ),
              },
              {
                key: 'interface',
                label: '接口权限',
                children: renderPermissionContent(
                  <InterfacePermissionGrid checkedKeys={interfaceCheckedKeys} onCheck={handleInterfacePermissionChange} />
                ),
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
};

export default RolePermissionAssign;
