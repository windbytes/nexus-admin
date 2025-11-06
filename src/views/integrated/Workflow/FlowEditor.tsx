import { usePreferencesStore } from '@/stores/store';
import { FreeLayoutEditorProvider } from '@flowgram.ai/free-layout-editor';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useEffect } from 'react';

/**
 * 流程编辑器
 * @returns
 */
const WorkflowEditor: React.FC = () => {
  // 获取主题配置
  const colorPrimary = usePreferencesStore((state) => state.preferences.theme.colorPrimary);
  // 获取路由参数（应用ID）
  const appId = useParams({ from: '/_authenticated/integrated/app/$appId/workflow' });

  // 路由跳转
  const navigate = useNavigate();

  useEffect(() => {
    // 监听主题变化
    document.documentElement.style.setProperty('--g-workflow-line-color-flowing', colorPrimary);
    document.documentElement.style.setProperty('--g-workflow-port-color-secondary', colorPrimary);
  }, [colorPrimary]);

  const redirectApps = () => {
    navigate({ to: '/integrated/apps' });
  };

  return (
    <FreeLayoutEditorProvider>
      <div className="workflow-container relative h-full w-full min-w-[960px] min-h-[600px]">
        {/* 左边工具栏 */}
        <div className="absolute pointer-events-none left-0 top-0 z-10 flex w-12 items-center justify-center p-1 pl-2">
          <div className="pointer-events-auto flex flex-col items-center rounded-lg border-[0.5px] bg-white p-0.5 text-gray-300 shadow-lg">
            左侧工具栏
          </div>
        </div>
        {/* 底部工具栏 */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-1 w-auto">撤销、重做（变更历史）、缩略图</div>
        {/* 顶部工具栏 */}
        <div className="absolute top-7 left-0 right-0 z-10 px-3 h-0 w-full items-center justify-center">
          自动保存提示+操作按钮+历史记录（版本历史）
        </div>
        {/* 画布 */}
        <div className="workflow-canvas relative w-full h-full overflow-hidden z-0">这里显示画布，流程ID {appId}</div>
      </div>
    </FreeLayoutEditorProvider>
  );
};

export default WorkflowEditor;
