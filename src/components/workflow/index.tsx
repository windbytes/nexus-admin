import { useEditorProps } from '@/hooks/workflow/use-editor-props';
import { DownOutlined, HistoryOutlined, OrderedListOutlined } from '@ant-design/icons';
import {
  EditorRenderer,
  FreeLayoutEditorProvider,
  type FreeLayoutPluginContext,
  type WorkflowJSON,
} from '@flowgram.ai/free-layout-editor';
import '@flowgram.ai/free-layout-editor/index.css';
import { Button, Card, Space } from 'antd';
import { useCallback, useRef } from 'react';
import { initialData } from './init-data';
import ModalRenderer from './node-modal/modal-renderer';
import { NodeModalProvider } from './node-modal/node-modal-provider';
import { nodeRegistries } from './nodes';
import { SidebarProvider } from './sidebar/sidebar-provider';
import SidebarRenderer from './sidebar/sidebar-renderer';
import WorkflowTools from './tools';
import './workflow.scss';

/**
 * 流程编排组件
 */
const Workflow: React.FC<WorkflowProps> = (props) => {
  const ref = useRef<FreeLayoutPluginContext | null>(null);
  // 根据应用ID查询流程数据
  if (props.id) {
    // TODO: 根据应用ID查询流程数据
  }

  // 处理保存流程数据
  const handleSave = useCallback((data: WorkflowJSON) => {
    // 保存数据前需要先进行验证和处理
    // TODO: 保存流程数据
    console.log('Saving workflow data...', data);
  }, []);

  // 定义流程编辑器属性
  const editorProps = useEditorProps(initialData, nodeRegistries, handleSave);

  // 保存按钮点击
  const handleSaveClick = () => {
    if (ref.current) {
      const data = ref.current.document.toJSON();
      handleSave(data);
    }
  };

  return (
    <>
      {/* 左边可收缩部分 */}
      <Card
        className="w-[300px] h-auto absolute! z-20 right-8 top-4"
        classNames={{ body: 'w-full h-full p-2! flex flex-col' }}
      >
        <Space>
          <Button size="small" icon={<OrderedListOutlined />} />
          <Button type="primary" size="small" onClick={handleSaveClick}>
            保存
          </Button>
          <Button type="primary" size="small" icon={<DownOutlined />}>
            发布
          </Button>
          <Button size="small" icon={<HistoryOutlined />}></Button>
        </Space>
      </Card>
      {/* 右边设计部分 */}
      <div className="workflow-feature-overview">
        <FreeLayoutEditorProvider ref={ref} {...editorProps}>
          <SidebarProvider>
            <NodeModalProvider>
              <div className="workflow-container">
                <EditorRenderer className="workflow-editor" />
              </div>
              {/* 工具栏 */}
              <WorkflowTools />
              {/* 侧边栏 */}
              <SidebarRenderer />
              {/* 弹窗 */}
              <ModalRenderer />
            </NodeModalProvider>
          </SidebarProvider>
        </FreeLayoutEditorProvider>
      </div>
    </>
  );
};

export default Workflow;

/**
 * 定义流程组件的属性
 */
export interface WorkflowProps {
  // 应用ID
  id: string | undefined;
}
