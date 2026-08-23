import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { useCallback } from 'react';
import { userService } from '@/modules/system/api/user';

/**
 * 回收站操作 Hook（单条/批量恢复）。
 *
 * @param onSuccess - 恢复成功后的回调
 * @returns 恢复方法与加载态
 */
export const useRecycleActions = (onSuccess?: () => void) => {
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();

  // 恢复用户
  const restoreUsersMutation = useMutation({
    mutationFn: (ids: string[]) => userService.restoreUsers(ids),
    onSuccess: () => {
      message.success('恢复成功');
      queryClient.invalidateQueries({ queryKey: ['sys_user_recycle'] });
      onSuccess?.();
    },
  });

  // 单个恢复
  const handleRestore = useCallback(
    (id: string) => {
      modal.confirm({
        title: '恢复用户',
        content: '确定要恢复该用户吗？',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          restoreUsersMutation.mutate([id]);
        },
      });
    },
    [modal, restoreUsersMutation]
  );

  // 批量恢复
  const handleBatchRestore = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) {
        modal.warning({
          title: '提示',
          content: '请至少选择一个用户',
        });
        return;
      }

      modal.confirm({
        title: '批量恢复用户',
        content: `确定要恢复选中的 ${ids.length} 个用户吗？`,
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          restoreUsersMutation.mutate(ids);
        },
      });
    },
    [modal, restoreUsersMutation]
  );

  return {
    handleRestore,
    handleBatchRestore,
    restoring: restoreUsersMutation.isPending,
  };
};
