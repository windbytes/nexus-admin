import { DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { App, Button, Card, Space, Table, type TableProps, Tag, Tooltip } from 'antd';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MenuModel } from '@/services/system/menu/type';
import { permissionButtonService } from '@/services/system/permission/PermissionButton/permissionButtonApi';
import InterfacePermissionMappingModal from './InterfacePermissionMappingModal';

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
}

/**
 * 按钮接口权限组件Props
 */
interface ButtonInterfacePermissionProps {
  button: MenuModel | null;
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
  });

  // 查询按钮接口权限数据
  const {
    isFetching,
    data: initialData,
    refetch,
  } = useQuery({
    queryKey: ['button-interface-permission', button?.id, state.pagination.current, state.pagination.pageSize],
    queryFn: async () => {
      if (!button?.id) {
        return { records: [], totalRow: 0, pageNumber: 1, pageSize: 10, totalPage: 0 };
      }
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

  // 删除映射的mutation
  const deleteMappingMutation = useMutation({
    mutationFn: async ({ buttonId, interfaces }: { buttonId: string; interfaces: string[] }) => {
      // 这里应该调用删除映射的API，暂时使用现有的方法
      return await permissionButtonService.deleteMapping(buttonId, interfaces);
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
    [state.pagination, updateState]
  );

  // 处理添加映射
  const handleAddMapping = useCallback(() => {
    updateState({ addMappingModalVisible: true });
  }, [updateState]);

  // 处理取消添加映射
  const handleCancelAddMapping = useCallback(() => {
    updateState({ addMappingModalVisible: false });
  }, [updateState]);

  // 处理确认添加映射
  const handleConfirmAddMapping = useCallback(() => {
    updateState({ addMappingModalVisible: false });
    refetch();
  }, [updateState, refetch]);

  // 处理删除映射
  const handleDeleteMapping = useCallback(
    (record: InterfacePermission) => {
      modal.confirm({
        title: '确认删除',
        content: `确定要删除接口权限映射 "${record.name}" 吗？`,
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          deleteMappingMutation.mutate({ buttonId: button?.id || '', interfaces: [record.id] });
        },
      });
    },
    [deleteMappingMutation, modal, button?.id]
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
    [handleDeleteMapping, deleteMappingMutation.isPending]
  );

  return (
    <Card
      className="flex-1 max-h-full flex flex-col"
      title="接口权限列表"
      styles={{ body: { flex: 1 } }}
      extra={
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddMapping} disabled={!button?.id}>
            添加映射
          </Button>
          <Button
            color="default"
            variant="outlined"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={isFetching}
          >
            刷新
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        loading={isFetching}
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
                {hasButtonData && !hasMappings && (
                  <span className="text-gray-400">📋 暂无接口权限映射，点击上方"添加映射"按钮进行映射</span>
                )}
                {hasButtonData && hasMappings && (
                  <span className="text-green-500">✅ 已映射 {state.permissionList.length} 个接口权限</span>
                )}
              </div>
            </div>
          );
        }}
      />

      {/* 添加映射Modal */}
      <InterfacePermissionMappingModal
        open={state.addMappingModalVisible}
        button={button}
        onOk={handleConfirmAddMapping}
        onCancel={handleCancelAddMapping}
      />
    </Card>
  );
};

export default ButtonInterfacePermission;
