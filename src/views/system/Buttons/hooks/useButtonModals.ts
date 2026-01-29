import { useState } from 'react';
import type { PageButtonModel } from '@/services/system/pageButton/type';
import type { ButtonModalType } from '../types';

/**
 * 统一管理页面按钮相关的弹窗状态
 */
export const useButtonModals = () => {
  const [modal, setModal] = useState<ButtonModalType>(null);
  const [current, setCurrent] = useState<Partial<PageButtonModel> | null>(null);

  const openModal = (name: ButtonModalType, record?: Partial<PageButtonModel>) => {
    setModal(name);
    setCurrent(record ?? null);
  };

  const closeModal = () => {
    setModal(null);
    setCurrent(null);
  };

  return { modal, current, openModal, closeModal };
};
