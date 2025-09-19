import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Select, Button, Space, message, Table, Modal, Row, Col, Spin, Tag } from 'antd';
import { ReloadOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { useState, useCallback, useMemo, useId } from 'react';
import type React from 'react';
import { permissionAssignService } from '@/services/system/permission/PermissionAssign/permissionAssignApi';
import { permissionButtonService } from '@/services/system/permission/PermissionButton/permissionButtonApi';
import { roleService } from '@/services/system/role/roleApi';
import type { TableProps } from 'antd';

/**
 * 批量权限操作组件
 * 提供批量分配和回收权限的功能
 */
const BatchPermissionOperation: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permissionType, setPermissionType] = useState<'menu' | 'button' | 'interface'>('menu');
  const [operationType, setOperationType] = useState<'assign' | 'revoke'>('assign');
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const permissionTypeId = useId();
  const operationTypeId = useId();

  /**
   * 查询角色列表
   */
  const { data: roleListResponse, isLoading: roleListLoading } = useQuery({
    queryKey: ['role-list'],
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
          return permissionButtonService.getButtonList({ pageNum: 1, pageSize: 100 }); // 这里应该调用菜单API
        case 'button':
          return permissionButtonService.getButtonList({ pageNum: 1, pageSize: 100 });
        case 'interface':
          return Promise.resolve({ records: [], pageNumber: 1, pageSize: 100, totalRow: 0, totalPage: 1 }); // 接口权限API待实现
        default:
          return Promise.resolve({ records: [], pageNumber: 1, pageSize: 100, totalRow: 0, totalPage: 1 });
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
    queryClient.invalidateQueries({ queryKey: ['role-list'] });
    queryClient.invalidateQueries({ queryKey: ['permission-list', permissionType] });
  }, [queryClient, permissionType]);

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
   * 获取权限选项
   */
  const permissionOptions = useMemo(() => {
    if (!permissionList?.records) return [];
    return permissionList.records.map((permission: any) => ({
      label: permission.name || permission.code,
      value: permission.id,
    }));
  }, [permissionList?.records]);

  /**
   * 角色表格列定义
   */
  const roleColumns: TableProps<any>['columns'] = useMemo(
    () => [
      {
        title: '角色名称',
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
        title: '角色编码',
        dataIndex: 'code',
        key: 'code',
        render: (code: string) => <Tag color="blue">{code}</Tag>,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status: boolean) => <Tag color={status ? 'green' : 'red'}>{status ? '启用' : '禁用'}</Tag>,
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
      },
    ],
    [],
  );

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* 操作配置栏 */}
      <Card title="批量操作配置" size="small">
        <Row gutter={16}>
          <Col span={6}>
            <div className="space-y-2">
              <label htmlFor={permissionTypeId} className="text-sm font-medium">
                权限类型：
              </label>
              <Select
                id={permissionTypeId}
                value={permissionType}
                onChange={handlePermissionTypeChange}
                style={{ width: '100%' }}
                options={[
                  { label: '菜单权限', value: 'menu' },
                  { label: '按钮权限', value: 'button' },
                  { label: '接口权限', value: 'interface' },
                ]}
              />
            </div>
          </Col>
          <Col span={6}>
            <div className="space-y-2">
              <label htmlFor={operationTypeId} className="text-sm font-medium">
                操作类型：
              </label>
              <Select
                id={operationTypeId}
                value={operationType}
                onChange={handleOperationTypeChange}
                style={{ width: '100%' }}
                options={[
                  { label: '分配权限', value: 'assign' },
                  { label: '回收权限', value: 'revoke' },
                ]}
              />
            </div>
          </Col>
          <Col span={12}>
            <div className="flex justify-end items-end h-full">
              <Space>
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={roleListLoading || permissionListLoading}
                >
                  刷新
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleBatchOperation}
                  disabled={selectedRoles.length === 0 || selectedPermissions.length === 0}
                >
                  执行批量操作
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 角色和权限选择 */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        {/* 角色选择 */}
        <Card title="选择角色" size="small" className="h-full">
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <Select
                mode="multiple"
                placeholder="请选择角色"
                value={selectedRoles}
                onChange={handleRoleSelect}
                style={{ width: '100%' }}
                options={roleOptions}
                loading={roleListLoading}
                showSearch
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              />
            </div>
            <div className="flex-1 overflow-auto">
              <Table
                columns={roleColumns}
                dataSource={roleListResponse?.records?.filter((role: any) => selectedRoles.includes(role.id)) || []}
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ y: 200 }}
              />
            </div>
          </div>
        </Card>

        {/* 权限选择 */}
        <Card
          title={`选择${permissionType === 'menu' ? '菜单' : permissionType === 'button' ? '按钮' : '接口'}权限`}
          size="small"
          className="h-full"
        >
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <Select
                mode="multiple"
                placeholder={`请选择${permissionType === 'menu' ? '菜单' : permissionType === 'button' ? '按钮' : '接口'}权限`}
                value={selectedPermissions}
                onChange={handlePermissionSelect}
                style={{ width: '100%' }}
                options={permissionOptions}
                loading={permissionListLoading}
                showSearch
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              />
            </div>
            <div className="flex-1 overflow-auto">
              {permissionListLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Spin />
                </div>
              ) : (
                <div className="space-y-2">
                  {permissionList?.records
                    ?.filter((permission: any) => selectedPermissions.includes(permission.id))
                    .map((permission: any) => (
                      <div
                        key={permission.id}
                        className="p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{permission.name || permission.code}</span>
                          <Tag color="blue">{permission.code}</Tag>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* 批量操作确认弹窗 */}
      <Modal
        title="确认批量操作"
        open={batchModalVisible}
        onOk={handleConfirmBatchOperation}
        onCancel={() => setBatchModalVisible(false)}
        confirmLoading={batchOperationMutation.isPending}
        width={600}
      >
        <div className="py-4">
          <p className="mb-4">确定要{operationType === 'assign' ? '分配' : '回收'}以下权限吗？</p>
          <div className="space-y-2">
            <div>
              <strong>操作角色：</strong>
              <div className="mt-1">
                {selectedRoles.map((roleId) => {
                  const role = roleListResponse?.records?.find((r: any) => r.id === roleId);
                  return (
                    <Tag key={roleId} color="blue" className="mr-1">
                      {role?.roleName}
                    </Tag>
                  );
                })}
              </div>
            </div>
            <div>
              <strong>操作权限：</strong>
              <div className="mt-1">
                {selectedPermissions.map((permissionId) => {
                  const permission = permissionList?.records?.find((p: any) => p.id === permissionId);
                  return (
                    <Tag key={permissionId} color="green" className="mr-1">
                      {permission?.name || permission?.code}
                    </Tag>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BatchPermissionOperation;
