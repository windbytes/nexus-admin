import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ReloadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Card, Table, Button, Space, Tag, Tooltip, type TableProps, App, Modal, Select } from 'antd';
import { useState, useEffect, useMemo, useCallback } from 'react';
import type React from 'react';
import type { PermissionButtonModel } from '@/services/system/permission/PermissionButton/permissionButtonApi';
import { permissionButtonService } from '@/services/system/permission/PermissionButton/permissionButtonApi';

// 接口权限类型
interface InterfacePermission {
  id: string;
  code: string;
  remark: string;
  createTime: string;
  updateTime: string;
  path: string;
  method: string;
  name: string;
}

// 组件状态类型
interface ComponentState {
  permissionList: InterfacePermission[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPage: number;
  };
  // 添加映射相关状态
  addMappingModalVisible: boolean;
  availablePermissions: InterfacePermission[];
  selectedPermissionIds: string[];
}

/**
 * 按钮接口权限组件Props
 */
interface ButtonInterfacePermissionProps {
  button: PermissionButtonModel | null;
}

/**
 * 按钮接口权限组件
 * 展示按钮关联的接口权限列表
 */
const ButtonInterfacePermission: React.FC<ButtonInterfacePermissionProps> = ({ button }) => {
  const { modal } = App.useApp();
  const queryClient = useQueryClient();

  // 合并所有状态到一个对象中
  const [state, setState] = useState<ComponentState>({
    permissionList: [],
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
      totalPage: 0,
    },
    addMappingModalVisible: false,
    availablePermissions: [],
    selectedPermissionIds: [],
  });

  // 查询按钮接口权限数据
  const {
    isLoading,
    data: initialData,
    refetch,
  } = useQuery({
    queryKey: ['button-interface-permission', button?.id, state.pagination.current, state.pagination.pageSize],
    queryFn: async () => {
      if (!button?.id) return { records: [], totalRow: 0, pageNumber: 1, pageSize: 10, totalPage: 0 };
      const response = await permissionButtonService.getButtonInterfaces(button.id);
      return {
        records: response || [],
        totalRow: response?.length || 0,
        pageNumber: 1,
        pageSize: 10,
        totalPage: 1,
      };
    },
    enabled: !!button?.id,
  });

  // 查询可用的接口权限列表（用于添加映射）
  const {
    data: availablePermissionsData,
    isLoading: availablePermissionsLoading,
  } = useQuery({
    queryKey: ['available-interface-permissions'],
    queryFn: async () => {
      // 这里应该调用获取所有接口权限的API
      // 暂时返回空数组，实际项目中需要实现
      return [];
    },
    enabled: state.addMappingModalVisible,
  });

  // 添加映射的mutation
  const addMappingMutation = useMutation({
    mutationFn: async (permissionIds: string[]) => {
      if (!button?.id) throw new Error('按钮ID不能为空');
      return await permissionButtonService.assignButtonInterfaces(button.id, permissionIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['button-interface-permission', button?.id, state.pagination.current, state.pagination.pageSize],
      });
      updateState({ addMappingModalVisible: false, selectedPermissionIds: [] });
    },
  });

  // 删除映射的mutation
  const deleteMappingMutation = useMutation({
    mutationFn: async (mappingId: string) => {
      // 这里应该调用删除映射的API，暂时使用现有的方法
      return await permissionButtonService.deleteButton(mappingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['button-interface-permission', button?.id, state.pagination.current, state.pagination.pageSize],
      });
    },
  });

  // 初始化数据
  useEffect(() => {
    if (initialData?.records) {
      setState((prev) => ({
        ...prev,
        permissionList: initialData.records as unknown as InterfacePermission[],
        pagination: {
          current: initialData.pageNumber,
          pageSize: initialData.pageSize,
          total: initialData.totalRow,
          totalPage: initialData.totalPage,
        },
      }));
    }
  }, [initialData]);

  // 初始化可用权限数据
  useEffect(() => {
    if (availablePermissionsData) {
      setState((prev) => ({
        ...prev,
        availablePermissions: availablePermissionsData,
      }));
    }
  }, [availablePermissionsData]);

  // 更新状态的辅助函数
  const updateState = useCallback((updates: Partial<ComponentState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // 刷新数据
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // 处理分页变化
  const handleTableChange = useCallback(
    (pagination: any, _filters: any) => {
      updateState({
        pagination: {
          ...state.pagination,
          current: pagination.current,
          pageSize: pagination.pageSize,
        },
      });
    },
    [state.pagination, updateState],
  );

  // 处理添加映射
  const handleAddMapping = useCallback(() => {
    updateState({ addMappingModalVisible: true });
  }, [updateState]);

  // 处理取消添加映射
  const handleCancelAddMapping = useCallback(() => {
    updateState({ addMappingModalVisible: false, selectedPermissionIds: [] });
  }, [updateState]);

  // 处理确认添加映射
  const handleConfirmAddMapping = useCallback(() => {
    if (state.selectedPermissionIds.length === 0) {
      modal.warning({
        title: '请选择接口权限',
        content: '请至少选择一个接口权限进行映射',
      });
      return;
    }
    addMappingMutation.mutate(state.selectedPermissionIds);
  }, [state.selectedPermissionIds, addMappingMutation, modal]);

  // 处理删除映射
  const handleDeleteMapping = useCallback(
    (record: InterfacePermission) => {
      modal.confirm({
        title: '确认删除',
        content: `确定要删除接口权限映射 "${record.name}" 吗？`,
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          deleteMappingMutation.mutate(record.id);
        },
      });
    },
    [deleteMappingMutation, modal],
  );


  // 表格列定义
  const columns: TableProps<InterfacePermission>['columns'] = useMemo(
    () => [
      {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
        width: 80,
        align: 'center',
        render: (_text: string, _record: InterfacePermission, index: number) => index + 1,
      },
      {
        title: '权限标识',
        dataIndex: 'code',
        key: 'code',
        render: (text: string) => <Tag color="blue">{text}</Tag>,
      },
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        render: (text: string) => <span className="font-medium">{text}</span>,
      },
      {
        title: '路径',
        dataIndex: 'path',
        key: 'path',
        ellipsis: true,
      },
      {
        title: '方法',
        dataIndex: 'method',
        width: 100,
        align: 'center',
        key: 'method',
        render: (text: string) => <Tag color="green">{text}</Tag>,
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
        ellipsis: true,
      },
      {
        title: '操作',
        key: 'action',
        width: 100,
        align: 'center',
        render: (_text: string, record: InterfacePermission) => (
          <Space size="small">
            <Tooltip title="删除映射">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => handleDeleteMapping(record)}
                loading={deleteMappingMutation.isPending}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [handleDeleteMapping, deleteMappingMutation.isPending],
  );

  return (
    <Card
      className="flex-1 max-h-full flex flex-col"
      title="接口权限列表"
      styles={{ body: { flex: 1 } }}
      extra={
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddMapping}
            disabled={!button?.id}
          >
            添加映射
          </Button>
          <Button
            color="default"
            variant="outlined"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={isLoading}
          >
            刷新
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        loading={isLoading}
        dataSource={state.permissionList}
        rowKey="id"
        className="interface-permission-table"
        pagination={{
          current: state.pagination.current,
          pageSize: state.pagination.pageSize,
          total: state.pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
        scroll={{ x: 'max-content', y: '100%' }}
        size="middle"
        bordered
        footer={() => {
          const hasButtonData = !!button?.id;
          const hasMappings = state.permissionList.length > 0;

          return (
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-500 mb-2">
                {!hasButtonData && <span className="text-gray-400">📋 请先选择按钮</span>}
                {hasButtonData && !hasMappings && <span className="text-gray-400">📋 暂无接口权限映射，点击上方"添加映射"按钮进行映射</span>}
                {hasButtonData && hasMappings && <span className="text-green-500">✅ 已映射 {state.permissionList.length} 个接口权限</span>}
              </div>
            </div>
          );
        }}
      />
      
      {/* 添加映射Modal */}
      <Modal
        title="添加接口权限映射"
        open={state.addMappingModalVisible}
        onOk={handleConfirmAddMapping}
        onCancel={handleCancelAddMapping}
        width={600}
        confirmLoading={addMappingMutation.isPending}
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            请选择要映射到按钮 "{button?.name}" 的接口权限：
          </div>
          <Select
            mode="multiple"
            placeholder="请选择接口权限"
            value={state.selectedPermissionIds}
            onChange={(value) => updateState({ selectedPermissionIds: value })}
            style={{ width: '100%' }}
            loading={availablePermissionsLoading}
            options={state.availablePermissions.map(permission => ({
              label: `${permission.name} (${permission.code})`,
              value: permission.id,
            }))}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
          <div className="text-xs text-gray-500">
            提示：接口权限的编辑需要在专门的接口权限管理模块中进行
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default ButtonInterfacePermission;