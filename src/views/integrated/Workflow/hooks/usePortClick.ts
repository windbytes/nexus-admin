import { usePlayground, useService, WorkflowDocument, type WorkflowPortEntity } from '@flowgram.ai/free-layout-editor';
import { WorkflowNodePanelService } from '@flowgram.ai/free-node-panel-plugin';
import { useCallback } from 'react';

/**
 * 用于处理端口点击事件
 * 点击端口后唤起节点选择面板
 */
export const usePortClick = () => {
  const playground = usePlayground();
  // 节点窗口管理
  const nodePanelService = useService(WorkflowNodePanelService);
  // 流程数据文档
  const document = useService(WorkflowDocument);
  /**
   * 节点点击
   */
  const onPortClick = useCallback(async (e: React.MouseEvent, port: WorkflowPortEntity) => {
    // 如果端口类型为输入端口，则不处理
    if (port.portType === 'input') {
      return;
    }
    console.log('onPortClick', e, port);
  }, []);
  return onPortClick;
};
