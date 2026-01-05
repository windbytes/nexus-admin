import { useQuery } from '@tanstack/react-query';
import { Button, Empty, Space, Spin } from 'antd';
import { type Key, useCallback, useEffect, useMemo, useState } from 'react';
import DragModal from '@/components/modal/DragModal';
import { frameworkService } from '@/services/framework/frameworkApi';
import { roleService } from '@/services/system/role/roleApi';
import type { RoleModel } from '@/services/system/role/type';
import TableTransfer from './TableTransfer';
import { useTableColumns } from './useTableColumns';
import { useTransferData } from './useTransferData';

/**
 * 角色分配弹窗属性
 */
interface AssignRoleModalProps {
  open: boolean;
  // 用户名（用于查询用户角色）
  username: string;
  // 窗口点击取消回调
  onCancel: () => void;
  // 窗口点击确定回调
  onOk: (targetKeys: string[]) => void;
}

/**
 * 角色分配弹窗（使用表格穿梭框）
 */
const AssignRoleModal: React.FC<AssignRoleModalProps> = (props) => {
  const { open, username, onCancel, onOk } = props;

  // 显示在右侧的数据key集合
  const [targetKeys, setTargetKeys] = useState<string[]>([]);

  // 查询所有角色列表
  const { data: allRoles = [], isFetching: rolesLoading } = useQuery<RoleModel[]>({
    queryKey: ['sys_all_roles'],
    queryFn: () => roleService.getRoleList({}),
    enabled: open, // 只在弹窗打开时查询
  });

  // 查询用户已拥有的角色
  const { data: userRoles = [], isFetching: userRolesLoading } = useQuery<RoleModel[]>({
    queryKey: ['sys_user_roles', username],
    queryFn: () => frameworkService.getUserRolesByUserName(username),
    enabled: open && !!username, // 只在弹窗打开且有用户名时查询
  });

  // 获取用户角色ID集合
  const userRoleIds = useMemo(() => userRoles.map((role) => role.id), [userRoles]);

  // 加载状态
  const loading = rolesLoading || userRolesLoading;
  // 是否有数据
  const hasData = allRoles.length > 0;

  // 获取表格列配置
  const { leftColumns, rightColumns } = useTableColumns();

  // 处理穿梭框数据
  const { transferData, initialTargetKeys } = useTransferData(allRoles, userRoleIds);

  // 初始化目标keys（当弹窗打开且数据加载完成时）
  useEffect(() => {
    if (open && !loading && initialTargetKeys.length >= 0) {
      setTargetKeys(initialTargetKeys);
    }
  }, [open, loading, initialTargetKeys]);

  // 弹窗关闭时重置状态
  useEffect(() => {
    if (!open) {
      setTargetKeys([]);
    }
  }, [open]);

  // 点击确定
  const handleOk = useCallback(() => {
    onOk(targetKeys);
  }, [onOk, targetKeys]);

  // 搜索过滤函数
  const filterOption = useCallback(
    (inputValue: string, item: (typeof transferData)[number]) => {
      const lowerInputValue = inputValue.toLowerCase();
      return (
        item.roleCode?.toLowerCase().includes(lowerInputValue) ||
        item.roleName?.toLowerCase().includes(lowerInputValue) ||
        item.remark?.toLowerCase().includes(lowerInputValue)
      );
    },
    [transferData]
  );

  return (
    <DragModal
      open={open}
      onCancel={onCancel}
      title="角色分配"
      width={1000}
      maskClosable={false}
      footer={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleOk} disabled={loading}>
            确定
          </Button>
        </Space>
      }
      styles={{
        body: {
          padding: '16px',
        },
      }}
    >
      <Spin spinning={loading}>
        {!hasData ? (
          <Empty description="暂无角色数据" />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="text-sm text-gray-600">
              已选择 <span className="font-semibold text-blue-600">{targetKeys.length}</span> 个角色
            </div>
            <TableTransfer
              dataSource={transferData}
              targetKeys={targetKeys}
              onChange={(targetKeys: Key[]) => {
                setTargetKeys(targetKeys.map((key) => key.toString()));
              }}
              leftColumns={leftColumns}
              rightColumns={rightColumns}
              titles={['未分配角色', '已分配角色']}
              showSearch
              filterOption={(inputValue, item, _direction) => !!filterOption(inputValue, item)}
              styles={{
                section: {
                  width: '100%',
                  height: 500,
                },
              }}
            />
          </div>
        )}
      </Spin>
    </DragModal>
  );
};

export default AssignRoleModal;
