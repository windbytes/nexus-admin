import cn from '@/utils/classnames';
import { Popover } from 'antd';
import { cloneElement, useRef, useState, type ReactElement, type ReactNode } from 'react';

/**
 * 通用气泡卡片（使用 antd 的 Popover 实现）
 */
const CustomPopover: React.FC<CustomPopoverProps> = ({
  trigger = 'hover',
  position = 'bottom',
  htmlContent,
  popupClassName,
  btnElement,
  className,
  btnClassName,
  manualClose,
  disabled = false,
}) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const visibleRef = useRef(false);
  const [visible, setVisible] = useState(false);

  const handleMouseEnter = () => {
    if (trigger !== 'hover') return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    visibleRef.current = true;
    setVisible(true);
  };

  /**
   * 鼠标离开时的处理函数
   * @returns 鼠标离开时的处理函数
   */
  const handleMouseLeave = () => {
    if (trigger !== 'hover') return;
    timeoutRef.current = setTimeout(() => {
      visibleRef.current = false;
      setVisible(false);
    }, timeoutDuration);
  };

  const contentNode = htmlContent
    ? cloneElement(htmlContent, {
        onClose: () => setVisible(false),
        ...(manualClose
          ? {
              onClick: () => setVisible(false),
            }
          : {}),
      })
    : null;

  const triggerNode = (
    <div
      ref={buttonRef}
      className={cn(
        'group inline-flex items-center rounded-lg border border-[#10182824] bg-white px-3 py-2 text-base font-medium hover:border-[#10182833] hover:bg-[#f9fafb] focus:outline-none',
        btnClassName && typeof btnClassName === 'string' && btnClassName,
        btnClassName && typeof btnClassName !== 'string' && btnClassName?.(visible)
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {btnElement}
    </div>
  );

  return (
    <Popover
      classNames={{
        root: cn(
          'w-fit min-w-[130px] overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5',
          popupClassName,
          className
        ),
      }}
      content={
        contentNode && (
          <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {contentNode}
          </div>
        )
      }
      trigger={trigger === 'hover' ? 'hover' : 'click'}
      placement={positionMap[position]}
      open={trigger === 'hover' ? visible : undefined}
      onOpenChange={(open) => {
        if (disabled) return;
        setVisible(open);
        visibleRef.current = open;
      }}
      destroyOnHidden
    >
      {triggerNode}
    </Popover>
  );
};

export default CustomPopover;

const timeoutDuration = 100;

const positionMap: Record<NonNullable<CustomPopoverProps['position']>, 'bottom' | 'bottomLeft' | 'bottomRight'> = {
  bottom: 'bottom',
  bl: 'bottomLeft',
  br: 'bottomRight',
};

/**
 * 通用气泡卡片属性
 */
type CustomPopoverProps = {
  className?: string;
  htmlContent?: ReactElement<HtmlContentProps>;
  popupClassName?: string;
  trigger?: 'click' | 'hover';
  position?: 'bottom' | 'br' | 'bl';
  btnElement?: ReactNode;
  btnClassName?: string | ((open: boolean) => string);
  manualClose?: boolean;
  disabled?: boolean;
};

// popover内容组件的 props（传递给 cloneElement 的）
export type HtmlContentProps = {
  onClose?: () => void;
  onClick?: () => void;
};
