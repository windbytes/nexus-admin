import { useState } from 'react';

/**
 * 弹窗状态管理 Hook
 */
export const useModalState = <T = any>(initialData?: T) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<T | undefined>(initialData);

  /**
   * 打开弹窗
   */
  const openModal = (modalData?: T) => {
    setData(modalData);
    setOpen(true);
  };

  /**
   * 关闭弹窗
   */
  const closeModal = () => {
    setOpen(false);
    setData(undefined);
  };

  return {
    open,
    data,
    openModal,
    closeModal,
    setData,
  };
};
