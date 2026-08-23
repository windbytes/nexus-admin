/**
 * 编辑器上下文类型定义
 * 供插件、弹窗、命令等获取编辑器能力，便于解耦与测试（可 mock）
 */

/** 编辑器对外暴露的 API（随业务扩展：文档、选区、历史、协作等） */
export interface IEditorContext {
  /** 当前缩放比例 */
  scale: number;
  /** 设置缩放 */
  setScale: (scale: number) => void;
  /** 编辑模式：edit | readOnly | review 等 */
  editorMode: string;
  /** 设置编辑模式 */
  setEditorMode: (mode: string) => void;
  /** 当前激活的 Tab 键（如 start、page、insert） */
  activeTabKey: string;
  /** 切换 Tab */
  setActiveTabKey: (key: string) => void;
  /** 侧边栏是否收缩 */
  sidebarCollapsed: boolean;
  /** 设置侧边栏收缩 */
  setSidebarCollapsed: (collapsed: boolean) => void;
  /** 预留：文档模型、选区、历史栈等可在此扩展 */
  // getDocument(): IDocument;
  // getSelection(): ISelection;
  // history: IHistory;
}
