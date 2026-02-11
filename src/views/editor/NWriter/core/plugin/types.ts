/**
 * 插件系统类型定义
 * 插件通过生命周期与上下文扩展编辑器能力（注册弹窗、命令、菜单、快捷键等）
 */

import type { ComponentType } from 'react';
import type { IEditorContext } from '../editorContext/types';

/** 插件元信息（标识、版本、依赖，用于加载与兼容性检查） */
export interface PluginMeta {
  /** 插件唯一 ID，建议命名空间如 'nwriter.file' */
  id: string;
  /** 显示名称 */
  name: string;
  /** 版本号，语义化如 '1.0.0' */
  version: string;
  /** 可选：依赖的插件 id 列表，未满足时可不加载或报错 */
  dependencies?: string[];
  /** 可选：描述 */
  description?: string;
  /** 可选：作者/团队 */
  author?: string;
}

/** 插件上下文：在 install/activate 时注入，供插件访问编辑器与扩展点 */
export interface PluginContext {
  /** 编辑器 API */
  editor: IEditorContext;
  /** 注册弹窗：type -> 组件（插件内可 registerModal） */
  registerModal: (type: string, component: ComponentType<any>) => void;
  /** 注销弹窗（插件卸载时清理） */
  unregisterModal: (type: string) => boolean;
  /** 打开弹窗（封装 openModal，便于插件内使用） */
  openModal: <T = unknown>(
    type: string,
    props?: Record<string, unknown>,
    options?: { maskClosable?: boolean; destroyOnClose?: boolean; width?: number | string }
  ) => Promise<T>;
  /** 注册命令（扩展点：名称 -> 执行函数） */
  registerCommand: (name: string, handler: (...args: unknown[]) => void | Promise<void>) => void;
  /** 注销命令 */
  unregisterCommand: (name: string) => void;
  /** 执行命令（供插件或 UI 调用） */
  executeCommand: (name: string, ...args: unknown[]) => Promise<void>;
}

/** 插件实例：实现 install/activate/deactivate，由插件管理器调度 */
export interface IPlugin {
  meta: PluginMeta;
  /** 安装：注册资源（弹窗、命令、菜单等），在编辑器挂载后调用 */
  install: (ctx: PluginContext) => void | Promise<void>;
  /** 激活：插件启用时（可选，用于按需激活） */
  activate?: (ctx: PluginContext) => void | Promise<void>;
  /** 停用：插件禁用时，应移除副作用（弹窗、命令等） */
  deactivate?: (ctx: PluginContext) => void | Promise<void>;
  /** 卸载：彻底移除，与 install 对称清理 */
  uninstall?: (ctx: PluginContext) => void | Promise<void>;
}
