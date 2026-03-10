import { useState } from 'react';
import type { DictModel } from '@/services/system/dict/type.d';

/** 弹窗类型：新增 / 编辑 / 查看 */
export type DictModalType = 'add' | 'edit' | 'view' | null;

/**
 * 统一管理数据字典相关弹窗状态
 */
export const useDictModals = () => {
  const [modal, setModal] = useState<DictModalType>(null);
  const [current, setCurrent] = useState<DictModel | null>(null);

  const openModal = (name: DictModalType, record?: DictModel) => {
    setModal(name);
    setCurrent(record ?? null);
  };

  const closeModal = () => {
    setModal(null);
    setCurrent(null);
  };

  return { modal, current, openModal, closeModal };
};
