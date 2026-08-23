/**
 * 弹窗注册表
 * 将「弹窗类型」与「弹窗组件」绑定，支持按类型打开弹窗，便于模块化与插件扩展
 */

import type { ModalComponent } from './types';

/** 类型 -> 弹窗组件的映射（单例） */
const registry = new Map<string, ModalComponent>();

/**
 * 注册弹窗
 * @param type 弹窗类型（唯一标识，如 'FileMenuModal'、'SaveAsModal'）
 * @param component 弹窗组件（需接收 ModalPropsBase）
 */
export function registerModal(type: string, component: ModalComponent): void {
  if (registry.has(type)) {
    console.warn(`[NWriter.Modal] 弹窗类型已存在，将被覆盖: ${type}`);
  }
  registry.set(type, component);
}

/**
 * 根据类型获取弹窗组件
 * @param type 弹窗类型
 * @returns 弹窗组件，未注册则返回 undefined
 */
export function getModal(type: string): ModalComponent | undefined {
  return registry.get(type);
}

/**
 * 获取所有已注册的弹窗类型（用于调试或动态菜单）
 */
export function getRegisteredModalTypes(): string[] {
  return Array.from(registry.keys());
}

/**
 * 取消注册某类型弹窗（插件卸载时可用）
 */
export function unregisterModal(type: string): boolean {
  return registry.delete(type);
}
