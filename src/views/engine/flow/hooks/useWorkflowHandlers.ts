/**
 * 流程编排页的交互逻辑：添加节点、DSL、保存草稿、发布等
 */
import { useParams } from '@tanstack/react-router';
import { message } from 'antd';
import { useCallback, useState } from 'react';
import { workflowService } from '@/services/integrated/workflow/workflowApi';
import type { WorkflowNodePlugin } from '../plugin/types';
import { useWorkflowStore } from '../store/workflowStore';
import { downloadDSL, importDSLFromFile } from '../utils/dsl';

export function useWorkflowHandlers() {
  const { appId } = useParams({ strict: false });
  const [propertyPanelOpen, setPropertyPanelOpen] = useState(false);
  const [checklistCount] = useState(1);

  const { nodes, setNodes, setLastSavedAt, pushHistory, loadDocument, getDocument } = useWorkflowStore();

  const handleAddNode = useCallback(
    (plugin: WorkflowNodePlugin) => {
      pushHistory();
      const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const newNode = {
        id,
        type: plugin.meta.id,
        position: { x: 120 + nodes.length * 200, y: 100 + (nodes.length % 3) * 120 },
        data: { ...plugin.defaultNodeData },
      };
      setNodes((prev) => [...prev, newNode]);
    },
    [nodes.length, pushHistory, setNodes]
  );

  const handleImportDSL = useCallback(async () => {
    const doc = await importDSLFromFile();
    if (doc) {
      loadDocument(doc);
      message.success('导入成功');
    } else {
      message.error('导入失败或已取消');
    }
  }, [loadDocument]);

  const handleExportDSL = useCallback(() => {
    const doc = getDocument(appId);
    downloadDSL(doc, `workflow-${appId ?? 'export'}.json`);
    message.success('已导出');
  }, [appId, getDocument]);

  const handlePreview = useCallback(() => {
    message.info('预览功能待接入');
  }, []);

  const handleSave = useCallback(async () => {
    if (!appId) {
      message.warning('缺少应用 ID');
      return;
    }
    try {
      const doc = getDocument(appId);
      await workflowService.saveDraft(appId, {
        nodes: doc?.nodes ?? [],
        edges: doc?.edges ?? [],
      });
      setLastSavedAt(new Date().toISOString());
      message.success('草稿已保存');
    } catch (e) {
      message.error('保存失败');
    }
  }, [appId, getDocument, setLastSavedAt]);

  const handlePublish = useCallback(async () => {
    if (!appId) {
      message.warning('缺少应用 ID');
      return;
    }
    try {
      const doc = getDocument(appId);
      await workflowService.saveDraft(appId, {
        nodes: doc?.nodes ?? [],
        edges: doc?.edges ?? [],
      });
      await workflowService.publish(appId);
      setLastSavedAt(new Date().toISOString());
      message.success('发布成功');
    } catch (e) {
      message.error('发布失败');
    }
  }, [appId, getDocument, setLastSavedAt]);

  const handleAddComment = useCallback(() => {
    message.info('添加注释');
  }, []);

  const handleRun = useCallback(() => {
    message.info('运行');
  }, []);

  return {
    appId,
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
  };
}
