import { useState } from 'react';
import type { SysParam } from '@/services/system/params';

export type ModalType = 'add' | 'edit' | null;

/**
 * 统一管理系统参数相关的弹窗状态
 */
export const useParamModals = () => {
  // 窗口名称
  const [modal, setModal] = useState<ModalType>(null);
  // 当前操作的参数数据
  const [current, setCurrent] = useState<SysParam | null>(null);

  // 打开弹窗
  const openModal = (name: ModalType, record?: SysParam) => {
    setModal(name);
    setCurrent(record || null);
  };

  // 关闭弹窗
  const closeModal = () => {
    setModal(null);
    setCurrent(null);
  };
  return {
    modal,
    current,
    openModal,
    closeModal,
  };
};
