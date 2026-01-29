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

// 组件属性接口
export interface CodeEditorProps {
  /** 代码内容 */
  value?: string;
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
  /** 占位符文本 */
  placeholder?: string;
  /** 代码变化回调 */
  onChange?: (value: string | undefined) => void;
  /** 编辑器挂载完成回调 */
  onMount?: (editor: editor.IStandaloneCodeEditor) => void;
  /** 验证回调 */
  onValidate?: (markers: editor.IMarker[]) => void;
  /** 自定义选项 */
  options?: editor.IStandaloneEditorConstructionOptions;
  /** 类名 */
  className?: string;
  /** 样式 */
  style?: React.CSSProperties;
  /** ref 引用（React 19 新特性：直接作为 prop） */
  ref?: React.Ref<CodeEditorRef>;
}

// 编辑器实例引用
export interface CodeEditorRef {
  /** 获取编辑器实例 */
  getEditor: () => editor.IStandaloneCodeEditor | null;
  /** 获取当前代码内容 */
  getValue: () => string;
  /** 设置代码内容 */
  setValue: (value: string) => void;
  /** 插入代码 */
  insertCode: (code: string, position?: { lineNumber: number; column: number }) => void;
  /** 获取选中的代码 */
  getSelectedCode: () => string;
  /** 替换选中的代码 */
  replaceSelectedCode: (code: string) => void;
  /** 格式化代码 */
  formatCode: () => void;
  /** 撤销 */
  undo: () => void;
  /** 重做 */
  redo: () => void;
  /** 查找文本 */
  findText: (text: string) => void;
  /** 替换文本 */
  replaceText: (text: string, replacement: string) => void;
  /** 跳转到指定行 */
  goToLine: (lineNumber: number) => void;
  /** 获取光标位置 */
  getCursorPosition: () => { lineNumber: number; column: number };
  /** 设置光标位置 */
  setCursorPosition: (lineNumber: number, column: number) => void;
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
