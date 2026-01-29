import { useState } from 'react';
import type { MenuModel } from '@/services/system/menu/type';

export type ModalType = 'add' | 'edit' | 'view' | null;

/**
 * 统一管理菜单相关的弹窗状态
 */
export const useMenuModals = () => {
  // 窗口名称
  const [modal, setModal] = useState<ModalType>(null);
  // 当前选中的菜单数据（用于显示菜单详情，不会因为新增操作而清空）
  const [selectedMenu, setSelectedMenu] = useState<MenuModel | null>(null);
  // 当前编辑的菜单数据（用于编辑窗口）
  const [editingMenu, setEditingMenu] = useState<MenuModel | null>(null);
  // 新增时的父菜单数据（用于新增窗口设置 parentId，但不影响 selectedMenu）
  const [parentMenu, setParentMenu] = useState<MenuModel | null>(null);
  // 复制的菜单数据（用于复制功能）
  const [copiedMenuData, setCopiedMenuData] = useState<Partial<MenuModel> | null>(null);

  // 打开弹窗
  const openModal = (name: ModalType, record?: MenuModel) => {
    setModal(name);
    if (name === 'add') {
      // 新增时，将传入的 record 作为父菜单（用于设置 parentId），但不更新 selectedMenu
      setParentMenu(record || null);
      setEditingMenu(null);
    } else {
      // 编辑或查看时，设置编辑菜单
      setEditingMenu(record || null);
      setParentMenu(null);
    }
  };

  // 设置当前菜单（用于选中菜单时更新，只更新选中菜单，不影响编辑菜单）
  const setCurrentMenu = (record?: MenuModel) => {
    setSelectedMenu(record || null);
  };

  // 关闭弹窗
  const closeModal = () => {
    setModal(null);
    setEditingMenu(null);
    setParentMenu(null);
    setCopiedMenuData(null);
    // 注意：不清空 selectedMenu，保持菜单详情显示
  };

  // 设置复制的菜单数据
  const setCopiedData = (data: Partial<MenuModel> | null) => {
    setCopiedMenuData(data);
  };

  return {
    modal,
    // current 用于向后兼容，返回 selectedMenu（用于显示详情）
    current: selectedMenu,
    // 编辑窗口使用的菜单数据
    editingMenu,
    // 新增时的父菜单数据（用于设置 parentId）
    parentMenu,
    copiedMenuData,
    openModal,
    closeModal,
    setCopiedData,
    setCurrentMenu,
  };
};
