import { useMutation } from '@tanstack/react-query';
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
  /**
   * 新增用户
   */
  const handleCreateUser = useMutation({
    mutationFn: (values: Partial<UserModel>) => userService.createUser(values),
    onSuccess,
  });
};
