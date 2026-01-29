import { useState } from 'react';
import type { UserModel } from '@/services/system/user/type';

export type ModalType = 'add' | 'edit' | 'view' | 'actionLog' | 'password' | 'assignRole' | 'recycle' | null;

/**
 * 统一管理用户相关的弹窗状态
 */
export const useUserModals = () => {
  // 窗口名称
  const [modal, setModal] = useState<ModalType>(null);
  // 当前操作的用户数据
  const [current, setCurrent] = useState<UserModel | null>(null);

  // 打开弹窗
  const openModal = (name: ModalType, record?: UserModel) => {
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
