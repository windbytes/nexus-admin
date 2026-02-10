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
  const [activeTabKey, setActiveTabKey] = useState<string>(tabToolbarConfig[0]?.key ?? 'file');
  const [selectedTreeKeys, setSelectedTreeKeys] = useState<Key[]>([]);
  const [scale] = useState(1);
  const [editorMode, setEditorMode] = useState('edit');

  const handleTreeSelect = (selectedKeys: Key[], info: { node: TemplateTreeNode }) => {
    setSelectedTreeKeys(selectedKeys);
    if (info.node.isTemplate) {
      // 可选：加载对应模板到编辑区
    }
  };

  return (
    <div className="flex h-full flex-col bg-gray-100">
      <div className="flex flex-1 min-h-0">
        {/* 左侧：病历分类与模板树 */}
        <aside className="w-56 shrink-0 border-r border-gray-200 bg-white">
          <TemplateTree treeData={templateTreeData} selectedKeys={selectedTreeKeys} onSelect={handleTreeSelect} />
        </aside>

        {/* 右侧：编辑区 */}
        <main className="flex flex-1 flex-col min-w-0">
          <TabToolbar
            config={tabToolbarConfig}
            activeTabKey={activeTabKey}
            onTabChange={setActiveTabKey}
            onToolClick={(_tabKey, _toolKey) => {
              // 占位：后续对接具体功能
            }}
          />
          <EditorCanvas className="min-h-0" scale={scale} />
          <StatusBar
            scale={scale}
            mode={editorMode}
            onModeChange={setEditorMode}
            onSave={() => {
              // 占位：后续对接保存
            }}
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
