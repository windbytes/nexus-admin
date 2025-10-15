import { useImperativeHandle, useRef, useCallback, useEffect, useState } from 'react';
import type { OnMount, OnChange, OnValidate } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { Editor } from '@monaco-editor/react';
import type { CodeEditorProps, CodeEditorRef } from './types';
import './index.scss';

/**
 * 代码编辑器组件
 * 基于 Monaco Editor 封装
 * React 19 新特性：直接接收 ref prop，无需 forwardRef 包装
 */
const CodeEditor: React.FC<CodeEditorProps> = ({
  value = '',
  language = 'javascript',
  theme = 'vs',
  readOnly = false,
  showLineNumbers = true,
  showMinimap = true,
  wordWrap = 'off',
  fontSize = 14,
  fontFamily = 'Consolas, "Courier New", monospace',
  lineHeight = 20,
  bracketPairColorization = true,
  guides = { indentation: true, bracketPairs: true },
  height = '400px',
  width = '100%',
  placeholder = '',
  onChange,
  onMount,
  onValidate,
  options = {},
  className = '',
  style = {},
  ref,
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [currentValue, setCurrentValue] = useState(value);
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [isReadOnly, setIsReadOnly] = useState(readOnly);

  // 默认配置选项
  const defaultOptions: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: true },
    lineNumbers: 'on',
    wordWrap: 'off',
    fontSize: 14,
    fontFamily: 'Consolas, "Courier New", monospace',
    lineHeight: 20,
    bracketPairColorization: { enabled: true },
    guides: {
      indentation: true,
      bracketPairs: true,
    },
    automaticLayout: true,
    scrollBeyondLastLine: false,
    roundedSelection: false,
    selectOnLineNumbers: true,
    folding: true,
    foldingStrategy: 'indentation',
    showFoldingControls: 'always',
    renderWhitespace: 'selection',
    renderControlCharacters: false,
    renderLineHighlight: 'all',
    contextmenu: true,
    quickSuggestions: true,
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on',
    tabSize: 2,
    insertSpaces: true,
    detectIndentation: true,
    trimAutoWhitespace: true,
    largeFileOptimizations: true,
  };

  // 合并配置选项
  const mergedOptions: editor.IStandaloneEditorConstructionOptions = {
    ...defaultOptions,
    ...options,
    minimap: { enabled: showMinimap },
    lineNumbers: showLineNumbers ? 'on' : 'off',
    wordWrap,
    fontSize,
    fontFamily,
    lineHeight,
    bracketPairColorization: { enabled: bracketPairColorization },
    guides,
    readOnly: isReadOnly,
  };

  // 暴露编辑器方法给父组件（使用 React 19 的 ref prop）
  useImperativeHandle<CodeEditorRef, CodeEditorRef>(ref, () => ({
    getEditor: () => editorRef.current,
    
    getValue: () => {
      return editorRef.current?.getValue() || '';
    },
    
    setValue: (value: string) => {
      if (editorRef.current) {
        editorRef.current.setValue(value);
        setCurrentValue(value);
      }
    },
    
    insertCode: (code: string, position?: { lineNumber: number; column: number }) => {
      if (editorRef.current) {
        const pos = position || editorRef.current.getPosition();
        if (pos) {
          const range = new (window as any).monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column);
          editorRef.current.executeEdits('insertCode', [{
            range,
            text: code,
          }]);
        }
      }
    },
    
    getSelectedCode: () => {
      if (editorRef.current) {
        const selection = editorRef.current.getSelection();
        if (selection) {
          const model = editorRef.current.getModel();
          if (model) {
            return model.getValueInRange(selection);
          }
        }
      }
      return '';
    },
    
    replaceSelectedCode: (code: string) => {
      if (editorRef.current) {
        const selection = editorRef.current.getSelection();
        if (selection) {
          editorRef.current.executeEdits('replaceSelection', [{
            range: selection,
            text: code,
          }]);
        }
      }
    },
    
    formatCode: () => {
      if (editorRef.current) {
        const action = editorRef.current.getAction('editor.action.formatDocument');
        if (action) {
          action.run();
        }
      }
    },
    
    undo: () => {
      if (editorRef.current) {
        editorRef.current.trigger('keyboard', 'undo', {});
      }
    },
    
    redo: () => {
      if (editorRef.current) {
        editorRef.current.trigger('keyboard', 'redo', {});
      }
    },
    
    findText: (text: string) => {
      if (editorRef.current) {
        editorRef.current.trigger('keyboard', 'actions.find', {});
        // 设置搜索文本
        setTimeout(() => {
          const findInput = document.querySelector('.find-input input') as HTMLInputElement;
          if (findInput) {
            findInput.value = text;
            findInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }, 100);
      }
    },
    
    replaceText: (text: string, replacement: string) => {
      if (editorRef.current) {
        editorRef.current.trigger('keyboard', 'actions.find', {});
        // 设置搜索和替换文本
        setTimeout(() => {
          const findInput = document.querySelector('.find-input input') as HTMLInputElement;
          const replaceInput = document.querySelector('.replace-input input') as HTMLInputElement;
          if (findInput && replaceInput) {
            findInput.value = text;
            replaceInput.value = replacement;
            findInput.dispatchEvent(new Event('input', { bubbles: true }));
            replaceInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }, 100);
      }
    },
    
    goToLine: (lineNumber: number) => {
      if (editorRef.current) {
        editorRef.current.revealLineInCenter(lineNumber);
        editorRef.current.setPosition({ lineNumber, column: 1 });
        editorRef.current.focus();
      }
    },
    
    getCursorPosition: () => {
      if (editorRef.current) {
        const position = editorRef.current.getPosition();
        return {
          lineNumber: position?.lineNumber || 1,
          column: position?.column || 1,
        };
      }
      return { lineNumber: 1, column: 1 };
    },
    
    setCursorPosition: (lineNumber: number, column: number) => {
      if (editorRef.current) {
        editorRef.current.setPosition({ lineNumber, column });
        editorRef.current.revealLineInCenter(lineNumber);
        editorRef.current.focus();
      }
    },
    
    focus: () => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    },
    
    blur: () => {
      if (editorRef.current) {
        // Monaco Editor 没有 blur 方法，可以通过失焦其他元素来实现
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement) {
          activeElement.blur();
        }
      }
    },
    
    isReadOnly: () => {
      return isReadOnly;
    },
    
    setReadOnly: (readOnly: boolean) => {
      setIsReadOnly(readOnly);
      if (editorRef.current) {
        editorRef.current.updateOptions({ readOnly });
      }
    },
    
    getLanguage: () => {
      return currentLanguage;
    },
    
    setLanguage: (language: string) => {
      setCurrentLanguage(language as any);
      // 注意：Monaco Editor 的语言切换需要通过重新渲染组件实现
    },
    
    getTheme: () => {
      return currentTheme;
    },
    
    setTheme: (theme: string) => {
      setCurrentTheme(theme as any);
      // 注意：Monaco Editor 的主题切换需要通过重新渲染组件实现
    },
  }), [isReadOnly, currentLanguage, currentTheme]);

  // 编辑器挂载完成回调
  const handleEditorDidMount: OnMount = useCallback((editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    
    // 设置占位符 - 使用简单的文本装饰
    if (placeholder && !value) {
      try {
        const range = new (window as any).monaco.Range(1, 1, 1, 1);
        editor.createDecorationsCollection([
          {
            range,
            options: {
              after: {
                content: placeholder,
              },
            },
          },
        ]);
      } catch (error) {
        console.warn('设置占位符失败:', error);
      }
    }

    // 调用外部挂载回调
    onMount?.(editor);
  }, [placeholder, value, onMount]);

  // 代码变化回调
  const handleEditorChange: OnChange = useCallback((value: string | undefined) => {
    setCurrentValue(value || '');
    onChange?.(value);
  }, [onChange]);

  // 验证回调
  const handleEditorValidation: OnValidate = useCallback((markers: editor.IMarker[]) => {
    onValidate?.(markers);
  }, [onValidate]);

  // 监听外部值变化
  useEffect(() => {
    if (value !== currentValue && editorRef.current) {
      const currentEditorValue = editorRef.current.getValue();
      if (value !== currentEditorValue) {
        editorRef.current.setValue(value);
        setCurrentValue(value);
      }
    }
  }, [value, currentValue]);

  // 监听语言变化
  useEffect(() => {
    if (language !== currentLanguage) {
      setCurrentLanguage(language);
    }
  }, [language, currentLanguage]);

  // 监听主题变化
  useEffect(() => {
    if (theme !== currentTheme) {
      setCurrentTheme(theme);
    }
  }, [theme, currentTheme]);

  // 监听只读状态变化
  useEffect(() => {
    if (readOnly !== isReadOnly) {
      setIsReadOnly(readOnly);
    }
  }, [readOnly, isReadOnly]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);

  return (
    <div 
      className={`code-editor-container ${className} ${isReadOnly ? 'readonly' : ''}`}
      style={style}
    >
      <Editor
        height={height}
        width={width}
        language={currentLanguage}
        theme={currentTheme}
        value={currentValue}
        options={mergedOptions}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        onValidate={handleEditorValidation}
      />
    </div>
  );
};

export default CodeEditor;
