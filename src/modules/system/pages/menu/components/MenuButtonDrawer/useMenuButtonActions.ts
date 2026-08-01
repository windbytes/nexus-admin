/**
 * @file 菜单按钮权限点 CRUD mutations
 */

import { useMutation } from '@tanstack/react-query';
import { App } from 'antd';
import { permissionService } from '@/modules/system/api/permission';
import type { PermissionModel, PermissionSaveParams } from '@/shared/api/system/permission/type';

/**
 * `useMenuButtonActions` 入参。
 */
interface UseMenuButtonActionsProps {
  /** 当前编辑行；有 `id` 时保存走更新 */
  currentRow: Partial<PermissionModel> | null;
  /** 写操作成功回调 */
  onSuccess?: () => void;
}

/**
 * `useMenuButtonActions` 返回的操作方法。
 */
export interface UseMenuButtonActionsResult {
  /** 弹窗确认保存 */
  handleModalSave: (values: PermissionSaveParams) => void;
  /** 删除单条 */
  deleteButton: (id: string) => void;
  /** 批量删除 */
  batchDelete: (ids: string[]) => void;
  /** 切换启用状态 */
  toggleStatus: (id: string, status: boolean) => void;
}

/**
 * 封装菜单按钮（permType=1 权限点）增删改、批量删、状态切换。
 *
 * @param props - 当前编辑行与成功回调
 * @returns 供抽屉 / 列定义调用的操作方法
 */
export function useMenuButtonActions({ currentRow, onSuccess }: UseMenuButtonActionsProps): UseMenuButtonActionsResult {
  const { modal, message } = App.useApp();

  const addMutation = useMutation({
    mutationFn: (params: PermissionSaveParams) => permissionService.add(params),
    onSuccess: () => {
      message.success('新增按钮成功');
      onSuccess?.();
    },
    onError: (error: Error) => {
      modal.error({ title: '新增按钮失败', content: error.message || '未知错误' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (params: PermissionSaveParams) => permissionService.update(params),
    onSuccess: () => {
      message.success('修改按钮成功');
      onSuccess?.();
    },
    onError: (error: Error) => {
      modal.error({ title: '修改按钮失败', content: error.message || '未知错误' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => permissionService.delete(ids),
    onSuccess: () => {
      message.success('删除成功');
      onSuccess?.();
    },
    onError: (error: Error) => {
      modal.error({ title: '删除按钮失败', content: error.message || '未知错误' });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) =>
      status ? permissionService.enableBatch([id]) : permissionService.disableBatch([id]),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error: Error) => {
      modal.error({ title: '切换状态失败', content: error.message || '未知错误' });
    },
  });

  /**
   * @param values - 表单提交值
   */
  function handleModalSave(values: PermissionSaveParams) {
    if (currentRow?.id) {
      updateMutation.mutate({ ...values, id: currentRow.id });
    } else {
      addMutation.mutate(values);
    }
  }

  /**
   * @param id - 按钮主键
   */
  function deleteButton(id: string) {
    deleteMutation.mutate([id]);
  }

  /**
   * @param ids - 按钮主键列表
   */
  function batchDelete(ids: string[]) {
    deleteMutation.mutate(ids);
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
