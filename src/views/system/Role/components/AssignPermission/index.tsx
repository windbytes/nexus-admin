import { useQuery } from '@tanstack/react-query';
import { Button, Empty, Space, Spin } from 'antd';
import { type Key, useCallback, useEffect, useMemo, useState } from 'react';
import DragModal from '@/components/modal/DragModal';
import { permissionService } from '@/services/system/permission';
import type { PermissionSearchParams } from '@/services/system/permission/type';
import { roleService } from '@/services/system/role/roleApi';
import TableTransfer from './TableTransfer';
import { useTableColumns } from './useTableColumns';
import type { PermissionTransferItem } from './useTransferData';
import { useTransferData } from './useTransferData';

interface AssignPermissionProps {
  // 角色id
  roleId: string;
  // 是否显示弹窗
  open: boolean;
  // 点击确定的回调
  onOk: (permissionIds: string[]) => void;
  // 点击取消的回调
  onCancel: () => void;
}

/**
 * 分配权限点弹窗
 */
const AssignPermission: React.FC<AssignPermissionProps> = ({ open, onOk, onCancel, roleId }) => {
  // 显示在右侧的数据key集合
  const [targetKeys, setTargetKeys] = useState<string[]>([]);

  // 左侧分页参数（未分配的权限点）
  const [leftPagination, setLeftPagination] = useState({ pageNum: 1, pageSize: 20 });
  // 右侧分页参数（已分配的权限点）
  const [rightPagination, setRightPagination] = useState({ pageNum: 1, pageSize: 20 });

  // 查询角色已配置的权限点ID列表
  const { data: rolePermissionIds = [], isFetching: rolePermissionsLoading } = useQuery<string[]>({
    queryKey: ['sys_role_permissions', roleId],
    queryFn: () => roleService.getRolePermissions(roleId),
    enabled: open && !!roleId,
  });

  // 查询左侧权限点列表（分页，所有权限点，Transfer 会自动根据 targetKeys 区分左右）
  const leftSearchParams: PermissionSearchParams = useMemo(
    () => ({
      ...leftPagination,
    }),
    [leftPagination]
  );

  const { data: leftPermissionResult, isFetching: leftPermissionsLoading } = useQuery({
    queryKey: ['sys_permissions_left', leftSearchParams],
    queryFn: () => permissionService.queryPermissionListPage(leftSearchParams),
    enabled: open && !!roleId,
  });

  // 查询右侧权限点列表（分页，只查询已选中的）
  const { data: rightPermissionResult, isFetching: rightPermissionsLoading } = useQuery({
    queryKey: ['sys_permissions_right', rightPagination, targetKeys],
    queryFn: async () => {
      if (targetKeys.length === 0) {
        return { records: [], totalRow: 0 };
      }
      // 由于API可能不支持按ID列表查询，这里查询所有权限点然后过滤
      // 实际项目中应该有一个按ID列表查询的接口
      const result = await permissionService.queryPermissionListPage({
        pageNum: 1,
        pageSize: 1000, // 假设总数不超过1000
      });
      const filtered = result.records.filter((p) => targetKeys.includes(p.id));
      // 分页处理
      const start = (rightPagination.pageNum - 1) * rightPagination.pageSize;
      const end = start + rightPagination.pageSize;
      return {
        records: filtered.slice(start, end),
        totalRow: filtered.length,
      };
    },
    enabled: open && !!roleId && targetKeys.length > 0,
  });

  // 加载状态
  const loading = rolePermissionsLoading || leftPermissionsLoading || rightPermissionsLoading;

  // 左侧数据（所有权限点，Transfer 会自动根据 targetKeys 过滤）
  const leftData = leftPermissionResult?.records || [];
  // 右侧数据（已选中的权限点）
  const rightData = rightPermissionResult?.records || [];

  // 获取表格列配置
  const { leftColumns, rightColumns } = useTableColumns();

  // 处理穿梭框数据
  const leftTransferData = useTransferData(leftData, []).transferData;
  const rightTransferData = useTransferData(rightData, []).transferData;

  // 初始化目标keys（当弹窗打开且数据加载完成时）
  useEffect(() => {
    if (open && !loading && rolePermissionIds.length >= 0) {
      setTargetKeys(rolePermissionIds);
    }
  }, [open, loading, rolePermissionIds]);

  // 弹窗关闭时重置状态
  useEffect(() => {
    if (!open) {
      setTargetKeys([]);
      setLeftPagination({ pageNum: 1, pageSize: 20 });
      setRightPagination({ pageNum: 1, pageSize: 20 });
    }
  }, [open]);

  // 点击确定
  const handleOk = useCallback(() => {
    onOk(targetKeys);
  }, [onOk, targetKeys]);

  // 搜索过滤函数
  const filterOption = useCallback((inputValue: string, item: PermissionTransferItem) => {
    const lowerInputValue = inputValue.toLowerCase();
    return (
      item.permCode?.toLowerCase().includes(lowerInputValue) ||
      item.permName?.toLowerCase().includes(lowerInputValue) ||
      item.moduleCode?.toLowerCase().includes(lowerInputValue) ||
      item.description?.toLowerCase().includes(lowerInputValue)
    );
  }, []);

  // Transfer 的 dataSource 是左侧数据（所有权限点）
  // targetKeys 用于标识哪些在右侧
  // 但我们需要在 TableTransfer 中自定义渲染，使用分页后的数据
  const allTransferData = useMemo(() => {
    // 合并左右数据，确保所有数据都在 dataSource 中
    const leftMap = new Map(leftTransferData.map((item) => [item.key, item]));
    const rightMap = new Map(rightTransferData.map((item) => [item.key, item]));
    const merged = new Map([...leftMap, ...rightMap]);
    return Array.from(merged.values());
  }, [leftTransferData, rightTransferData]);

  // 左侧分页变化处理
  const handleLeftPaginationChange = useCallback((page: number, pageSize?: number) => {
    setLeftPagination((prev) => ({
      pageNum: page,
      pageSize: pageSize || prev.pageSize,
    }));
  }, []);

  // 右侧分页变化处理
  const handleRightPaginationChange = useCallback((page: number, pageSize?: number) => {
    setRightPagination((prev) => ({
      pageNum: page,
      pageSize: pageSize || prev.pageSize,
    }));
  }, []);

  const hasData = allTransferData.length > 0 || targetKeys.length > 0;

  return (
    <DragModal
      open={open}
      onCancel={onCancel}
      title="分配权限点"
      width={1400}
      maskClosable={false}
      loading={loading}
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto',
        },
      }}
      footer={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleOk} disabled={loading}>
            确定
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
        {!hasData ? (
          <Empty description="暂无权限点数据" />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="text-sm text-gray-600">
              已选择 <span className="font-semibold text-blue-600">{targetKeys.length}</span> 个权限点
            </div>
            <TableTransfer
              dataSource={allTransferData}
              targetKeys={targetKeys}
              onChange={(keys: Key[]) => {
                setTargetKeys(keys.map((key) => key.toString()));
              }}
              leftColumns={leftColumns}
              rightColumns={rightColumns}
              titles={['未分配权限点', '已分配权限点']}
              showSearch
              filterOption={(inputValue, item, _direction) => !!filterOption(inputValue, item)}
              leftData={leftTransferData}
              rightData={rightTransferData}
              leftPagination={{
                current: leftPagination.pageNum,
                pageSize: leftPagination.pageSize,
                total: leftPermissionResult?.totalRow || 0,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} / ${total} 条`,
                onChange: handleLeftPaginationChange,
                onShowSizeChange: handleLeftPaginationChange,
              }}
              rightPagination={{
                current: rightPagination.pageNum,
                pageSize: rightPagination.pageSize,
                total: rightPermissionResult?.totalRow || 0,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} / ${total} 条`,
                onChange: handleRightPaginationChange,
                onShowSizeChange: handleRightPaginationChange,
              }}
              styles={{
                section: {
                  width: '100%',
                  height: 'calc(70vh - 200px)',
                },
              }}
            />
          </div>
        )}
      </Spin>
    </DragModal>
  );
};

export default AssignPermission;
