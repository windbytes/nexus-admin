/**
 * 插件注册表
 * 管理插件的注册与查找，不负责生命周期（由 PluginManager 负责）
 */

import type { IPlugin } from './types';

const registry = new Map<string, IPlugin>();

/**
 * 注册插件（仅登记，不执行 install）
 * @param plugin 插件实例
 */
export function registerPlugin(plugin: IPlugin): void {
  const { id } = plugin.meta;
  if (registry.has(id)) {
    console.warn(`[NWriter.Plugin] 插件 ID 已存在，将被覆盖: ${id}`);
  }
  registry.set(id, plugin);
}

/**
 * 根据 ID 获取插件
 */
export function getPlugin(id: string): IPlugin | undefined {
  return registry.get(id);
}

/**
 * 获取所有已注册插件（按注册顺序）
 */
export function getAllPlugins(): IPlugin[] {
  return Array.from(registry.values());
}

/**
 * 取消注册插件（卸载后清理注册表）
 */
export function unregisterPlugin(id: string): boolean {
  return registry.delete(id);
}
