/**
 * @file 页面按钮弹窗状态管理
 */

import { useState } from 'react';
import type { PageButtonModel } from '@/shared/api/system/pageButton/type';
import type { ButtonModalType } from '../types';

/**
 * `useButtonModals` 返回值。
 */
export interface UseButtonModalsResult {
  /** 当前弹窗类型；`null` 表示关闭 */
  modal: ButtonModalType;
  /** 当前编辑行 */
  current: Partial<PageButtonModel> | null;
  /**
   * 打开弹窗。
   * @param name - 弹窗类型
   * @param record - 编辑时传入当前行
   */
  openModal: (name: ButtonModalType, record?: Partial<PageButtonModel>) => void;
  /** 关闭弹窗并清空当前行 */
  closeModal: () => void;
}

/**
 * 统一管理页面按钮新增 / 编辑弹窗状态。
 *
 * @returns 弹窗状态与操作方法
 */
export function useButtonModals(): UseButtonModalsResult {
  const [modal, setModal] = useState<ButtonModalType>(null);
  const [current, setCurrent] = useState<Partial<PageButtonModel> | null>(null);

  /**
   * @param name - 弹窗类型
   * @param record - 关联按钮行
   */
  function openModal(name: ButtonModalType, record?: Partial<PageButtonModel>) {
    setModal(name);
    setCurrent(record ?? null);
  }

  function closeModal() {
    setModal(null);
    setCurrent(null);
  }

  return { modal, current, openModal, closeModal };
}
