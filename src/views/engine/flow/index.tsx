import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useParams } from '@tanstack/react-router';
import { Spin } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LeftSidebar } from './components/LeftSidebar';
import { PropertyPanel } from './components/PropertyPanel';
import { TopBar } from './components/TopBar';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { useFlowId } from './hooks/useFlowId';
import { useWorkflowHandlers } from './hooks/useWorkflowHandlers';
import { useWorkflowConfigQuery, useWorkflowConfigSync, useWorkflowRunStatusQuery } from './hooks/useWorkflowQueries';
import { registerBuiltinNodePlugins } from './plugin/nodes';
import { useWorkflowStore } from './store/workflowStore';
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
  const loadDocument = useWorkflowStore((s) => s.loadDocument);
  const emptyLoadedForAppRef = useRef<string | null>(null);

  // 应用下无流程定义时加载空画布（仅一次），避免显示其他应用的残留内容或重复覆盖未保存编辑
  useEffect(() => {
    if (!flowIdLoading && flowId == null && appId && emptyLoadedForAppRef.current !== appId) {
      loadDocument({
        version: 1,
        nodes: [],
        edges: [],
        meta: { appId, updatedAt: new Date().toISOString() },
      });
      emptyLoadedForAppRef.current = appId;
    }
    if (flowId != null) {
      emptyLoadedForAppRef.current = null;
    }
  }, [flowIdLoading, flowId, appId, loadDocument]);

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
  const drawerContainerRef = useRef<HTMLDivElement>(null);

  return (
    <ReactFlowProvider>
      <div className="workflow-feature-overview workflow-layout">
        <div ref={drawerContainerRef} className="workflow-body">
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
          <PropertyPanel open={propertyPanelOpen} onClose={() => setPropertyPanelOpen(false)} width={420} />
        </div>
      </div>
      {flowId && (
        <VersionHistoryModal open={versionHistoryOpen} onClose={() => setVersionHistoryOpen(false)} flowId={flowId} />
      )}
    </ReactFlowProvider>
  );
};

export default Workflow;
