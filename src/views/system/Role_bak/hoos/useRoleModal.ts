import { useState } from 'react';
import type { RoleModel } from '@/services/system/role/type';

export type ModalType = 'add' | 'edit' | 'view' | 'assignMenu' | 'assignUser' | null;

/**
 * 统一管理角色弹窗逻辑
 */
export const useRoleModal = () => {
  // 窗口名称
  const [modalName, setModalName] = useState<ModalType>(null);
  // 当前操作的角色数据
  const [current, setCurrent] = useState<RoleModel | null>(null);

  // 打开弹窗
  const openModal = (name: ModalType, record?: RoleModel) => {
    setModalName(name);
    setCurrent(record || null);
  };

  // 关闭弹窗
  const closeModal = () => {
    setModalName(null);
    setCurrent(null);
  };
  return {
    modalName,
    current,
    openModal,
    closeModal,
  };
};
