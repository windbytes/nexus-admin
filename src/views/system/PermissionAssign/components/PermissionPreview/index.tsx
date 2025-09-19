import { useQuery } from '@tanstack/react-query';
import { Card, Select, Button, Space, Spin, Tabs, Row, Col, Descriptions, Tag, Table, Badge } from 'antd';
import { UserOutlined, ReloadOutlined } from '@ant-design/icons';
import { useState, useCallback, useMemo } from 'react';
import type React from 'react';
import { permissionAssignService } from '@/services/system/permission/PermissionAssign/permissionAssignApi';
import { permissionButtonService } from '@/services/system/permission/PermissionButton/permissionButtonApi';
import { roleService } from '@/services/system/role/roleApi';
import type { TableProps } from 'antd';

/**
 * 权限预览组件Props
 */
interface PermissionPreviewProps {
  /** 角色ID，如果提供则直接使用，否则需要选择角色 */
  roleId?: string;
  /** 是否显示角色选择器 */
  showRoleSelector?: boolean;
  /** 是否显示刷新按钮 */
  showRefreshButton?: boolean;
}

/**
 * 权限预览组件
 * 展示角色的完整权限信息
 */
const PermissionPreview: React.FC<PermissionPreviewProps> = ({
  roleId: propRoleId,
  showRoleSelector = true,
  showRefreshButton = true,
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(propRoleId || null);

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
   * 查询角色基本信息
   */
  const { data: roleInfo, isLoading: roleInfoLoading } = useQuery({
    queryKey: ['role-info', currentRoleId],
    queryFn: () => roleService.getRoleDetail(currentRoleId || ''),
    enabled: !!currentRoleId,
  });

  /**
   * 查询角色权限详情
   */
  const { data: rolePermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['role-permissions', currentRoleId],
    queryFn: () => permissionAssignService.getRolePermissionDetail(currentRoleId || ''),
    enabled: !!currentRoleId,
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
        .getButtonList({
          pageNum: 1,
          pageSize: 100,
        })
        .then((response) =>
          response.records.filter((button) => rolePermissions.buttonPermissions?.includes(button.id)),
        );
    },
    enabled: !!rolePermissions?.buttonPermissions?.length,
  });

  /**
   * 处理角色选择
   * @param roleId 选中的角色ID
   */
  const handleRoleSelect = useCallback((roleId: string) => {
    setSelectedRoleId(roleId);
  }, []);

  /**
   * 处理刷新
   */
  const handleRefresh = useCallback(() => {
    // 这里可以触发相关查询的刷新
  }, []);

  /**
   * 获取角色选项
   */
  const roleOptions = useMemo(() => {
    if (!roleListResponse?.records) return [];
    return roleListResponse.records.map((role: any) => ({
      label: role.name,
      value: role.id,
    }));
  }, [roleListResponse?.records]);

  /**
   * 菜单权限表格列定义
   */
  const menuColumns: TableProps<any>['columns'] = useMemo(
    () => [
      {
        title: '菜单名称',
        dataIndex: 'name',
        key: 'name',
        render: (name: string) => (
          <Space>
            <UserOutlined className="text-blue-500" />
            <span className="font-medium">{name}</span>
          </Space>
        ),
      },
      {
        title: '菜单路径',
        dataIndex: 'url',
        key: 'url',
        render: (url: string) => <Tag color="blue">{url || '-'}</Tag>,
      },
      {
        title: '组件路径',
        dataIndex: 'component',
        key: 'component',
        ellipsis: true,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status: boolean) => <Tag color={status ? 'green' : 'red'}>{status ? '启用' : '禁用'}</Tag>,
      },
    ],
    [],
  );

  /**
   * 按钮权限表格列定义
   */
  const buttonColumns: TableProps<any>['columns'] = useMemo(
    () => [
      {
        title: '按钮名称',
        dataIndex: 'name',
        key: 'name',
        render: (name: string) => (
          <Space>
            <UserOutlined className="text-orange-500" />
            <span className="font-medium">{name}</span>
          </Space>
        ),
      },
      {
        title: '权限标识',
        dataIndex: 'code',
        key: 'code',
        render: (code: string) => <Tag color="orange">{code}</Tag>,
      },
      {
        title: '所属菜单',
        dataIndex: 'parentMenuName',
        key: 'parentMenuName',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status: boolean) => <Tag color={status ? 'green' : 'red'}>{status ? '启用' : '禁用'}</Tag>,
      },
    ],
    [],
  );

  /**
   * 接口权限表格列定义
   */
  const interfaceColumns: TableProps<any>['columns'] = useMemo(
    () => [
      {
        title: '接口编码',
        dataIndex: 'code',
        key: 'code',
        render: (code: string) => (
          <Space>
            <UserOutlined className="text-purple-500" />
            <Tag color="purple">{code}</Tag>
          </Space>
        ),
      },
      {
        title: '接口描述',
        dataIndex: 'remark',
        key: 'remark',
        ellipsis: true,
      },
      {
        title: '关联按钮',
        dataIndex: 'buttonName',
        key: 'buttonName',
        render: (buttonName: string) => buttonName || '-',
      },
    ],
    [],
  );

  const isLoading = roleInfoLoading || permissionsLoading;

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* 角色选择栏 */}
      {showRoleSelector && (
        <Card size="small">
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Space>
                <UserOutlined className="text-gray-500" />
                <span className="font-medium">选择角色：</span>
                <Select
                  placeholder="请选择要查看权限的角色"
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
              {showRefreshButton && (
                <Button type="text" icon={<ReloadOutlined />} onClick={handleRefresh} loading={isLoading}>
                  刷新
                </Button>
              )}
            </Col>
          </Row>
        </Card>
      )}

      {/* 权限预览内容 */}
      {!currentRoleId ? (
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
          <Card title="角色信息" size="small">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="角色名称">
                <span className="font-medium">{roleInfo?.roleName || '-'}</span>
              </Descriptions.Item>
              <Descriptions.Item label="角色编码">
                <Tag color="blue">{roleInfo?.roleCode || '-'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={roleInfo?.status ? 'green' : 'red'}>{roleInfo?.status ? '启用' : '禁用'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="描述">{roleInfo?.remark || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 权限统计 */}
          <Card title="权限统计" size="small">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{rolePermissions?.menuPermissions?.length || 0}</div>
                <div className="text-sm text-gray-500">菜单权限</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {rolePermissions?.buttonPermissions?.length || 0}
                </div>
                <div className="text-sm text-gray-500">按钮权限</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {rolePermissions?.interfacePermissions?.length || 0}
                </div>
                <div className="text-sm text-gray-500">接口权限</div>
              </div>
            </div>
          </Card>

          {/* 详细权限列表 */}
          <div className="flex-1">
            <Card title="详细权限" size="small" className="h-full">
              <Tabs
                items={[
                  {
                    key: 'menu',
                    label: (
                      <Badge count={rolePermissions?.menuPermissions?.length || 0} size="small">
                        <span>菜单权限</span>
                      </Badge>
                    ),
                    children: (
                      <Table
                        columns={menuColumns}
                        dataSource={menuDetails || []}
                        loading={menuDetailsLoading}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        scroll={{ y: 300 }}
                        locale={{
                          emptyText: '暂无菜单权限',
                        }}
                      />
                    ),
                  },
                  {
                    key: 'button',
                    label: (
                      <Badge count={rolePermissions?.buttonPermissions?.length || 0} size="small">
                        <span>按钮权限</span>
                      </Badge>
                    ),
                    children: (
                      <Table
                        columns={buttonColumns}
                        dataSource={buttonDetails || []}
                        loading={buttonDetailsLoading}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        scroll={{ y: 300 }}
                        locale={{
                          emptyText: '暂无按钮权限',
                        }}
                      />
                    ),
                  },
                  {
                    key: 'interface',
                    label: (
                      <Badge count={rolePermissions?.interfacePermissions?.length || 0} size="small">
                        <span>接口权限</span>
                      </Badge>
                    ),
                    children: (
                      <Table
                        columns={interfaceColumns}
                        dataSource={[]} // 接口权限数据待实现
                        loading={false}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        scroll={{ y: 300 }}
                        locale={{
                          emptyText: '暂无接口权限',
                        }}
                      />
                    ),
                  },
                ]}
                className="h-full"
              />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionPreview;
