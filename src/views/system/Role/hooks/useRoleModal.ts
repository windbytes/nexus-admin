import { useState } from 'react';
import type { RoleModel } from '@/services/system/role/type';

export type ModalType = 'add' | 'edit' | 'view' | 'assignMenu' | 'assignUser' | 'assignPermission' | null;

/**
 * 统一管理角色相关的弹窗状态
 */
export const useRoleModals = () => {
  // 窗口名称
  const [modal, setModal] = useState<ModalType>(null);
  // 当前操作的角色数据
  const [current, setCurrent] = useState<RoleModel | null>(null);

  // 打开弹窗
  const openModal = (name: ModalType, record?: RoleModel) => {
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
