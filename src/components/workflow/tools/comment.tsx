import {
  delay,
  usePlayground,
  useService,
  WorkflowDocument,
  WorkflowDragService,
  WorkflowSelectService,
} from '@flowgram.ai/free-layout-editor';
import { Button, Tooltip } from 'antd';
import type React from 'react';
import { useCallback, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { IconComment } from '../icons/icon-comment';
import { WorkflowNodeType } from '../nodes/constants';

/**
 * 注释工具
 * @returns
 */
export const Comment: React.FC = () => {
  const { t } = useTranslation();
  const playground = usePlayground();
  const document = useService(WorkflowDocument);
  const selectService = useService(WorkflowSelectService);
  const dragService = useService(WorkflowDragService);

  /**
   * 计算注释的位置
   */
  const calcNodePosition = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      const mousePosition = playground.config.getPosFromMouseEvent(e);
      return {
        x: mousePosition.x,
        y: mousePosition.y - 75,
      };
    },
    [playground]
  );

  /**
   * 创建注释节点
   */
  const createComment = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      const canvasPosition = calcNodePosition(e);
      // 创建节点
      const node = document.createWorkflowNodeByType(WorkflowNodeType.Comment, canvasPosition);
      // 等待节点渲染
      await delay(16);
      // 选中节点
      selectService.selectNode(node);
      // 开始拖拽
      dragService.startDragSelectedNodes(e);
    },
    [calcNodePosition, document, dragService, selectService]
  );

  return (
    <Tooltip title={t('workflow.tools.comment')}>
      <Button type="text" onClick={createComment} icon={<IconComment style={{ width: 16, height: 16 }} />} />
    </Tooltip>
  );
};
