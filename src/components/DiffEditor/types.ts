import type { editor } from 'monaco-editor';

// 支持的语言类型
export type SupportedLanguage = 
  | 'javascript' 
  | 'typescript' 
  | 'json' 
  | 'java' 
  | 'groovy' 
  | 'sql' 
  | 'python'
  | 'html'
  | 'css'
  | 'xml'
  | 'yaml'
  | 'markdown'
  | 'shell'
  | 'plaintext';

// 主题类型
export type EditorTheme = 'vs' | 'vs-dark' | 'hc-black';

// 差异渲染模式
export type DiffRenderMode = 'side-by-side' | 'inline';

// 差异统计信息
export interface DiffStatistics {
  /** 总变更数 */
  totalChanges: number;
  /** 新增行数 */
  insertions: number;
  /** 删除行数 */
  deletions: number;
  /** 修改行数 */
  modifications: number;
}

// 组件属性接口
export interface DiffEditorProps {
  /** 原始内容 */
  original: string;
  /** 修改后内容 */
  modified: string;
  /** 语言类型 */
  language?: SupportedLanguage;
  /** 主题 */
  theme?: EditorTheme;
  /** 是否只读 */
  readOnly?: boolean;
  /** 是否显示行号 */
  showLineNumbers?: boolean;
  /** 是否显示小地图 */
  showMinimap?: boolean;
  /** 是否自动换行 */
  wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  /** 字体大小 */
  fontSize?: number;
  /** 字体族 */
  fontFamily?: string;
  /** 行高 */
  lineHeight?: number;
  /** 是否显示括号匹配 */
  bracketPairColorization?: boolean;
  /** 是否显示缩进指南 */
  guides?: {
    indentation?: boolean;
    bracketPairs?: boolean;
  };
  /** 编辑器高度 */
  height?: string | number;
  /** 编辑器宽度 */
  width?: string | number;
  /** 差异渲染模式 */
  renderSideBySide?: boolean;
  /** 是否启用分割视图调整大小 */
  enableSplitViewResizing?: boolean;
  /** 是否忽略空白字符差异 */
  ignoreTrimWhitespace?: boolean;
  /** 是否显示原始内容 */
  showOriginal?: boolean;
  /** 是否显示修改后内容 */
  showModified?: boolean;
  /** 原始内容标题 */
  originalTitle?: string;
  /** 修改后内容标题 */
  modifiedTitle?: string;
  /** 编辑器挂载完成回调 */
  onMount?: (editor: editor.IStandaloneDiffEditor) => void;
  /** 自定义选项 */
  options?: editor.IDiffEditorConstructionOptions;
  /** 类名 */
  className?: string;
  /** 样式 */
  style?: React.CSSProperties;
}

// 差异编辑器实例引用
export interface DiffEditorRef {
  /** 获取差异编辑器实例 */
  getEditor: () => editor.IStandaloneDiffEditor | null;
  /** 获取原始编辑器实例 */
  getOriginalEditor: () => editor.IStandaloneCodeEditor | null;
  /** 获取修改后编辑器实例 */
  getModifiedEditor: () => editor.IStandaloneCodeEditor | null;
  /** 获取原始内容 */
  getOriginalValue: () => string;
  /** 获取修改后内容 */
  getModifiedValue: () => string;
  /** 设置原始内容 */
  setOriginalValue: (value: string) => void;
  /** 设置修改后内容 */
  setModifiedValue: (value: string) => void;
  /** 设置差异内容 */
  setDiff: (original: string, modified: string) => void;
  /** 获取差异统计信息 */
  getDiffStatistics: () => DiffStatistics;
  /** 跳转到下一个差异 */
  goToNextDiff: () => void;
  /** 跳转到上一个差异 */
  goToPreviousDiff: () => void;
  /** 跳转到指定差异 */
  goToDiff: (index: number) => void;
  /** 获取所有差异 */
  getDiffs: () => editor.ILineChange[];
  /** 聚焦编辑器 */
  focus: () => void;
  /** 失焦编辑器 */
  blur: () => void;
  /** 是否只读 */
  isReadOnly: () => boolean;
  /** 设置只读状态 */
  setReadOnly: (readOnly: boolean) => void;
  /** 获取语言 */
  getLanguage: () => string;
  /** 设置语言 */
  setLanguage: (language: SupportedLanguage) => void;
  /** 获取主题 */
  getTheme: () => string;
  /** 设置主题 */
  setTheme: (theme: EditorTheme) => void;
  /** 更新差异编辑器选项 */
  updateOptions: (options: editor.IDiffEditorConstructionOptions) => void;
  /** 重新计算差异 */
  recomputeDiff: () => void;
}

// 语言配置映射
export const LANGUAGE_CONFIG_MAP: Record<SupportedLanguage, {
  name: string;
  extensions: string[];
  mimeType: string;
}> = {
  javascript: {
    name: 'JavaScript',
    extensions: ['.js', '.jsx', '.mjs'],
    mimeType: 'text/javascript',
  },
  typescript: {
    name: 'TypeScript',
    extensions: ['.ts', '.tsx'],
    mimeType: 'text/typescript',
  },
  json: {
    name: 'JSON',
    extensions: ['.json'],
    mimeType: 'application/json',
  },
  java: {
    name: 'Java',
    extensions: ['.java'],
    mimeType: 'text/x-java-source',
  },
  groovy: {
    name: 'Groovy',
    extensions: ['.groovy', '.gvy'],
    mimeType: 'text/x-groovy',
  },
  sql: {
    name: 'SQL',
    extensions: ['.sql'],
    mimeType: 'text/x-sql',
  },
  python: {
    name: 'Python',
    extensions: ['.py', '.pyw', '.pyi'],
    mimeType: 'text/x-python',
  },
  html: {
    name: 'HTML',
    extensions: ['.html', '.htm', '.xhtml'],
    mimeType: 'text/html',
  },
  css: {
    name: 'CSS',
    extensions: ['.css', '.scss', '.sass', '.less'],
    mimeType: 'text/css',
  },
  xml: {
    name: 'XML',
    extensions: ['.xml', '.xsd', '.xsl', '.xslt'],
    mimeType: 'text/xml',
  },
  yaml: {
    name: 'YAML',
    extensions: ['.yml', '.yaml'],
    mimeType: 'text/yaml',
  },
  markdown: {
    name: 'Markdown',
    extensions: ['.md', '.markdown'],
    mimeType: 'text/markdown',
  },
  shell: {
    name: 'Shell Script',
    extensions: ['.sh', '.bash', '.zsh', '.fish'],
    mimeType: 'text/x-sh',
  },
  plaintext: {
    name: 'Plain Text',
    extensions: ['.txt', '.log'],
    mimeType: 'text/plain',
  },
};

// 主题配置
export const THEME_CONFIG = {
  'vs': {
    name: 'Light',
    description: '浅色主题',
  },
  'vs-dark': {
    name: 'Dark',
    description: '深色主题',
  },
  'hc-black': {
    name: 'High Contrast',
    description: '高对比度主题',
  },
} as const;
