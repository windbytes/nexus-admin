/**
 * 左侧工具栏组件
 * 固定顺序：添加节点 → 添加注释 → 整理节点 → 更多操作
 */
import { ApartmentOutlined, CommentOutlined, EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import { useReactFlow } from '@xyflow/react';
import { Button, Popover } from 'antd';
import { useCallback, useState } from 'react';
import type { WorkflowNodePlugin } from '../plugin/types';
import { ExportImagePanel } from './ExportImagePanel';
import { NodeListPanel } from './NodeListPanel';

/** 左侧边栏 Props */
interface LeftSidebarProps {
  /** 添加节点回调 */
  onAddNode: (plugin: WorkflowNodePlugin) => void;
  /** 添加注释回调 */
  onAddComment?: () => void;
  /** 运行回调 */
  onRun?: () => void;
  /** 导入 DSL 回调 */
  onImportDSL?: () => void;
  /** 导出 DSL 回调 */
  onExportDSL?: () => void;
  /** 打开「添加节点」面板时触发（用于关闭画布右键菜单等） */
  onAddNodePanelOpen?: () => void;
}

/**
 * 左侧工具栏：添加节点 Popover、添加注释、整理节点、更多操作（导出图片）
 */
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
          onOpenChange={(open) => {
            if (open) {
              props.onAddNodePanelOpen?.();
            }
            setNodePanelOpen(open);
          }}
          placement="right"
        >
          <Button type="text" icon={<PlusOutlined />} title="添加节点" />
        </Popover>

        {/* 2. 添加注释 */}
        <Button type="text" icon={<CommentOutlined />} title="添加注释" onClick={props.onAddComment} />

        {/* 3. 整理节点：fitView 使画布适配所有节点 */}
        <Button type="text" icon={<ApartmentOutlined />} title="整理节点" onClick={handleArrangeNodes} />

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
