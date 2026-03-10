/**
 * 左侧边栏：固定顺序为 添加节点 → 添加注释 → 整理节点 → 更多操作
 * 添加节点、更多操作均使用 Popover 浮层；更多操作为导出图片（当前视图 / 整个工作流 × PNG、JPEG、SVG）
 */
import {
  ApartmentOutlined,
  CommentOutlined,
  EllipsisOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useReactFlow } from '@xyflow/react';
import { Button, Popover } from 'antd';
import { useCallback, useState } from 'react';
import type { WorkflowNodePlugin } from '../plugin/types';
import { ExportImagePanel } from './ExportImagePanel';
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
  const [morePanelOpen, setMorePanelOpen] = useState(false);
  const { fitView } = useReactFlow();

  const handleArrangeNodes = useCallback(() => {
    fitView({ padding: 0.2, duration: 200 });
  }, [fitView]);

  return (
    <div
      className="workflow-left-sidebar"
      style={{
        display: 'flex',
        alignItems: 'center',
        position: 'absolute',
        top: '40%',
        left: 10,
        background: '#fff',
        borderRadius: 4,
        zIndex: 10,
        boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {/* 1. 添加节点：Popover 内为节点/工具标签 + 搜索 + 动态节点列表 */}
        <Popover
          content={
            <NodeListPanel
              onAddNode={(plugin) => {
                props.onAddNode(plugin);
                setNodePanelOpen(false);
              }}
            />
          }
          title={null}
          trigger="click"
          open={nodePanelOpen}
          onOpenChange={setNodePanelOpen}
          placement="right"
        >
          <Button type="text" icon={<UnorderedListOutlined />} title="添加节点" />
        </Popover>

        {/* 2. 添加注释 */}
        <Button
          type="text"
          icon={<CommentOutlined />}
          title="添加注释"
          onClick={props.onAddComment}
        />

        {/* 3. 整理节点：fitView 使画布适配所有节点 */}
        <Button
          type="text"
          icon={<ApartmentOutlined />}
          title="整理节点"
          onClick={handleArrangeNodes}
        />

        {/* 4. 更多操作：Popover 内为导出图片（当前视图 / 整个工作流 × PNG、JPEG、SVG） */}
        <Popover
          content={<ExportImagePanel />}
          title={null}
          trigger="click"
          open={morePanelOpen}
          onOpenChange={setMorePanelOpen}
          placement="right"
        >
          <Button type="text" icon={<EllipsisOutlined />} title="更多操作" />
        </Popover>
      </div>
    </div>
  );
};
