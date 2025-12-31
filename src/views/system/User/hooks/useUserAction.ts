import { useMutation } from '@tanstack/react-query';
import { App } from 'antd';
import type { UserModel } from '@/services/system/user/type';
import { userService } from '@/services/system/user/userApi';

interface UseUserMutationsProps {
  // 当前操作的行数据
  currentRow: Partial<UserModel> | null;
  // 成功的回调
  onSuccess?: () => void;
}

/**
 * 用户操作相关的 hooks
 */
export const useUserActions = ({ currentRow, onSuccess }: UseUserMutationsProps) => {
  const { modal, message } = App.useApp();
  /**
   * 新增用户
   */
  const createUserMutation = useMutation({
    mutationFn: (values: Partial<UserModel>) => userService.createUser(values),
    onSuccess,
  });

  // 更新用户
  const updateUserMutation = useMutation({
    mutationFn: (values: Partial<UserModel>) => {
      if (!currentRow?.id) {
        throw new Error('当前行数据不存在');
      }
      return userService.updateUser({ id: currentRow.id, ...values });
    },
    onSuccess,
  });

  // 更新用户状态
  const updateStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: number }) => userService.updateBatchUserStatus(ids, status),
    onSuccess,
  });

  // 更改用户状态
  const updateUserStatus = (ids: string[], status: number) => {
    updateStatusMutation.mutate({ ids, status });
  };

  // 更新用户密码mutation
  const updatePasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => userService.changeUserPwd(id, password),
    onSuccess: () => {
      message.success('更新用户密码成功');
      onSuccess?.();
    },
    onError: (error) => {
      modal.error({
        title: '更新用户密码失败',
        content: error.message,
      });
    },
  });

  // 更新用户密码
  const updateUserPassword = (id: string, password: string) => {
    updatePasswordMutation.mutate({ id, password });
  };

  // 逻辑删除用户
  const deleteUsersMutation = useMutation({
    mutationFn: (ids: string[]) => userService.logicDeleteUsers(ids),
    onSuccess,
  });

  // 批量删除用户
  const deleteUsers = (ids: string[]) => {
    deleteUsersMutation.mutate(ids);
  };

  // 处理模态框确认
  const handleModalSave = (values: Partial<UserModel>) => {
    if (currentRow?.id) {
      updateUserMutation.mutate(values);
    } else {
      createUserMutation.mutate(values);
    }
  };

  return {
    handleModalSave,
    updateUserStatus,
    deleteUsers,
    updateUserPassword,
  };
};
