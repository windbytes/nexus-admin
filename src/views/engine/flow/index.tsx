import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useParams } from '@tanstack/react-router';
import { Spin } from 'antd';
import { useMemo, useState } from 'react';
import { LeftSidebar } from './components/LeftSidebar';
import { PropertyPanel } from './components/PropertyPanel';
import { TopBar } from './components/TopBar';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { useFlowId } from './hooks/useFlowId';
import { useWorkflowHandlers } from './hooks/useWorkflowHandlers';
import { useWorkflowConfigQuery, useWorkflowConfigSync, useWorkflowRunStatusQuery } from './hooks/useWorkflowQueries';
import { registerBuiltinNodePlugins } from './plugin/nodes';
import { buildNodeTypes } from './utils/nodeTypes';
import './workflow.scss';

// 模块加载时即注册内置节点插件，保证 useMemo(buildNodeTypes) 首次执行时能拿到所有插件
registerBuiltinNodePlugins();

/**
 * 流程编排页：基于 appId 拉取节点/边配置与运行状态，解析 flowId 后用于草稿/发布/版本/路由接口
 */
const Workflow: React.FC = () => {
  const { appId } = useParams({ strict: false });
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const { flowId, isLoading: flowIdLoading } = useFlowId(appId);
  const {
    propertyPanelOpen,
    setPropertyPanelOpen,
    checklistCount,
    handleAddNode,
    handleImportDSL,
    handleExportDSL,
    handlePreview,
    handleSave,
    handlePublish,
    handleAddComment,
    handleRun,
  } = useWorkflowHandlers(appId, flowId);

  useWorkflowConfigSync(flowId);
  const { isLoading: configLoading } = useWorkflowConfigQuery(flowId);
  const { data: runStatus } = useWorkflowRunStatusQuery(flowId);

  const nodeTypes = useMemo(() => buildNodeTypes(), []);

  return (
    <ReactFlowProvider>
      <div className="workflow-feature-overview workflow-layout">
        <div className="workflow-body">
          <LeftSidebar
            onAddNode={handleAddNode}
            onAddComment={handleAddComment}
            onRun={handleRun}
            onImportDSL={handleImportDSL}
            onExportDSL={handleExportDSL}
          />
          <div className="workflow-canvas-wrap">
            <div className="workflow-top-bar-float">
              <TopBar
                appId={appId}
                onPreview={handlePreview}
                onSave={handleSave}
                onPublish={handlePublish}
                onOpenVersionHistory={() => setVersionHistoryOpen(true)}
                checklistCount={checklistCount}
                runStatus={runStatus ?? null}
              />
            </div>
            {(configLoading || flowIdLoading) && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  background: 'rgba(255,255,255,0.8)',
                }}
              >
                <Spin size="large" description="加载流程配置..." />
              </div>
            )}
            <WorkflowCanvas nodeTypes={nodeTypes} onOpenPropertyPanel={() => setPropertyPanelOpen(true)} />
          </div>
          <PropertyPanel open={propertyPanelOpen} onClose={() => setPropertyPanelOpen(false)} width={320} />
        </div>
      </div>
      {flowId && (
        <VersionHistoryModal
          open={versionHistoryOpen}
          onClose={() => setVersionHistoryOpen(false)}
          flowId={flowId}
        />
      )}
    </ReactFlowProvider>
  );
};

export default Workflow;
