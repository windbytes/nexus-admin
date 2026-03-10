/**
 * 插件入口：集中注册 NWriter 内置插件
 * 新增插件时在此 registerPlugin，即可在 EditorProvider 挂载后自动安装
 */

import { registerPlugin } from '../core/plugin';
import { filePlugin } from './filePlugin';
import { pasteDropdownPlugin } from './pasteDropdownPlugin';

/** 注册所有内置插件 */
export function registerBuiltinPlugins(): void {
  registerPlugin(filePlugin);
  registerPlugin(pasteDropdownPlugin);
}
