import { userService } from '@/services/system/user/userApi';
import type { UserModel } from '@/services/system/user/type';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';

interface UseUserMutationsProps {
  currentRow: Partial<UserModel> | null;
  onSuccess?: () => void;
}

/**
 * 用户相关的 mutations hooks
 */
export const useUserMutations = ({ currentRow, onSuccess }: UseUserMutationsProps) => {
  // 逻辑删除用户
  const logicDeleteUserMutation = useMutation({
    mutationFn: (ids: string[]) => userService.logicDeleteUsers(ids),
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

  // 新增用户
  const createUserMutation = useMutation({
    mutationFn: (values: Partial<UserModel>) => userService.createUser(values),
    onSuccess,
  });

  // 更新用户状态
  const updateStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: number }) =>
      userService.updateBatchUserStatus(ids, status),
    onSuccess,
  });

  // 处理表单提交
  const handleSubmit = useCallback(
    (values: Partial<UserModel>) => {
      if (currentRow?.id) {
        updateUserMutation.mutate(values);
      } else {
        createUserMutation.mutate(values);
      }
    },
    [currentRow?.id, updateUserMutation, createUserMutation]
  );

  return {
    logicDeleteUserMutation,
    updateUserMutation,
    createUserMutation,
    updateStatusMutation,
    handleSubmit,
  };
};
