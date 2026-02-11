/**
 * 扩展点/命令系统类型定义
 * 命令可被菜单、快捷键、插件调用，实现「行为」与「UI」解耦，便于扩展与测试
 */

/** 命令处理器：命令名 -> 执行函数 */
export type CommandHandler = (...args: unknown[]) => void | Promise<void>;

/** 扩展点：名称 + 描述（可用于动态生成菜单或文档） */
export interface ExtensionPointDescriptor {
  name: string;
  description?: string;
}
