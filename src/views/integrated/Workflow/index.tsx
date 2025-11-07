import { usePreferencesStore } from '@/stores/store';
import { FreeLayoutEditorProvider } from '@flowgram.ai/free-layout-editor';
import { useParams } from '@tanstack/react-router';
import { theme } from 'antd';
import { useEffect } from 'react';
import BottomToolbar from './tools/BottomToolbar';
import LeftToolbar from './tools/LeftToolbar';
import TopToolbar from './tools/TopToolbar';
import './workflow.module.scss';

/**
 * 流程编辑器
 * @returns
 */
const Workflow: React.FC = () => {
  const { token } = theme.useToken();
  // 当前应用ID
  const { appId } = useParams({ from: '/integrated/app/$appId/workflow' });
  // 获取主题配置
  const colorPrimary = usePreferencesStore((state) => state.preferences.theme.colorPrimary);

  useEffect(() => {
    // 监听主题变化
    document.documentElement.style.setProperty('--g-workflow-line-color-flowing', colorPrimary);
    document.documentElement.style.setProperty('--g-workflow-port-color-secondary', colorPrimary);
  }, [colorPrimary]);

  return (
    <div className="workflow-container relative w-full h-screen overflow-hidden">
      <FreeLayoutEditorProvider>
        {/* 顶部工具栏 */}
        <TopToolbar />

        {/* 左侧工具栏 */}
        <LeftToolbar />

        {/* 底部工具栏 */}
        <BottomToolbar />

        {/* 画布区域 */}
        <div
          className="absolute top-14 left-0 right-0 bottom-0 z-0"
          style={{
            backgroundColor: token.colorBgLayout,
          }}
        >
          {/* 画布内容暂时为空 */}
          {appId}
        </div>
      </FreeLayoutEditorProvider>
    </div>
  );
};

export default Workflow;
