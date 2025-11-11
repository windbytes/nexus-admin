import { usePreferencesStore } from '@/stores/store';
import {
  EditorRenderer,
  FreeLayoutEditorProvider,
  FreeLayoutPluginContext,
  type WorkflowJSON,
} from '@flowgram.ai/free-layout-editor';
import '@flowgram.ai/free-layout-editor/index.css';
import { useParams } from '@tanstack/react-router';
import { useCallback, useEffect, useRef } from 'react';
import { useEditorProps } from './hooks/useEditorProps';
import { initialData } from './init-data';
import { nodeRegistries } from './nodes';
import BottomToolbar from './tools/BottomToolbar';
import LeftToolbar from './tools/LeftToolbar';
import TopToolbar from './tools/TopToolbar';
import './workflow.scss';

/**
 * 流程编辑器
 * @returns
 */
const Workflow: React.FC = () => {
  const ref = useRef<FreeLayoutPluginContext | null>(null);
  // 当前应用ID
  const { appId } = useParams({ from: '/_authenticated/integrated/app/$appId/workflow' });
  // 获取主题配置
  const colorPrimary = usePreferencesStore((state) => state.preferences.theme.colorPrimary);

  // 处理保存流程数据
  const handleSave = useCallback((data: WorkflowJSON) => {
    // 保存数据前需要先进行验证和处理
    // TODO: 保存流程数据
    console.log('Saving workflow data...', data);
  }, []);

  // 定义流程编辑器属性
  const editorProps = useEditorProps(initialData, nodeRegistries, handleSave);

  useEffect(() => {
    // 监听主题变化
    document.documentElement.style.setProperty('--g-workflow-line-color-flowing', colorPrimary);
    document.documentElement.style.setProperty('--g-workflow-port-color-secondary', colorPrimary);
  }, [colorPrimary]);

  return (
    <div className="workflow-feature-overview -m-2">
      <FreeLayoutEditorProvider ref={ref} {...editorProps}>
        {/* 顶部工具栏 */}
        <TopToolbar appId={appId} />

        {/* 左侧工具栏 */}
        <LeftToolbar />

        {/* 底部工具栏 */}
        <BottomToolbar />

        {/* 画布区域 */}
        <div className="workflow-container">
          <EditorRenderer className="workflow-editor" />
        </div>
      </FreeLayoutEditorProvider>
    </div>
  );
};

export default Workflow;
