import { Skeleton } from 'antd';

/**
 * 节点渲染面板前的占位
 * @returns
 */
export const NodePlaceholder = () => {
  return (
    <div className="node-placeholder" data-testid="workflow.detail.node-panel.placeholder">
      <Skeleton className="node-placeholder-skeleton" active avatar loading paragraph={{ rows: 2 }} />
    </div>
  );
};
