/**
 * NWriter 核心架构统一导出
 * - editorContext: 编辑器 API 类型与实现
 * - plugin: 插件注册与生命周期管理
 * - extension: 命令注册与执行
 * - EditorProvider: 根提供者（状态 + 弹窗 + 插件安装）
 */

export * from './editorContext';
export * from './eventBus';
export * from './extension';
export * from './plugin';
export * from './toolbar';
export { EditorProvider, useEditorContext, useEditorContextOptional } from './EditorProvider';
