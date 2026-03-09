import { createContext, useCallback, useContext, useState } from 'react';
import type { EngineApp } from '@/services/engine/app/types';

export type AppCardModalType =
  | 'edit'
  | 'duplicate'
  | 'switch'
  | 'saveAsTemplate'
  | null;

/**
 * 统一管理应用卡片相关弹窗状态（编辑 / 复制 / 切换类型 / 存为模板）
 */
export const useAppCardModals = () => {
  const [modal, setModal] = useState<AppCardModalType>(null);
  const [current, setCurrent] = useState<EngineApp | null>(null);

  const openModal = useCallback((name: AppCardModalType, record?: EngineApp) => {
    setModal(name);
    setCurrent(record ?? null);
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
    setCurrent(null);
  }, []);

  return {
    modal,
    current,
    openModal,
    closeModal,
  };
};

type AppCardModalContextValue = {
  openModal: (name: AppCardModalType, record?: EngineApp) => void;
  closeModal: () => void;
};

const AppCardModalContext = createContext<AppCardModalContextValue | null>(null);

export const AppCardModalProvider = AppCardModalContext.Provider;

export const useAppCardModalContext = (): AppCardModalContextValue => {
  const ctx = useContext(AppCardModalContext);
  if (!ctx) {
    throw new Error('useAppCardModalContext must be used within AppCardModalProvider');
  }
  return ctx;
};

/**
 * 供仅需打开弹窗、不依赖当前 modal/current 的子组件使用（如 AppCard），
 * 避免将 openModal 通过 props 层层下传导致不必要的重渲染。
 */
export function useAppCardModalActions(): AppCardModalContextValue {
  return useAppCardModalContext();
}
