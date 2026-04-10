import { useMutation } from '@tanstack/react-query';
import { App } from 'antd';
import type { Key } from 'react';
import { dictService } from '@/services/system/dict/dictApi';
import type { DictModel, DictSaveFullRequest, DictSearchParams } from '@/services/system/dict/type.d';
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

  const batchDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => dictService.batchDeleteDict(ids),
    onSuccess: () => {
      message.success('批量删除成功');
      onSuccess?.();
    },
    onError: (err: Error) => {
      modal.error({ title: '批量删除失败', content: err.message });
    },
  });

  const batchDeleteDict = (ids: Key[]) => {
    const idList = ids.map((k) => String(k));
    if (idList.length === 0) {
      return;
    }
    modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${idList.length} 条字典吗？`,
      okButtonProps: { danger: true },
      onOk: () => batchDeleteMutation.mutate(idList),
    });
  };

  const importMutation = useMutation({
    mutationFn: (file: File) => dictService.importDict(file),
    onSuccess: (count) => {
      message.success(`导入成功，共 ${count} 条`);
      onSuccess?.();
    },
    onError: (err: Error) => {
      modal.error({ title: '导入失败', content: err.message });
    },
  });

  const importDict = (file: File) => {
    importMutation.mutate(file);
  };

  const exportMutation = useMutation({
    mutationFn: (options: { type: 'all' | 'selected'; selectedIds?: string[]; searchParams?: DictSearchParams }) => {
      return dictService.exportDict({
        type: options.type,
        selectedIds: options.type === 'selected' && options.selectedIds?.length ? options.selectedIds : undefined,
        searchParams: options.type === 'all' ? options.searchParams : undefined,
      });
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `数据字典_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('导出成功');
    },
    onError: (err: Error) => {
      modal.error({ title: '导出失败', content: err.message });
    },
  });

  const exportDict = (type: 'all' | 'selected', selectedIds?: Key[], searchParams?: DictSearchParams) => {
    exportMutation.mutate({
      type,
      ...(type === 'selected' && selectedIds?.length ? { selectedIds: selectedIds.map((k) => String(k)) } : {}),
      ...(type === 'all' ? { searchParams } : {}),
    });
  };

  return {
    handleModalSave,
    deleteDict,
    batchDeleteDict,
    importDict,
    exportDict,
  };
};
