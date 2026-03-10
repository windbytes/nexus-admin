/**
 * 弹窗管理器（命令式 API）
 * 在任意处通过 openModal/closeModal 打开或关闭弹窗，与 ModalProvider 解耦，便于在插件、命令、异步流程中调用
 */
import { nanoid } from 'nanoid';
import type { ModalInstance, ModalOptions } from './types';

/** 默认弹窗选项 */
const DEFAULT_OPTIONS: ModalOptions = {
  maskClosable: true,
  destroyOnHidden: true,
  keyboard: true,
};

/** 运行时注入：由 ModalProvider 在挂载时绑定 */
let pushFn: (modal: ModalInstance) => void;
let popFn: (id: string) => void;
let getStackFn: () => ModalInstance[];

/**
 * 绑定弹窗运行时（仅由 ModalProvider 调用，业务勿用）
 * @param push 将新弹窗实例压栈
 * @param pop 根据 id 移出弹窗
 * @param getStack 获取当前弹窗栈（用于调试或层级计算）
 */
export function bindModalRuntime(
  push: (modal: ModalInstance) => void,
  pop: (id: string) => void,
  getStack: () => ModalInstance[] = () => []
): void {
  pushFn = push;
  popFn = pop;
  getStackFn = getStack;
}

/**
 * 打开弹窗（Promise 化，便于 async/await）
 * @param type 弹窗类型（须已通过 registerModal 注册）
 * @param props 传给弹窗组件的业务 props
 * @param options 弹窗层行为选项（蒙层、销毁、宽度等）
 * @returns Promise<T> 弹窗 onResolve(result) 时 resolve(result)，onReject/关闭时 reject
 */
export function openModal<T = unknown>(
  type: string,
  props?: Record<string, unknown>,
  options?: ModalOptions
): Promise<T> {
  if (typeof pushFn !== 'function' || typeof popFn !== 'function') {
    throw new Error('[NWriter.Modal] 弹窗运行时未绑定，请确保在 ModalProvider 子树内调用 openModal');
  }

  const id = nanoid();
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  return new Promise<T>((resolve, reject) => {
    const instance: ModalInstance = {
      id,
      type,
      props: props ?? {},
      options: mergedOptions,
      resolve: (value?: unknown) => {
        resolve(value as T);
        popFn(id);
      },
      reject: () => {
        reject(new Error('Modal rejected'));
        popFn(id);
      },
    };
    pushFn(instance);
  });
}

/**
 * 根据弹窗 id 关闭指定弹窗（不触发 resolve/reject，仅移除）
 * 用于超时、权限变更等需要强制关闭的场景
 */
export function closeModal(id: string): void {
  if (typeof popFn !== 'function') {
    return;
  }
  popFn(id);
}

/**
 * 获取当前弹窗栈（只读，用于调试或计算 zIndex）
 */
export function getModalStack(): ModalInstance[] {
  return typeof getStackFn === 'function' ? getStackFn() : [];
}
