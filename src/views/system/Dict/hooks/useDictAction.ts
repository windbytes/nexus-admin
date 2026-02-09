import { useMutation } from '@tanstack/react-query';
import { App } from 'antd';
import { dictService } from '@/services/system/dict/dictApi';
import type { DictModel, DictSaveFullRequest } from '@/services/system/dict/type.d';
import type { DictSubmitPayload } from '../components/DictInfoModal';

interface UseDictActionsProps {
  currentRow: Partial<DictModel> | null;
  onSuccess?: () => void;
}

/**
 * 字典增删改操作 hooks。
 * 编辑时一次提交：调用 saveDictFull，后端在一个事务内更新字典及关联表。
 */
export const useDictActions = ({ currentRow, onSuccess }: UseDictActionsProps) => {
  const { message, modal } = App.useApp();

  const addMutation = useMutation({
    mutationFn: (values: DictSubmitPayload['basic']) => dictService.addDict(values),
    onSuccess: () => {
      message.success('新增成功');
      onSuccess?.();
    },
    onError: (err: Error) => {
      modal.error({ title: '新增失败', content: err.message });
    },
  });

  /** 编辑时一次提交：字典 + 数据源 + 列映射 + 手工数据 */
  const saveDictFullMutation = useMutation({
    mutationFn: (payload: DictSubmitPayload) => dictService.saveDictFull(payload as DictSaveFullRequest),
    onSuccess: () => {
      message.success('保存成功');
      onSuccess?.();
    },
    onError: (err: Error) => {
      modal.error({ title: '保存失败', content: err.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dictService.deleteDict(id),
    onSuccess: () => {
      message.success('删除成功');
      onSuccess?.();
    },
    onError: (err: Error) => {
      modal.error({ title: '删除失败', content: err.message });
    },
  });

  /** 弹窗保存：新增只提交 basic；编辑一次提交 full 到 saveDictFull */
  const handleModalSave = (payload: DictSubmitPayload) => {
    if (currentRow?.id) {
      saveDictFullMutation.mutate(payload);
    } else {
      addMutation.mutate(payload.basic);
    }
  };

  const deleteDict = (id: string) => {
    deleteMutation.mutate(id);
  };

  return { handleModalSave, deleteDict };
};
