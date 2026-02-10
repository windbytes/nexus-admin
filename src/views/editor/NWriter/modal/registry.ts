// modal/registry.ts
import type { ModalComponent } from './types';

/**
 * 弹窗注册表
 */
const registry = new Map<string, ModalComponent>();

/**
 * 注册弹窗
 * @param type 弹窗类型
 * @param component 弹窗组件
 */
export function registerModal(type: string, component: ModalComponent) {
  if (registry.has(type)) {
    console.warn(`[modal] duplicated register: ${type}`);
  }
  registry.set(type, component);
}

/**
 * 获取弹窗
 * @param type 弹窗类型
 * @returns 弹窗组件
 */
export function getModal(type: string) {
  return registry.get(type);
}

/**
 * 注册编辑器域内弹窗
 */
export function registerEditorModal() {
  console.log('编辑器域内弹窗注册');
}
