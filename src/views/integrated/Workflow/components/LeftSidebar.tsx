/**
 * 左侧边栏：图标栏 + 添加节点/操作浮层
 */
import { CodeOutlined, FolderOutlined, SettingOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Button, Popover } from 'antd';
import { useState } from 'react';
import type { WorkflowNodePlugin } from '../plugin/types';
import { NodeListPanel } from './NodeListPanel';

interface LeftSidebarProps {
  onAddNode: (plugin: WorkflowNodePlugin) => void;
  onAddComment?: () => void;
  onRun?: () => void;
  onImportDSL?: () => void;
  onExportDSL?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = (props) => {
  const [nodePanelOpen, setNodePanelOpen] = useState(false);

  const content = (
    <NodeListPanel
      onAddNode={(plugin) => {
        props.onAddNode(plugin);
        setNodePanelOpen(false);
      }}
      onAddComment={props.onAddComment}
      onRun={props.onRun}
      onImportDSL={props.onImportDSL}
      onExportDSL={props.onExportDSL}
    />
  );

  return (
    <div className="workflow-left-sidebar" style={{ display: 'flex', alignItems: 'stretch' }}>
      <div
        style={{
          width: 56,
          paddingTop: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          borderRight: '1px solid #f0f0f0',
          background: '#fafafa',
        }}
      >
        <Popover
          content={content}
          title={null}
          trigger="click"
          open={nodePanelOpen}
          onOpenChange={setNodePanelOpen}
          placement="right"
        >
          <Button type="text" icon={<UnorderedListOutlined style={{ fontSize: 20 }} />} title="添加节点" />
        </Popover>
        <Button type="text" icon={<FolderOutlined style={{ fontSize: 18 }} />} title="文件夹" />
        <Button type="text" icon={<CodeOutlined style={{ fontSize: 18 }} />} title="代码" />
        <div style={{ flex: 1 }} />
        <Button type="text" icon={<SettingOutlined style={{ fontSize: 18 }} />} title="设置" />
      </div>
    </div>
  );
};
