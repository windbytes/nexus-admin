/**
 * 扩展点/命令模块统一导出
 */

export { executeCommand, getCommand, getRegisteredCommandNames, registerCommand, unregisterCommand } from './registry';
export type { CommandHandler, ExtensionPointDescriptor } from './types';
