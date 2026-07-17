/**
 * @file 页面按钮 CRUD / 状态切换 mutations
 */

import { useMutation } from '@tanstack/react-query';
import { App } from 'antd';
import { pageButtonService } from '@/modules/system/api/pageButton';
import type { PageButtonModel, PageButtonSaveParams } from '@/shared/api/system/pageButton/type';

/**
 * `useButtonActions` 入参。
 */
interface UseButtonActionsProps {
  /** 当前编辑行；有 `id` 时保存走更新 */
  currentRow: Partial<PageButtonModel> | null;
  /** 写操作成功回调 */
  onSuccess?: () => void;
}

/**
 * `useButtonActions` 返回的操作方法。
 */
export interface UseButtonActionsResult {
  /** 弹窗确认保存 */
  handleModalSave: (values: PageButtonSaveParams) => void;
  /** 删除单条 */
  deleteButton: (id: string) => void;
  /** 批量删除 */
  batchDelete: (ids: string[]) => void;
  /** 切换启用状态 */
  toggleStatus: (id: string, status: boolean) => void;
}

/**
 * 封装页面按钮增删改、批量删、状态切换。
 *
 * @param props - 当前编辑行与成功回调
 * @returns 供页面 / 列定义调用的操作方法
 */
export function useButtonActions({ currentRow, onSuccess }: UseButtonActionsProps): UseButtonActionsResult {
  const { modal, message } = App.useApp();

  const addMutation = useMutation({
    mutationFn: (params: PageButtonSaveParams) => pageButtonService.add(params),
    onSuccess: () => {
      message.success('新增按钮成功');
      onSuccess?.();
    },
    onError: (error: Error) => {
      modal.error({
        title: '新增按钮失败',
        content: error.message || '未知错误',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (params: PageButtonSaveParams) => pageButtonService.update(params),
    onSuccess: () => {
      message.success('修改按钮成功');
      onSuccess?.();
    },
    onError: (error: Error) => {
      modal.error({
        title: '修改按钮失败',
        content: error.message || '未知错误',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pageButtonService.delete(id),
    onSuccess: () => {
      message.success('删除按钮成功');
      onSuccess?.();
    },
    onError: (error: Error) => {
      modal.error({
        title: '删除按钮失败',
        content: error.message || '未知错误',
      });
    },
  });

  const batchDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => pageButtonService.batchDelete(ids),
    onSuccess: () => {
      message.success('批量删除成功');
      onSuccess?.();
    },
    onError: (error: Error) => {
      modal.error({
        title: '批量删除失败',
        content: error.message || '未知错误',
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) => pageButtonService.toggleStatus(id, status),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error: Error) => {
      modal.error({
        title: '切换状态失败',
        content: error.message || '未知错误',
      });
    },
  });

  /**
   * @param values - 表单提交值
   */
  function handleModalSave(values: PageButtonSaveParams) {
    if (currentRow?.id) {
      updateMutation.mutate(values);
    } else {
      addMutation.mutate(values);
    }
  }

  /**
   * @param id - 按钮主键
   */
  function deleteButton(id: string) {
    deleteMutation.mutate(id);
  }

  /**
   * @param ids - 按钮主键列表
   */
  function batchDelete(ids: string[]) {
    batchDeleteMutation.mutate(ids);
  }

  /**
   * @param id - 按钮主键
   * @param status - 目标状态
   */
  function toggleStatus(id: string, status: boolean) {
    toggleStatusMutation.mutate({ id, status });
  }

  return {
    handleModalSave,
    deleteButton,
    batchDelete,
    toggleStatus,
  };
}
