/**
 * @file 角色弹窗状态管理
 */

import { useState } from 'react';
import type { RoleModel } from '@/shared/api/system/role/type';

/**
 * 角色弹窗模式。
 */
export type ModalType =
  | 'add'
  | 'edit'
  | 'view'
  | 'assignMenu'
  | 'assignUser'
  | 'assignResource'
  | 'assignPermission'
  | null;

/**
 * `useRoleModals` 返回值。
 */
export interface UseRoleModalsResult {
  modal: ModalType;
  current: Partial<RoleModel> | null;
  openModal: (name: ModalType, record?: Partial<RoleModel>) => void;
  closeModal: () => void;
}

/**
 * 统一管理角色相关弹窗状态。
 *
 * @returns 弹窗状态与操作方法
 */
export function useRoleModals(): UseRoleModalsResult {
  const [modal, setModal] = useState<ModalType>(null);
  const [current, setCurrent] = useState<Partial<RoleModel> | null>(null);

  /**
   * @param name - 弹窗类型
   * @param record - 关联角色行
   */
  function openModal(name: ModalType, record?: Partial<RoleModel>) {
    setModal(name);
    setCurrent(record || null);
  }

  function closeModal() {
    setModal(null);
    setCurrent(null);
  }

  return {
    modal,
    current,
    openModal,
    closeModal,
  };
}
