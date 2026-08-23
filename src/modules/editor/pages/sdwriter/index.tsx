import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons';
import { App, Button } from 'antd';
import type { Key } from 'react';
import { useState } from 'react';
import { registerToolbarPlaceholderCommands } from './commands/toolbarCommands';
import EditorCanvas from './components/EditorCanvas';
import StatusBar from './components/StatusBar';
import TabToolbar from './components/TabToolbar';
import TemplateTree from './components/TemplateTree';
import { tabToolbarConfig } from './config/tabToolbarConfig';
import { templateTreeData } from './config/templateTreeData';
import { EditorProvider, useEditorContext } from './core/EditorProvider';
import { executeCommand } from './core/extension';
import { registerBuiltinPlugins } from './plugins';
import type { TemplateTreeNode } from './types';

/** 在模块加载时注册内置插件与工具栏占位命令 */
registerBuiltinPlugins();
registerToolbarPlaceholderCommands();

/**
 * SD Writer 编辑器主体（在 EditorProvider 内使用，可消费 useEditorContext）
 */
const SdWriterContent: React.FC = () => {
  const { modal } = App.useApp();
  const editor = useEditorContext();
  const [selectedTreeKeys, setSelectedTreeKeys] = useState<Key[]>([]);
  const {
    scale,
    setScale,
    editorMode,
    setEditorMode,
    activeTabKey,
    setActiveTabKey,
    sidebarCollapsed,
    setSidebarCollapsed,
  } = editor;

  const handleTreeSelect = (selectedKeys: Key[], info: { node: TemplateTreeNode }) => {
    setSelectedTreeKeys(selectedKeys);
    if (info.node.isTemplate) {
      // 可选：加载对应模板到编辑区
    }
  };

  return (
    <div className="flex h-full bg-gray-100">
      {sidebarCollapsed ? (
        <div className="flex h-full w-8 shrink-0 items-center justify-center border-r border-gray-200 bg-white">
          <Button
            type="text"
            size="small"
            className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 bg-gray-50/95 p-0 text-gray-500 shadow-sm hover:bg-gray-200 hover:text-gray-700"
            title="展开病历树"
            icon={<DoubleRightOutlined />}
            onClick={() => setSidebarCollapsed(false)}
          />
        </div>
      ) : (
        <div className="relative h-full w-56 shrink-0 border-r border-gray-200 bg-white">
          <aside className="h-full overflow-auto">
            <TemplateTree treeData={templateTreeData} selectedKeys={selectedTreeKeys} onSelect={handleTreeSelect} />
          </aside>
          <div className="absolute bottom-0 right-0 top-0 flex w-6 shrink-0 flex-col justify-center">
            <Button
              type="text"
              size="small"
              className="flex h-8 w-6 items-center justify-center self-center rounded-l border border-r-0 border-gray-200 bg-gray-50/95 p-0 text-gray-500 shadow-sm hover:bg-gray-200 hover:text-gray-700"
              title="收缩病历树"
              icon={<DoubleLeftOutlined />}
              onClick={() => setSidebarCollapsed(true)}
            />
          </div>
        </div>
      )}

      <main className="flex flex-1 flex-col min-w-0">
        <TabToolbar
          config={tabToolbarConfig}
          activeTabKey={activeTabKey}
          onTabChange={setActiveTabKey}
          onToolClick={(_tabKey, _toolKey) => {
            modal.warning({
              title: '功能开发中',
              content: '敬请期待。',
            });
          }}
          onFileMenuClick={(key) => {
            executeCommand('file.openMenu', key).catch(() => {});
          }}
          onLeftQuickActionClick={(_key) => {
            modal.warning({
              title: '功能开发中',
              content: `敬请期待。操作key：${_key}`,
            });
          }}
          onUploadClick={() => {
            modal.warning({
              title: '功能开发中',
              content: '敬请期待。',
            });
          }}
          onShareClick={() => {
            modal.warning({
              title: '功能开发中',
              content: '敬请期待。',
            });
          }}
          uploadLabel="未上云"
        />
        <EditorCanvas className="min-h-0" scale={scale} />
        <StatusBar
          scale={scale}
          onScaleChange={setScale}
          mode={editorMode}
          onModeChange={setEditorMode}
          onFullscreen={() => {
            // 占位：后续对接全屏
          }}
        />
      </main>
    </div>
  );
};

/**
 * SD Writer 编辑器页面
 * 路由：/editor/sdwriter（由后端菜单 component=editor/sdwriter 解析）
 */
const SdWriterPage: React.FC = () => (
  <div className="h-full min-h-0">
    <EditorProvider>
      <SdWriterContent />
    </EditorProvider>
  </div>
);

export default SdWriterPage;
