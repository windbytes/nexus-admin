import { useState } from 'react';
import type { ApiModel } from '@/services/system/api/type';

/**
 * 系统接口维护弹窗状态
 */
export const useApiModals = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Partial<ApiModel> | null>(null);

  const openForm = (record?: Partial<ApiModel>) => {
    setEditingRecord(record ?? null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingRecord(null);
  };

  return {
    formOpen,
    editingRecord,
    openForm,
    closeForm,
  };
};
