import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Alert, Spin } from 'antd';
import { useEffect, useMemo } from 'react';
import { LeftSidebar } from './components/LeftSidebar';
import { PropertyPanel } from './components/PropertyPanel';
import { TopBar } from './components/TopBar';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { useWorkflowHandlers } from './hooks/useWorkflowHandlers';
import { useWorkflowConfigQuery, useWorkflowConfigSync, useWorkflowRunStatusQuery } from './hooks/useWorkflowQueries';
import { registerBuiltinNodePlugins } from './plugin/nodes';
import { buildNodeTypes } from './utils/nodeTypes';
import './workflow.scss';

/**
 * 流程编排页：基于 appId 拉取节点/边配置与运行状态，组装顶部栏、左侧栏、画布、属性面板
 */
const Workflow: React.FC = () => {
  const {
    appId,
    propertyPanelOpen,
    setPropertyPanelOpen,
    checklistCount,
    handleAddNode,
    handleImportDSL,
    handleExportDSL,
    handlePreview,
    handlePublish,
    handleAddComment,
    handleRun,
  } = useWorkflowHandlers();

  useWorkflowConfigSync(appId);
  const { isLoading: configLoading, isError: configError, error: configErr } = useWorkflowConfigQuery(appId);
  const { data: runStatus } = useWorkflowRunStatusQuery(appId);

  useEffect(() => {
    registerBuiltinNodePlugins();
  }, []);

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
                onPublish={handlePublish}
                checklistCount={checklistCount}
                runStatus={runStatus ?? null}
              />
            </div>
            {configLoading && (
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
            {configError && (
              <Alert
                type="error"
                showIcon
                title="加载失败"
                description={configErr instanceof Error ? configErr.message : '无法获取流程配置'}
                style={{ margin: 16 }}
              />
            )}
            <WorkflowCanvas nodeTypes={nodeTypes} onOpenPropertyPanel={() => setPropertyPanelOpen(true)} />
          </div>
          <PropertyPanel open={propertyPanelOpen} onClose={() => setPropertyPanelOpen(false)} width={320} />
        </div>
      </div>
    </ReactFlowProvider>
  );
};

export default Workflow;
