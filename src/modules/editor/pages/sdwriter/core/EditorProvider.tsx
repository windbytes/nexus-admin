import type React from 'react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ModalProvider } from '../modal';
import type { IEditorContext } from './editorContext/types';
import { installAllPlugins, uninstallAllPlugins } from './plugin/pluginManager';

/** React Context：供子组件与插件获取编辑器 API */
const EditorContext = createContext<IEditorContext | null>(null);

/**
 * 获取编辑器上下文（在 EditorProvider 子树内使用）
 */
export function useEditorContext(): IEditorContext {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error('[NWriter] useEditorContext 必须在 EditorProvider 内部使用');
  }
  return ctx;
}

/** 可选：仅当在 Provider 内时才返回 context，否则返回 null */
export function useEditorContextOptional(): IEditorContext | null {
  return useContext(EditorContext);
}

interface EditorProviderProps {
  children: React.ReactNode;
  /** 初始激活的 Tab，默认 'start' */
  defaultActiveTabKey?: string;
  /** 初始缩放，默认 1 */
  defaultScale?: number;
  /** 初始编辑模式，默认 'edit' */
  defaultEditorMode?: string;
  /** 初始侧边栏是否收缩，默认 false */
  defaultSidebarCollapsed?: boolean;
}

/**
 * 编辑器提供者
 * 1. 持有编辑器公共状态（缩放、模式、Tab、侧边栏等）并通过 Context 下发
 * 2. 包裹 ModalProvider，保证弹窗在编辑器子树内可用
 * 3. 在挂载后安装所有已注册插件，将编辑器 API 与扩展能力注入插件
 */
export function EditorProvider({
  children,
  defaultActiveTabKey = 'start',
  defaultScale = 1,
  defaultEditorMode = 'edit',
  defaultSidebarCollapsed = false,
}: EditorProviderProps) {
  const [scale, setScale] = useState(defaultScale);
  const [editorMode, setEditorMode] = useState(defaultEditorMode);
  const [activeTabKey, setActiveTabKey] = useState(defaultActiveTabKey);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultSidebarCollapsed);

  const editorApi: IEditorContext = {
    scale,
    setScale,
    editorMode,
    setEditorMode,
    activeTabKey,
    setActiveTabKey,
    sidebarCollapsed,
    setSidebarCollapsed,
  };

  const editorRef = useRef<IEditorContext>(editorApi);
  editorRef.current = editorApi;

  useEffect(() => {
    installAllPlugins(() => editorRef.current).catch((err) => {
      console.error('[NWriter] 插件安装失败', err);
    });
    return () => {
      uninstallAllPlugins(() => editorRef.current).catch((err) => {
        console.error('[NWriter] 插件停用失败', err);
      });
    };
  }, []);

  return (
    <EditorContext.Provider value={editorApi}>
      <ModalProvider>{children}</ModalProvider>
    </EditorContext.Provider>
  );
}
