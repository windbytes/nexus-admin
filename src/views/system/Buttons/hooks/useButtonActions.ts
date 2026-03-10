import { useMutation } from '@tanstack/react-query';
import type { PageButtonModel, PageButtonSaveParams } from '@/services/system/pageButton/type';
import { pageButtonService } from '@/services/system/pageButton/pageButtonApi';

interface UseButtonActionsProps {
  currentRow: Partial<PageButtonModel> | null;
  onSuccess?: () => void;
}

/**
 * 页面按钮增删改、批量删、状态切换等操作
 */
export const useButtonActions = ({ currentRow, onSuccess }: UseButtonActionsProps) => {
  const addMutation = useMutation({
    mutationFn: (params: PageButtonSaveParams) => pageButtonService.add(params),
    onSuccess,
  });

  const updateMutation = useMutation({
    mutationFn: (params: PageButtonSaveParams) => pageButtonService.update(params),
    onSuccess,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pageButtonService.delete(id),
    onSuccess,
  });

  const batchDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => pageButtonService.batchDelete(ids),
    onSuccess,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) => pageButtonService.toggleStatus(id, status),
    onSuccess,
  });

  const handleModalSave = (values: PageButtonSaveParams) => {
    if (currentRow?.id) {
      updateMutation.mutate(values);
    } else {
      addMutation.mutate(values);
    }
  };

  const deleteButton = (id: string) => {
    deleteMutation.mutate(id);
  };

  const batchDelete = (ids: string[]) => {
    batchDeleteMutation.mutate(ids);
  };

  const toggleStatus = (id: string, status: boolean) => {
    toggleStatusMutation.mutate({ id, status });
  };

  return {
    handleModalSave,
    deleteButton,
    batchDelete,
    toggleStatus,
  };
};
