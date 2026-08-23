/**
 * 命令注册表
 * 将命令名称与执行函数绑定，供插件、工具栏、快捷键统一调用
 */

import type { CommandHandler } from './types';

const commands = new Map<string, CommandHandler>();

/**
 * 注册命令
 * @param name 命令唯一名，建议命名空间如 'file.save'、'editor.undo'
 * @param handler 执行函数，参数由调用方传入
 */
export function registerCommand(name: string, handler: CommandHandler): void {
  if (commands.has(name)) {
    console.warn(`[NWriter.Extension] 命令已存在，将被覆盖: ${name}`);
  }
  commands.set(name, handler);
}

/**
 * 注销命令（插件卸载时清理）
 */
export function unregisterCommand(name: string): boolean {
  return commands.delete(name);
}

/**
 * 获取命令处理器
 */
export function getCommand(name: string): CommandHandler | undefined {
  return commands.get(name);
}

/**
 * 执行命令
 * @param name 命令名
 * @param args 参数列表
 */
export async function executeCommand(name: string, ...args: unknown[]): Promise<void> {
  const handler = commands.get(name);
  if (!handler) {
    console.warn(`[NWriter.Extension] 未注册的命令: ${name}`);
    return;
  }
  await Promise.resolve(handler(...args));
}

/**
 * 获取所有已注册命令名（调试或动态菜单）
 */
export function getRegisteredCommandNames(): string[] {
  return Array.from(commands.keys());
}
