import { PlusCircleFilled } from '@ant-design/icons';
import type { HandleProps } from '@xyflow/react';
import { Handle } from '@xyflow/react';
import { theme } from 'antd';
import type { CSSProperties, FC } from 'react';

export type FlowHandleProps = HandleProps & {
  /**
   * 点击/拖拽命中区域尺寸（px）。建议略大于图标，便于操作。
   */
  hitSize?: number;
  /**
   * 图标尺寸（px）。
   */
  iconSize?: number;
  /**
   * hover 时图标放大倍数。
   */
  hoverScale?: number;
};

export const FlowHandle: FC<FlowHandleProps> = ({
  hitSize = 26,
  iconSize = 12,
  hoverScale = 1.8,
  style,
  className,
  ...props
}) => {
  const { token } = theme.useToken();

  return (
    <Handle
      {...props}
      className={['group', className].filter(Boolean).join(' ')}
      style={{
        width: hitSize,
        height: hitSize,
        border: 'none',
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'crosshair',
        ...style,
      }}
    >
      <PlusCircleFilled
        className="transition-transform duration-150 ease-out group-hover:scale-[var(--flow-handle-hover-scale)]"
        style={
          {
            fontSize: iconSize,
            color: token.colorPrimary,
            ['--flow-handle-hover-scale' as string]: hoverScale,
          } as CSSProperties
        }
      />
    </Handle>
  );
};
