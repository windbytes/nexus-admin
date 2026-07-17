/**
 * @file 授权资源弹窗（按钮类型权限点穿梭框）
 */

import { useQuery } from '@tanstack/react-query';
import { Button, Empty, Space } from 'antd';
import { type Key, useCallback, useEffect, useMemo, useState } from 'react';
import { permissionService } from '@/modules/system/api/permission';
import { roleService } from '@/modules/system/api/role';
import DragModal from '@/shared/components/modal/DragModal';
import TableTransfer from './TableTransfer';
import { useTableColumns } from './useTableColumns';
import type { PermissionTransferItem } from './useTransferData';
import { useTransferData } from './useTransferData';

interface AssignResourceProps {
  roleId: string;
  open: boolean;
  /** 确定时回调：选中的按钮权限点 ID，由父组件合并接口权限后保存 */
  onOk: (buttonPermissionIds: string[]) => void;
  onCancel: () => void;
}

/** 资源类型：1-按钮 */
const RESOURCE_TYPE_BUTTON = 1;

/**
 * 授权资源弹窗：仅展示并选择「按钮」类型权限点。
 *
 * @param props - 角色 id、开关与回调
 */
function AssignResource({ open, onOk, onCancel, roleId }: AssignResourceProps) {
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [leftPagination, setLeftPagination] = useState({ pageNum: 1, pageSize: 20 });
  const [rightPagination, setRightPagination] = useState({ pageNum: 1, pageSize: 20 });
  const [total, setTotal] = useState(0);

  const { data: roleButtonIds = [], isFetching: roleLoading } = useQuery<string[]>({
    queryKey: ['sys_role_button_permission_ids', roleId],
    queryFn: () => roleService.getRoleButtonPermissionIds(roleId),
    enabled: open && !!roleId,
  });

  const { data: allButtonResult, isFetching: allButtonLoading } = useQuery({
    queryKey: ['sys_permissions_button_all', roleId, leftPagination],
    queryFn: () =>
      permissionService.queryPermissionListPage({
        pageNum: leftPagination.pageNum,
        pageSize: leftPagination.pageSize,
        resourceType: RESOURCE_TYPE_BUTTON,
        total: leftPagination.pageNum === 1 ? 0 : total,
      }),
    enabled: open && !!roleId,
  });

  useEffect(() => {
    if (leftPagination.pageNum === 1) {
      setTotal(allButtonResult?.totalRow || 0);
    }
  }, [leftPagination.pageNum, allButtonResult?.totalRow]);

  const loading = roleLoading || allButtonLoading;
  const allButtonList = allButtonResult?.records ?? [];

  const columns = useTableColumns();
  const { transferData: allTransferData } = useTransferData(allButtonList, []);

  const leftTransferData = useMemo(
    () => allTransferData.filter((item) => !targetKeys.includes(item.key)),
    [allTransferData, targetKeys]
  );
  const rightTransferData = useMemo(
    () => allTransferData.filter((item) => targetKeys.includes(item.key)),
    [allTransferData, targetKeys]
  );

  useEffect(() => {
    if (open && !roleLoading) {
      setTargetKeys(roleButtonIds);
    }
  }, [open, roleLoading, roleButtonIds]);

  const handleOk = useCallback(() => {
    onOk(targetKeys);
  }, [onOk, targetKeys]);

  const filterOption = useCallback((inputValue: string, item: PermissionTransferItem) => {
    const lower = inputValue.toLowerCase();
    return (
      item.permCode?.toLowerCase().includes(lower) ||
      item.permName?.toLowerCase().includes(lower) ||
      (item.description ?? '').toLowerCase().includes(lower)
    );
  }, []);

  const handleLeftPagination = useCallback((page: number, pageSize?: number) => {
    setLeftPagination((prev) => ({ pageNum: page, pageSize: pageSize ?? prev.pageSize }));
  }, []);
  const handleRightPagination = useCallback((page: number, pageSize?: number) => {
    setRightPagination((prev) => ({ pageNum: page, pageSize: pageSize ?? prev.pageSize }));
  }, []);

  const hasData = allTransferData.length > 0 || targetKeys.length > 0;

  return (
    <DragModal
      open={open}
      onCancel={onCancel}
      title="授权资源"
      width={1400}
      mask={{ closable: false }}
      footer={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleOk} disabled={loading}>
            确定
          </Button>
        </Space>
      }
    >
      {!hasData ? (
        <Empty description="暂无按钮类型权限点数据" />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="text-sm text-gray-600">
            已选择 <span className="font-semibold text-blue-600">{targetKeys.length}</span> 个资源（按钮权限点）
          </div>
          <TableTransfer
            dataSource={allTransferData}
            targetKeys={targetKeys}
            onChange={(keys: Key[]) => setTargetKeys(keys.map((k) => String(k)))}
            classNames={{ body: 'h-full', list: 'h-full' }}
            leftColumns={columns}
            rightColumns={columns}
            titles={['未分配资源', '已分配资源']}
            showSearch
            loading={loading}
            filterOption={(_input, item) => !!filterOption(_input, item)}
            leftData={leftTransferData}
            rightData={rightTransferData}
            leftPaginationMode="backend"
            leftPagination={{
              current: leftPagination.pageNum,
              pageSize: leftPagination.pageSize,
              total: allButtonResult?.totalRow || 0,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (t: number, r: [number, number]) => `${r[0]}-${r[1]} / ${t} 条`,
              onChange: handleLeftPagination,
              onShowSizeChange: handleLeftPagination,
            }}
            rightPagination={{
              current: rightPagination.pageNum,
              pageSize: rightPagination.pageSize,
              total: rightTransferData.length,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (t: number, r: [number, number]) => `${r[0]}-${r[1]} / ${t} 条`,
              onChange: handleRightPagination,
              onShowSizeChange: handleRightPagination,
            }}
            styles={{ section: { width: '100%' } }}
          />
        </div>
      )}
    </DragModal>
  );
}

export default AssignResource;
