/**
 * 弹窗模块统一导出
 * 使用方式：
 * - 在应用根部包裹 <ModalProvider>
 * - 通过 registerModal 注册弹窗组件
 * - 在任意子组件/插件中通过 openModal(type, props?, options?) 打开弹窗
 */
export { ModalProvider } from './ModalProvider';
export { bindModalRuntime, closeModal, getModalStack, openModal } from './modalManager';
export { getModal, getRegisteredModalTypes, registerModal, unregisterModal } from './registry';
export type { ModalComponent, ModalInstance, ModalOptions, ModalPropsBase, ModalResult } from './types';
