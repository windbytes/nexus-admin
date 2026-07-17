import { useState } from 'react';
import type { MenuModel } from '@/shared/api/system/menu/type';

/**
 * 菜单弹窗模式。
 * - `add`：新增
 * - `edit`：编辑
 * - `view`：只读查看
 * - `null`：关闭
 */
export type ModalType = 'add' | 'edit' | 'view' | null;

/**
 * `useMenuModals` 返回值。
 */
export interface UseMenuModalsResult {
  /** 当前打开的弹窗类型；`null` 表示关闭 */
  modal: ModalType;
  /** 编辑/查看时加载到表单的菜单数据 */
  editingMenu: MenuModel | null;
  /** 新增时作为上级的父菜单（用于预填 parentId） */
  parentMenu: MenuModel | null;
  /** 复制功能产生的预填数据 */
  copiedMenuData: Partial<MenuModel> | null;
  /**
   * 打开指定类型弹窗。
   * @param name - 弹窗类型
   * @param record - 编辑/查看时传入当前行；新增时可选传入父菜单
   */
  openModal: (name: ModalType, record?: MenuModel) => void;
  /** 关闭弹窗并清理临时状态 */
  closeModal: () => void;
  /**
   * 设置复制预填数据。
   * @param data - 复制后的字段；传 `null` 清空
   */
  setCopiedData: (data: Partial<MenuModel> | null) => void;
}

/**
 * 统一管理菜单新增 / 编辑 / 查看弹窗及相关上下文数据。
 *
 * @returns 弹窗状态与操作方法
 */
export function useMenuModals(): UseMenuModalsResult {
  const [modal, setModal] = useState<ModalType>(null);
  const [editingMenu, setEditingMenu] = useState<MenuModel | null>(null);
  const [parentMenu, setParentMenu] = useState<MenuModel | null>(null);
  const [copiedMenuData, setCopiedMenuData] = useState<Partial<MenuModel> | null>(null);

  /**
   * @param name - 弹窗类型
   * @param record - 关联菜单行
   */
  function openModal(name: ModalType, record?: MenuModel) {
    setModal(name);
    if (name === 'add') {
      setParentMenu(record || null);
      setEditingMenu(null);
    } else {
      setEditingMenu(record || null);
      setParentMenu(null);
    }
  }

  function closeModal() {
    setModal(null);
    setEditingMenu(null);
    setParentMenu(null);
    setCopiedMenuData(null);
  }

  /**
   * @param data - 复制预填数据
   */
  function setCopiedData(data: Partial<MenuModel> | null) {
    setCopiedMenuData(data);
  }

  return {
    modal,
    editingMenu,
    parentMenu,
    copiedMenuData,
    openModal,
    closeModal,
    setCopiedData,
  };
}
