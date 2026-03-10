/**
 * 插件管理器
 * 负责插件的安装、激活、停用、卸载，并构建 PluginContext 供插件使用
 */

import { openModal, registerModal, unregisterModal } from '../../modal';
import type { IEditorContext } from '../editorContext/types';
import * as extensionRegistry from '../extension/registry';
import {
  registerDropdownContent as regDropdown,
  registerToolbarContribution as regToolbar,
  unregisterDropdownContent as unregDropdown,
  unregisterToolbarContribution as unregToolbar,
} from '../toolbar';
import { getAllPlugins, getPlugin } from './registry';
import type { PluginContext } from './types';

/** 已安装的插件 ID 集合（用于 deactivate/uninstall 时只处理已安装的） */
const installedIds = new Set<string>();

/**
 * 创建插件上下文（通过 getEditor 获取最新编辑器状态，便于插件内始终读到最新值）
 */
function createPluginContext(getEditor: () => IEditorContext): PluginContext {
  return {
    get editor() {
      return getEditor();
    },
    registerModal: (type, component) => registerModal(type, component as import('../../modal/types').ModalComponent),
    unregisterModal,
    openModal,
    registerCommand: extensionRegistry.registerCommand,
    unregisterCommand: extensionRegistry.unregisterCommand,
    executeCommand: extensionRegistry.executeCommand,
    registerToolbarContribution: regToolbar,
    unregisterToolbarContribution: unregToolbar,
    registerDropdownContent: regDropdown,
    unregisterDropdownContent: unregDropdown,
  };
}

/**
 * 安装所有已注册插件（在 EditorProvider 挂载后调用）
 * @param getEditor 获取当前编辑器上下文的函数（避免闭包陈旧）
 */
export async function installAllPlugins(getEditor: () => IEditorContext): Promise<void> {
  const plugins = getAllPlugins();
  const ctx = createPluginContext(getEditor);
  for (const plugin of plugins) {
    try {
      await Promise.resolve(plugin.install(ctx));
      installedIds.add(plugin.meta.id);
    } catch (err) {
      console.error(`[NWriter.Plugin] 插件安装失败: ${plugin.meta.id}`, err);
    }
  }
}

/**
 * 卸载所有已安装插件（在 EditorProvider 卸载前调用）
 * @param getEditor 获取当前编辑器上下文的函数（避免闭包陈旧）
 */
export async function uninstallAllPlugins(getEditor: () => IEditorContext): Promise<void> {
  const plugins = getAllPlugins();
  const ctx = createPluginContext(getEditor);
  for (const plugin of plugins) {
    try {
      await Promise.resolve(plugin.uninstall?.(ctx));
    } catch (err) {
      console.error(`[NWriter.Plugin] 插件卸载失败: ${plugin.meta.id}`, err);
    }
  }
}

/**
 * 激活所有已安装插件（若插件实现了 activate）
 */
export async function activateAllPlugins(getEditor: () => IEditorContext): Promise<void> {
  const plugins = getAllPlugins().filter((p) => installedIds.has(p.meta.id) && p.activate);
  const ctx = createPluginContext(getEditor);
  for (const plugin of plugins) {
    try {
      await Promise.resolve(plugin.activate?.(ctx));
    } catch (err) {
      console.error(`[NWriter.Plugin] 插件激活失败: ${plugin.meta.id}`, err);
    }
  }
}

/**
 * 停用所有已安装插件（若实现了 deactivate）
 */
export async function deactivateAllPlugins(getEditor: () => IEditorContext): Promise<void> {
  const plugins = getAllPlugins().filter((p) => installedIds.has(p.meta.id) && p.deactivate);
  const ctx = createPluginContext(getEditor);
  for (const plugin of plugins) {
    try {
      await Promise.resolve(plugin.deactivate?.(ctx));
    } catch (err) {
      console.error(`[NWriter.Plugin] 插件停用失败: ${plugin.meta.id}`, err);
    }
  }
}

/**
 * 卸载指定插件：先 deactivate 再 uninstall，并清理该插件注册的弹窗与命令
 * 注意：当前实现未按插件粒度记录「该插件注册了哪些 type/command」，若需精确清理可在插件内自行在 uninstall 中调用 unregisterModal/unregisterCommand
 */
export async function uninstallPlugin(pluginId: string, getEditor: () => IEditorContext): Promise<void> {
  const plugin = getPlugin(pluginId);
  if (!plugin) {
    return;
  }
  const ctx = createPluginContext(getEditor);
  try {
    await Promise.resolve(plugin.deactivate?.(ctx));
    await Promise.resolve(plugin.uninstall?.(ctx));
  } finally {
    installedIds.delete(pluginId);
  }
}
