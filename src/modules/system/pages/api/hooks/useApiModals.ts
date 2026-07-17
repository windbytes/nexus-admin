/**
 * @file 系统接口维护弹窗状态
 */

import { useState } from 'react';
import type { ApiModel } from '@/shared/api/system/api/type';

/**
 * `useApiModals` 返回值。
 */
export interface UseApiModalsResult {
  formOpen: boolean;
  editingRecord: Partial<ApiModel> | null;
  /**
   * 打开表单弹窗。
   * @param record - 编辑时传入当前行；新增不传
   */
  openForm: (record?: Partial<ApiModel>) => void;
  /** 关闭表单并清空编辑行 */
  closeForm: () => void;
}

/**
 * 系统接口维护弹窗状态。
 *
 * @returns 弹窗开关与编辑行
 */
export function useApiModals(): UseApiModalsResult {
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Partial<ApiModel> | null>(null);

  /**
   * @param record - 编辑行
   */
  function openForm(record?: Partial<ApiModel>) {
    setEditingRecord(record ?? null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingRecord(null);
  }

  return {
    formOpen,
    editingRecord,
    openForm,
    closeForm,
  };
}
