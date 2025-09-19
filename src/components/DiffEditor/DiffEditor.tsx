import { forwardRef, useImperativeHandle, useRef, useCallback, useEffect, useState } from 'react';
import type { editor } from 'monaco-editor';
import { DiffEditor } from '@monaco-editor/react';
import type { DiffEditorProps, DiffEditorRef, DiffStatistics } from './types';
import './index.scss';

/**
 * 差异编辑器组件
 * @param props 组件属性
 * @param ref 组件引用
 * @returns 差异编辑器组件
 */
const DiffEditorComponent = forwardRef<DiffEditorRef, DiffEditorProps>(
  (
    {
      original = '',
      modified = '',
      language = 'json',
      theme = 'vs',
      readOnly = true,
      showLineNumbers = true,
      showMinimap = false,
      wordWrap = 'off',
      fontSize = 14,
      fontFamily = 'Consolas, "Courier New", monospace',
      lineHeight = 20,
      bracketPairColorization = true,
      guides = { indentation: true, bracketPairs: true },
      height = '400px',
      width = '100%',
      renderSideBySide = true,
      enableSplitViewResizing = true,
      ignoreTrimWhitespace = false,
      showOriginal: _showOriginal = true,
      showModified: _showModified = true,
      originalTitle = '原始版本',
      modifiedTitle = '修改版本',
      onMount,
      options = {},
      className = '',
      style = {},
    },
    ref,
  ) => {
    const diffEditorRef = useRef<editor.IStandaloneDiffEditor | null>(null);
    const [, setIsEditorReady] = useState(false);
    const [currentOriginal, setCurrentOriginal] = useState(original);
    const [currentModified, setCurrentModified] = useState(modified);
    const [currentLanguage, setCurrentLanguage] = useState(language);
    const [currentTheme, setCurrentTheme] = useState(theme);
    const [isReadOnly, setIsReadOnly] = useState(readOnly);

    // 默认配置选项
    const defaultOptions: editor.IDiffEditorConstructionOptions = {
      minimap: { enabled: showMinimap },
      lineNumbers: showLineNumbers ? 'on' : 'off',
      wordWrap: wordWrap,
      fontSize: fontSize,
      fontFamily: fontFamily,
      lineHeight: lineHeight,
      bracketPairColorization: { enabled: bracketPairColorization },
      guides: {
        indentation: guides.indentation,
        bracketPairs: guides.bracketPairs,
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
      readOnly: isReadOnly,
      renderSideBySide: renderSideBySide,
      enableSplitViewResizing: enableSplitViewResizing,
      ignoreTrimWhitespace: ignoreTrimWhitespace,
      originalEditable: false,
      originalAriaLabel: originalTitle,
      modifiedAriaLabel: modifiedTitle,
    };

    // 合并配置选项
    const mergedOptions: editor.IDiffEditorConstructionOptions = {
      ...defaultOptions,
      ...options,
    };

    // 暴露编辑器方法给父组件
    useImperativeHandle(
      ref,
      () => ({
        getEditor: () => diffEditorRef.current,

        getOriginalEditor: () => {
          return diffEditorRef.current?.getOriginalEditor() || null;
        },

        getModifiedEditor: () => {
          return diffEditorRef.current?.getModifiedEditor() || null;
        },

        getOriginalValue: () => {
          return diffEditorRef.current?.getOriginalEditor().getValue() || '';
        },

        getModifiedValue: () => {
          return diffEditorRef.current?.getModifiedEditor().getValue() || '';
        },

        setOriginalValue: (value: string) => {
          if (diffEditorRef.current) {
            diffEditorRef.current.getOriginalEditor().setValue(value);
            setCurrentOriginal(value);
          }
        },

        setModifiedValue: (value: string) => {
          if (diffEditorRef.current) {
            diffEditorRef.current.getModifiedEditor().setValue(value);
            setCurrentModified(value);
          }
        },

        setDiff: (original: string, modified: string) => {
          if (diffEditorRef.current) {
            diffEditorRef.current.getOriginalEditor().setValue(original);
            diffEditorRef.current.getModifiedEditor().setValue(modified);
            setCurrentOriginal(original);
            setCurrentModified(modified);
          }
        },

        getDiffStatistics: (): DiffStatistics => {
          if (!diffEditorRef.current) {
            return {
              totalChanges: 0,
              insertions: 0,
              deletions: 0,
              modifications: 0,
            };
          }

          const diffs = diffEditorRef.current.getLineChanges();
          let insertions = 0;
          let deletions = 0;
          let modifications = 0;

          diffs?.forEach((diff) => {
            if (diff.originalEndLineNumber === 0) {
              // 新增
              insertions += diff.modifiedEndLineNumber - diff.modifiedStartLineNumber + 1;
            } else if (diff.modifiedEndLineNumber === 0) {
              // 删除
              deletions += diff.originalEndLineNumber - diff.originalStartLineNumber + 1;
            } else {
              // 修改
              modifications += Math.max(
                diff.originalEndLineNumber - diff.originalStartLineNumber + 1,
                diff.modifiedEndLineNumber - diff.modifiedStartLineNumber + 1,
              );
            }
          });

          return {
            totalChanges: insertions + deletions + modifications,
            insertions,
            deletions,
            modifications,
          };
        },

        goToNextDiff: () => {
          if (diffEditorRef.current) {
            const action = diffEditorRef.current.getOriginalEditor().getAction('editor.action.diffReview.next');
            if (action) {
              action.run();
            }
          }
        },

        goToPreviousDiff: () => {
          if (diffEditorRef.current) {
            const action = diffEditorRef.current.getOriginalEditor().getAction('editor.action.diffReview.prev');
            if (action) {
              action.run();
            }
          }
        },

        goToDiff: (index: number) => {
          if (diffEditorRef.current) {
            const diffs = diffEditorRef.current.getLineChanges();
            if (diffs?.[index]) {
              const diff = diffs[index];
              diffEditorRef.current.getModifiedEditor().revealLineInCenter(diff.modifiedStartLineNumber);
              diffEditorRef.current.getModifiedEditor().setPosition({
                lineNumber: diff.modifiedStartLineNumber,
                column: 1,
              });
            }
          }
        },

        getDiffs: () => {
          return diffEditorRef.current?.getLineChanges() || [];
        },

        focus: () => {
          if (diffEditorRef.current) {
            diffEditorRef.current.focus();
          }
        },

        blur: () => {
          if (diffEditorRef.current) {
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
          if (diffEditorRef.current) {
            diffEditorRef.current.updateOptions({
              originalEditable: false,
            });
          }
        },

        getLanguage: () => {
          return currentLanguage;
        },

        setLanguage: (language: string) => {
          setCurrentLanguage(language as any);
        },

        getTheme: () => {
          return currentTheme;
        },

        setTheme: (theme: string) => {
          setCurrentTheme(theme as any);
        },

        updateOptions: (options: editor.IDiffEditorConstructionOptions) => {
          if (diffEditorRef.current) {
            diffEditorRef.current.updateOptions(options);
          }
        },

        recomputeDiff: () => {
          if (diffEditorRef.current) {
            diffEditorRef.current.revealLine(1);
          }
        },
      }),
      [isReadOnly, currentLanguage, currentTheme],
    );

    // 编辑器挂载完成回调
    const handleEditorDidMount = useCallback(
      (editor: editor.IStandaloneDiffEditor) => {
        diffEditorRef.current = editor;
        setIsEditorReady(true);

        // 设置标题
        if (originalTitle) {
          editor.getOriginalEditor().updateOptions({
            ariaLabel: originalTitle,
          });
        }

        if (modifiedTitle) {
          editor.getModifiedEditor().updateOptions({
            ariaLabel: modifiedTitle,
          });
        }

        // 调用外部挂载回调
        onMount?.(editor);
      },
      [originalTitle, modifiedTitle, onMount],
    );

    // 监听外部值变化
    useEffect(() => {
      if (original !== currentOriginal && diffEditorRef.current) {
        const currentValue = diffEditorRef.current.getOriginalEditor().getValue();
        if (original !== currentValue) {
          diffEditorRef.current.getOriginalEditor().setValue(original);
          setCurrentOriginal(original);
        }
      }
    }, [original, currentOriginal]);

    useEffect(() => {
      if (modified !== currentModified && diffEditorRef.current) {
        const currentValue = diffEditorRef.current.getModifiedEditor().getValue();
        if (modified !== currentValue) {
          diffEditorRef.current.getModifiedEditor().setValue(modified);
          setCurrentModified(modified);
        }
      }
    }, [modified, currentModified]);

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
        if (diffEditorRef.current) {
          diffEditorRef.current.dispose();
        }
      };
    }, []);

    return (
      <div className={`diff-editor-container ${className} ${isReadOnly ? 'readonly' : ''}`} style={style}>
        <DiffEditor
          height={height}
          width={width}
          language={currentLanguage}
          theme={currentTheme}
          original={currentOriginal}
          modified={currentModified}
          options={mergedOptions}
          onMount={handleEditorDidMount}
        />
      </div>
    );
  },
);

DiffEditorComponent.displayName = 'DiffEditor';

export default DiffEditorComponent;
