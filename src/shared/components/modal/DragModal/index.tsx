import { Modal, type ModalProps } from 'antd';
import { useRef, useState } from 'react';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';

/**
 * 可拖拽的 Ant Design Modal 封装。
 *
 * 在标题栏按住鼠标可拖动整个弹窗；默认遮罩不可点击关闭（`mask.closable = false`），
 * 其余行为与 antd `Modal` 一致，可通过 props 覆盖。
 *
 * @param props - antd {@link ModalProps}，原样透传（`title` / `modalRender` 会被本组件接管后合并）
 * @returns 可拖拽弹窗 React 元素
 *
 * @example
 * ```tsx
 * <DragModal title="编辑菜单" open={open} onCancel={onClose} onOk={onSubmit}>
 *   <Form>...</Form>
 * </DragModal>
 * ```
 */
function DragModal(props: ModalProps) {
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const draggleRef = useRef<HTMLDivElement>(null);

  /**
   * 拖拽开始时根据视口与弹窗位置计算拖拽边界，防止拖出屏幕。
   *
   * @param _event - 拖拽事件（未使用）
   * @param uiData - react-draggable 提供的当前位置数据
   */
  function onStart(_event: DraggableEvent, uiData: DraggableData) {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  }

  return (
    <Modal
      mask={{ closable: false }}
      {...props}
      title={
        <div
          className="w-full cursor-move"
          onMouseOver={() => {
            if (disabled) {
              setDisabled(false);
            }
          }}
          onMouseOut={() => {
            setDisabled(true);
          }}
          onFocus={() => {}}
          onBlur={() => {}}
        >
          {props.title}
        </div>
      }
      modalRender={(modal) => (
        <Draggable
          disabled={disabled}
          bounds={bounds}
          nodeRef={draggleRef}
          onStart={(event, uiData) => onStart(event, uiData)}
        >
          <div ref={draggleRef}>{modal}</div>
        </Draggable>
      )}
    />
  );
}

export default DragModal;
