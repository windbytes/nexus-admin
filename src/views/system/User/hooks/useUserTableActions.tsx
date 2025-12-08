import { ExclamationCircleFilled } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import type { MenuProps } from 'antd';
import { App } from 'antd';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MyIcon } from '@/components/MyIcon';
import type { UserModel } from '@/services/system/user/type';

interface UseUserTableActionsProps {
  permissions: ReturnType<typeof import('./useUserPermissions').useUserPermissions>;
  dispatch: React.Dispatch<any>;
  logicDeleteUserMutation: {
    mutate: (ids: string[]) => void;
  };
  refetch: () => void;
  updateStatusMutation: {
    mutate: (params: { ids: string[]; status: number }) => void;
  };
}

/**
 * 用户表格操作相关的 hooks
 */
export const useUserTableActions = ({
  permissions,
  dispatch,
  logicDeleteUserMutation,
  refetch,
  updateStatusMutation,
}: UseUserTableActionsProps) => {
  const { modal, message } = App.useApp();
  const { t } = useTranslation();

  // 处理编辑
  const handleEdit = useCallback(
    (record: UserModel) => {
      dispatch({
        openEditModal: true,
        currentRow: record,
        action: 'edit',
      });
    },
    [dispatch]
  );

  // 处理详情
  const handleDetail = useCallback(
    (record: UserModel) => {
      dispatch({
        openEditModal: true,
        currentRow: record,
        action: 'view',
      });
    },
    [dispatch]
  );

  // 处理新增
  const handleAdd = useCallback(() => {
    dispatch({
      openEditModal: true,
      currentRow: null,
      action: 'add',
    });
  }, [dispatch]);

  // 处理状态变更
  const handleStatusChange = useCallback(
    (record: UserModel, checked: boolean) => {
      if (!permissions.canUpdateStatus) {
        modal.error({
          title: '权限不足',
          content: '您没有更新用户状态的权限，请联系管理员获取相应权限。',
        });
        return;
      }

      const newStatus = checked ? 1 : 0;
      updateStatusMutation.mutate({ ids: [record.id], status: newStatus });
    },
    [permissions.canUpdateStatus, modal, message, updateStatusMutation, refetch]
  );

  // 构建操作菜单项
  const getMoreActions = useCallback(
    (record: UserModel): MenuProps['items'] => [
      {
        key: 'updatePwd',
        label: '修改密码',
        icon: <Icon icon="fluent:password-reset-48-regular" className="text-sm! block text-orange-300" />,
        disabled: !permissions.canUpdatePassword,
        onClick: () => {
          if (!permissions.canUpdatePassword) {
            modal.error({
              title: '权限不足',
              content: '您没有修改用户密码的权限，请联系管理员获取相应权限。',
            });
            return;
          }
          dispatch({
            openPasswordModal: true,
            currentRow: record,
          });
        },
      },
      {
        key: 'assignRole',
        label: '分配角色',
        icon: <MyIcon type="nexus-assigned" className="text-sm! block" />,
        disabled: !permissions.canAssignRole,
        onClick: () => {
          if (!permissions.canAssignRole) {
            modal.error({
              title: '权限不足',
              content: '您没有分配用户角色的权限，请联系管理员获取相应权限。',
            });
            return;
          }
          modal.error({
            title: '功能暂未开放',
            content: '分配角色功能正在开发中，敬请期待。',
          });
        },
      },
      {
        key: 'operation',
        label: '操作记录',
        icon: <Icon icon="fluent-color:history-48" className="text-sm! block" />,
        disabled: !permissions.canViewOperationLog,
        onClick: () => {
          if (!permissions.canViewOperationLog) {
            modal.error({
              title: '权限不足',
              content: '您没有查看用户操作记录的权限，请联系管理员获取相应权限。',
            });
            return;
          }
          dispatch({
            openOperationModal: true,
            currentRow: record,
          });
        },
      },
      {
        key: 'delete',
        label: t('common.operation.delete'),
        icon: <Icon icon="fluent:delete-dismiss-24-filled" className="text-sm! block text-[var(--ant-color-error)]!" />,
        disabled: !permissions.canDeleteUser,
        onClick: () => {
          if (!permissions.canDeleteUser) {
            modal.error({
              title: '权限不足',
              content: '您没有删除用户的权限，请联系管理员获取相应权限。',
            });
            return;
          }
          modal.confirm({
            title: '删除用户',
            icon: <ExclamationCircleFilled />,
            content: '确定删除该用户吗？数据删除后请在回收站中恢复！',
            onOk() {
              logicDeleteUserMutation.mutate([record.id]);
            },
          });
        },
      },
    ],
    [permissions, modal, dispatch, t, logicDeleteUserMutation]
  );

  // 处理批量删除
  const handleBatchDelete = useCallback(
    (selectedRows: Partial<UserModel>[]) => {
      modal.confirm({
        title: '确定要删除选中的用户吗？',
        icon: <ExclamationCircleFilled />,
        content: '此操作将删除选中的用户，删除后可在回收站中进行恢复，是否继续？',
        onOk() {
          const ids = selectedRows.map((row) => row.id).filter(Boolean) as string[];
          logicDeleteUserMutation.mutate(ids);
        },
      });
    },
    [modal, logicDeleteUserMutation]
  );

  return {
    handleEdit,
    handleDetail,
    handleAdd,
    handleStatusChange,
    getMoreActions,
    handleBatchDelete,
  };
};
