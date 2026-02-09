import { useQuery } from '@tanstack/react-query';
import { Button, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import DragModal from '@/components/modal/DragModal';
import { permissionService } from '@/services/system/permission/permissionApi';
import type { PermissionModel, PermissionSearchParams } from '@/services/system/permission/type';
import { roleService } from '@/services/system/role/roleApi';

/** 授权权限弹窗 Props（仅 API 类型权限点，多选分页表格，确定时保存） */
interface AssignApiPermissionProps {
  roleId: string;
  open: boolean;
  /** 确定时回调：选中的接口权限点 ID 列表，由父组件合并按钮权限后保存 */
  onOk: (apiPermissionIds: string[]) => void;
  onCancel: () => void;
}

/** 资源类型：2-接口（授权权限仅查此类） */
const RESOURCE_TYPE_API = 2;

/** 表格列：权限编码、权限名称、描述、状态 */
const columns: ColumnsType<PermissionModel> = [
  { title: '权限编码', dataIndex: 'permCode', key: 'permCode', width: 160, ellipsis: true },
  { title: '权限名称', dataIndex: 'permName', key: 'permName', width: 180, ellipsis: true },
  { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    align: 'center',
    render: (status: boolean) => <Tag color={status ? 'success' : 'error'}>{status ? '启用' : '停用'}</Tag>,
  },
];

/**
 * 授权权限弹窗
 * 仅展示「接口」类型权限点，多选分页表格；角色已配置的项默认勾选；点击确定后由父组件合并按钮权限并保存
 */
const AssignApiPermission: React.FC<AssignApiPermissionProps> = ({ open, onOk, onCancel, roleId }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ pageNum: 1, pageSize: 20 });
  // 表格数据总数（首页返回，翻页时传给后端）
  const [total, setTotal] = useState<number>(0);

  // 角色已配置的接口类型权限点 ID，用于初始勾选
  const { data: roleApiIds = [], isFetching: roleLoading } = useQuery<string[]>({
    queryKey: ['sys_role_api_permission_ids', roleId],
    queryFn: () => roleService.getRoleApiPermissionIds(roleId),
    enabled: open && !!roleId,
  });

  // 仅查接口类型权限点（分页）
  const searchParams: PermissionSearchParams = useMemo(
    () => ({ ...pagination, resourceType: RESOURCE_TYPE_API }),
    [pagination]
  );
  const { data: pageResult, isFetching: listLoading } = useQuery({
    queryKey: ['sys_permissions_api_page', searchParams],
    queryFn: () =>
      permissionService.queryPermissionListPage({
        ...searchParams,
        total: pagination.pageNum === 1 ? 0 : total,
      }),
    enabled: open && !!roleId,
  });

  const loading = roleLoading || listLoading;
  const dataSource = pageResult?.records ?? [];

  // 同步分页总数（仅首页返回的总数用于后续翻页传参）
  useEffect(() => {
    if (pagination.pageNum === 1 && pageResult?.totalRow !== undefined) {
      setTotal(pageResult.totalRow);
    }
  }, [pagination.pageNum, pageResult?.totalRow]);

  // 弹窗打开且角色接口 ID 加载完成后，同步勾选
  useEffect(() => {
    if (open && !roleLoading) {
      setSelectedRowKeys(roleApiIds);
    }
  }, [open, roleLoading, roleApiIds]);

  // 关闭时清空
  useEffect(() => {
    if (!open) {
      setSelectedRowKeys([]);
      setPagination({ pageNum: 1, pageSize: 20 });
    }
  }, [open]);

  const handleOk = useCallback(() => {
    onOk(selectedRowKeys);
  }, [onOk, selectedRowKeys]);

  const handleTableChange = useCallback((page: number, pageSize?: number) => {
    setPagination((prev) => ({ pageNum: page, pageSize: pageSize ?? prev.pageSize }));
  }, []);

  const rowSelection = useMemo(
    () => ({
      selectedRowKeys,
      onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]),
    }),
    [selectedRowKeys]
  );

  return (
    <DragModal
      open={open}
      onCancel={onCancel}
      title="授权权限"
      width={900}
      maskClosable={false}
      styles={{ body: { minHeight: '400px', overflowY: 'auto' } }}
      footer={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleOk} disabled={loading}>
            确定
          </Button>
        </Space>
      }
    >
      <div className="mb-2 text-sm text-gray-600">
        已勾选 <span className="font-semibold text-blue-600">{selectedRowKeys.length}</span> 个接口权限点
      </div>
      <Table<PermissionModel>
        rowKey="id"
        size="small"
        bordered
        columns={columns}
        dataSource={dataSource}
        rowSelection={rowSelection}
        loading={loading}
        pagination={{
          current: pagination.pageNum,
          pageSize: pagination.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t, range) => `${range[0]}-${range[1]} / ${t} 条`,
          onChange: handleTableChange,
        }}
        scroll={{ y: 'calc(70vh - 220px)' }}
      />
    </DragModal>
  );
};

export default AssignApiPermission;
