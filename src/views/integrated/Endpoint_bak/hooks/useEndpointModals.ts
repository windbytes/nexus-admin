import { useState } from 'react';
import type { Endpoint } from '@/services/integrated/endpoint/endpointApi';

export type ModalType = 'add' | 'edit' | 'view' | 'clone' | 'callChainTrace' | null;

export type DrawerType = 'test' | 'detail' | 'version' | 'log' | 'dependencies' | null;

/**
 * 统一管理端点相关的弹窗状态
 */
export const useEndpointModals = () => {
  // 窗口名称
  const [modal, setModal] = useState<ModalType>(null);
  // Drawer 名称
  const [drawer, setDrawer] = useState<DrawerType>(null);
  // 当前操作的端点数据
  const [current, setCurrent] = useState<Endpoint | null>(null);
  // 初始值（用于新增时的默认值）
  const [initialValues, setInitialValues] = useState<Partial<Endpoint> | null>(null);

  // 打开弹窗
  const openModal = (name: ModalType, record?: Endpoint, initial?: Partial<Endpoint>) => {
    setModal(name);
    setCurrent(record || null);
    setInitialValues(initial || null);
  };

  // 关闭弹窗
  const closeModal = () => {
    setModal(null);
    setCurrent(null);
    setInitialValues(null);
  };

  // 打开抽屉
  const openDrawer = (name: DrawerType, record?: Endpoint) => {
    setDrawer(name);
    setCurrent(record || null);
  };

  // 关闭抽屉
  const closeDrawer = () => {
    setDrawer(null);
    setCurrent(null);
  };

  return {
    modal,
    drawer,
    current,
    initialValues,
    openModal,
    closeModal,
    openDrawer,
    closeDrawer,
  };
};

