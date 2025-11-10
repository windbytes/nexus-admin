import type { LineRenderProps } from '@flowgram.ai/free-lines-plugin';
import type React from 'react';
import { IconPlusCircle } from './button';
import { useVisible } from './use-visible';

/**
 * 连线上的+号按钮（一般用于在线条中间添加过程）
 * @param props
 * @returns
 */
export const LineAddButton: React.FC<LineRenderProps> = (props) => {
  const { line, selected, hovered, color } = props;
  const visible = useVisible({ line, selected, hovered });

  /**
   * 连接线上的图标点击
   */
  const onClick = () => {};
  if (!visible) {
    return <></>;
  }
  return (
    <div
      className="line-add-button"
      style={{ left: '50%', top: '50%', color }}
      data-testid="sdk.workflow.canvas.line.add"
      data-line-id={line.id}
      onClick={onClick}
    >
      <IconPlusCircle />
    </div>
  );
};
