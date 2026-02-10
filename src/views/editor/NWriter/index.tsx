import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import type { Key } from 'react';
import { useState } from 'react';
import EditorCanvas from './components/EditorCanvas';
import StatusBar from './components/StatusBar';
import TabToolbar from './components/TabToolbar';
import TemplateTree from './components/TemplateTree';
import { tabToolbarConfig } from './config/tabToolbarConfig';
import { templateTreeData } from './config/templateTreeData';
import type { TemplateTreeNode } from './types';

/**
 * 病历编辑器模块
 * 布局：左侧模板树 + 右侧编辑区（Tab 工具栏 + Canvas 画布 + 状态栏）
 * 技术栈：React 19 + Ant Design + Tailwind CSS
 */
const DocWriter: React.FC = () => {
  const [activeTabKey, setActiveTabKey] = useState<string>(
    tabToolbarConfig.find((t) => t.key !== 'file')?.key ?? 'start'
  );
  const [selectedTreeKeys, setSelectedTreeKeys] = useState<Key[]>([]);
  const [scale, setScale] = useState(1);
  const [editorMode, setEditorMode] = useState('edit');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleTreeSelect = (selectedKeys: Key[], info: { node: TemplateTreeNode }) => {
    setSelectedTreeKeys(selectedKeys);
    if (info.node.isTemplate) {
      // 可选：加载对应模板到编辑区
    }
  };

  return (
    <div className="flex h-full flex-col bg-gray-100">
      <div className="flex flex-1 min-h-0">
        {/* 左侧：展开时显示病历树 + 最右侧中间收缩按钮；收缩时仅显示中间展开按钮 */}
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

        {/* 右侧：编辑区 */}
        <main className="flex flex-1 flex-col min-w-0">
          <TabToolbar
            config={tabToolbarConfig}
            activeTabKey={activeTabKey}
            onTabChange={setActiveTabKey}
            onToolClick={(_tabKey, _toolKey) => {
              // 占位：后续对接具体功能
            }}
            onFileMenuClick={(_key) => {
              // 占位：文件菜单项
            }}
            onLeftQuickActionClick={(_key) => {
              // 占位：左侧快捷按钮
            }}
            onUploadClick={() => {
              // 占位：上传
            }}
            onShareClick={() => {
              // 占位：分享
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
    </div>
  );
};

export default DocWriter;
