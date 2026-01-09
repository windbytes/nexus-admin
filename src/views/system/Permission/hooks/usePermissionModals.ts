import { useState } from 'react';
import type { PermissionModel } from '@/services/system/permission/type';

export type ModalType = 'add' | 'edit' | null;

/**
 * 统一管理权限点相关的弹窗状态
 */
export const usePermissionModals = () => {
  // 窗口名称
  const [modal, setModal] = useState<ModalType>(null);
  // 当前操作的权限点数据
  const [current, setCurrent] = useState<PermissionModel | null>(null);

  // 打开弹窗
  const openModal = (name: ModalType, record?: PermissionModel) => {
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
