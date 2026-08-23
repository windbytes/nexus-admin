/**
 * 插件模块统一导出
 */
export { activateAllPlugins, deactivateAllPlugins, installAllPlugins, uninstallPlugin } from './pluginManager';
export { getAllPlugins, getPlugin, registerPlugin, unregisterPlugin } from './registry';
export type { IPlugin, PluginContext, PluginMeta } from './types';
