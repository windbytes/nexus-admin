import { useState } from 'react';
import type { MenuModel } from '@/services/system/menu/type';

export type ModalType = 'add' | 'edit' | 'view' | null;

/**
 * 统一管理菜单相关的弹窗状态
 */
export const useMenuModals = () => {
  // 窗口名称
  const [modal, setModal] = useState<ModalType>(null);
  // 当前操作的菜单数据
  const [current, setCurrent] = useState<MenuModel | null>(null);
  // 复制的菜单数据（用于复制功能）
  const [copiedMenuData, setCopiedMenuData] = useState<Partial<MenuModel> | null>(null);

  // 打开弹窗
  const openModal = (name: ModalType, record?: MenuModel) => {
    setModal(name);
    setCurrent(record || null);
  };

  // 设置当前菜单（用于选中菜单时更新）
  const setCurrentMenu = (record?: MenuModel) => {
    setCurrent(record || null);
  };

  // 关闭弹窗
  const closeModal = () => {
    setModal(null);
    setCurrent(null);
    setCopiedMenuData(null);
  };

  // 设置复制的菜单数据
  const setCopiedData = (data: Partial<MenuModel> | null) => {
    setCopiedMenuData(data);
  };

  return {
    modal,
    current,
    copiedMenuData,
    openModal,
    closeModal,
    setCopiedData,
    setCurrentMenu,
  };
};
