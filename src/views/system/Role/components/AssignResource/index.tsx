import { useQuery } from '@tanstack/react-query';
import { Button, Empty, Space } from 'antd';
import { type Key, useCallback, useEffect, useMemo, useState } from 'react';
import DragModal from '@/components/modal/DragModal';
import { permissionService } from '@/services/system/permission/permissionApi';
import { roleService } from '@/services/system/role/roleApi';
import TableTransfer from './TableTransfer';
import { useTableColumns } from './useTableColumns';
import type { PermissionTransferItem } from './useTransferData';
import { useTransferData } from './useTransferData';

/** 授权资源弹窗 Props（仅按钮类型权限点，穿梭框） */
interface AssignResourceProps {
  roleId: string;
  open: boolean;
  /** 确定时回调：选中的按钮权限点 ID 列表，由父组件合并接口权限后保存 */
  onOk: (buttonPermissionIds: string[]) => void;
  onCancel: () => void;
}

/** 资源类型：1-按钮（授权资源仅查此类） */
const RESOURCE_TYPE_BUTTON = 1;

/**
 * 授权资源弹窗
 * 仅展示并选择「按钮」类型权限点，使用穿梭框。
 * 首次打开时请求：全部按钮数据 + 角色已配置的按钮 ID；左右列表由前端根据 targetKeys 拆分，仅点击确定时由父组件保存。
 */
const AssignResource: React.FC<AssignResourceProps> = ({ open, onOk, onCancel, roleId }) => {
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [leftPagination, setLeftPagination] = useState({ pageNum: 1, pageSize: 20 });
  const [rightPagination, setRightPagination] = useState({ pageNum: 1, pageSize: 20 });

  // 仅首次打开时请求：角色已配置的按钮权限点 ID（用于右侧初始值）
  const { data: roleButtonIds = [], isFetching: roleLoading } = useQuery<string[]>({
    queryKey: ['sys_role_button_permission_ids', roleId],
    queryFn: () => roleService.getRoleButtonPermissionIds(roleId),
    enabled: open && !!roleId,
  });

  // 仅首次打开时请求：全部按钮类型权限点（一页拉取，前后端不再因 targetKeys 变化而请求）
  const { data: allButtonResult, isFetching: allButtonLoading } = useQuery({
    queryKey: ['sys_permissions_button_all', roleId],
    queryFn: () =>
      permissionService.queryPermissionListPage({
        pageNum: leftPagination.pageNum,
        pageSize: leftPagination.pageSize,
        resourceType: RESOURCE_TYPE_BUTTON,
      }),
    enabled: open && !!roleId,
  });

  const loading = roleLoading || allButtonLoading;
  const allButtonList = allButtonResult?.records ?? [];

  const columns = useTableColumns();
  const { transferData: allTransferData } = useTransferData(allButtonList, []);

  // 由前端根据 targetKeys 拆分：左侧 = 未选中，右侧 = 已选中（无额外请求）
  const leftTransferData = useMemo(
    () => allTransferData.filter((item) => !targetKeys.includes(item.key)),
    [allTransferData, targetKeys]
  );
  const rightTransferData = useMemo(
    () => allTransferData.filter((item) => targetKeys.includes(item.key)),
    [allTransferData, targetKeys]
  );

  // 弹窗打开且角色已配置的按钮 ID 加载完成后，同步到 targetKeys（仅初始化，之后由前端维护）
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
      maskClosable={false}
      loading={loading}
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
            filterOption={(_input, item, _dir) => !!filterOption(_input, item)}
            leftData={leftTransferData}
            rightData={rightTransferData}
            leftPagination={{
              current: leftPagination.pageNum,
              pageSize: leftPagination.pageSize,
              total: leftTransferData.length,
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
};

export default AssignResource;
