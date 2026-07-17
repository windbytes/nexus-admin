/**
 * @file 授权权限弹窗（接口类型权限点多选表格）
 */

import { useQuery } from '@tanstack/react-query';
import { Button, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { permissionService } from '@/modules/system/api/permission';
import { roleService } from '@/modules/system/api/role';
import type { PermissionModel, PermissionSearchParams } from '@/shared/api/system/permission/type';
import DragModal from '@/shared/components/modal/DragModal';

interface AssignApiPermissionProps {
  roleId: string;
  open: boolean;
  /** 确定时回调：选中的接口权限点 ID，由父组件合并按钮权限后保存 */
  onOk: (apiPermissionIds: string[]) => void;
  onCancel: () => void;
}

/** 资源类型：2-接口 */
const RESOURCE_TYPE_API = 2;

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
    render: (status: boolean) => (
      <Tag variant="solid" color={status ? 'success' : 'error'}>
        {status ? '启用' : '停用'}
      </Tag>
    ),
  },
];

/**
 * 授权权限弹窗：仅展示接口类型权限点；确定后由父组件合并按钮权限并保存。
 *
 * @param props - 角色 id、开关与回调
 */
function AssignApiPermission({ open, onOk, onCancel, roleId }: AssignApiPermissionProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ pageNum: 1, pageSize: 20 });
  const [total, setTotal] = useState(0);

  const { data: roleApiIds = [], isFetching: roleLoading } = useQuery<string[]>({
    queryKey: ['sys_role_api_permission_ids', roleId],
    queryFn: () => roleService.getRoleApiPermissionIds(roleId),
    enabled: open && !!roleId,
  });

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

  useEffect(() => {
    if (pagination.pageNum === 1 && pageResult?.totalRow !== undefined) {
      setTotal(pageResult.totalRow);
    }
  }, [pagination.pageNum, pageResult?.totalRow]);

  useEffect(() => {
    if (open && !roleLoading) {
      setSelectedRowKeys(roleApiIds);
    }
  }, [open, roleLoading, roleApiIds]);

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
      mask={{ closable: false }}
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
}

export default AssignApiPermission;
