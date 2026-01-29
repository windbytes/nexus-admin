import { DeleteFilled } from '@ant-design/icons';
import type { LineRenderProps } from '@flowgram.ai/free-lines-plugin';
import { Tooltip } from 'antd';
import type React from 'react';
import './index.scss';
import { useVisible } from './use-visible';

/**
 * 连线上的删除按钮（一般用于在线条中间删除过程）
 * @param props
 * @returns
 */
export const LineDeleteButton: React.FC<LineRenderProps> = (props) => {
  const { line, selected, hovered, color } = props;
  const visible = useVisible({ line, selected, hovered });

  /**
   * 连接线上的图标点击
   */
  const onClick = () => {
    line.dispose();
  };
  if (!visible) {
    return <></>;
  }
  return (
    <Tooltip title="删除连线">
      <div
        className="line-delete-button"
        style={{
          transform: `translate(-50%, -50%) translate(${line.center.labelX}px, ${line.center.labelY}px)`,
          color,
        }}
        data-testid="sdk.workflow.canvas.line.delete"
        data-line-id={line.id}
        onClick={onClick}
      >
        <DeleteFilled style={{ color: '#ff4d4f', fontSize: 26 }} />
      </div>
    </Tooltip>
  );
};
