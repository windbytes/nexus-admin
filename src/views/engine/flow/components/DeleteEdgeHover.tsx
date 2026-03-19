import { DeleteFilled } from '@ant-design/icons';
import type { EdgeProps } from '@xyflow/react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import { useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useWorkflowStore } from '@/views/engine/flow/store/workflowStore';

const ICON_SIZE = 16;
const ICON_HIT_SIZE = 24;

export type DeleteEdgeHoverProps = EdgeProps;

export const DeleteEdgeHover = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerStart,
  markerEnd,
  style,
  interactionWidth,
  selected,
}: DeleteEdgeHoverProps) => {
  // edge 的 hover 状态由 ReactFlow 通过 onEdgeMouseEnter/onEdgeMouseLeave 维护
  const { pushHistory, setEdges, hoveredEdgeId, setHoveredEdgeId } = useWorkflowStore(
    useShallow((s) => ({
      pushHistory: s.pushHistory,
      setEdges: s.setEdges,
      hoveredEdgeId: s.hoveredEdgeId,
      setHoveredEdgeId: s.setHoveredEdgeId,
    }))
  );

  // 图标自身 hover：当鼠标从“线条”移到“图标按钮”时，ReactFlow 可能先触发 mouseleave，
  // 所以这里用一个小延迟保证图标在点击区域内不会一闪消失。
  const [iconHovered, setIconHovered] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const scheduleHide = () => {
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => {
      setIconHovered(false);
      hideTimerRef.current = null;
    }, 80);
  };

  const isVisible = Boolean(selected || hoveredEdgeId === id || iconHovered);

  const [edgePath, labelX, labelY] = useMemo(() => {
    const [path, lx, ly] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
    return [path, lx, ly];
  }, [sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition]);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIconHovered(false);
    setHoveredEdgeId(null);
    pushHistory();
    setEdges((prev) => prev.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerStart={markerStart}
        markerEnd={markerEnd}
        style={style}
        interactionWidth={interactionWidth}
        className="cursor-pointer"
      />

      <EdgeLabelRenderer>
        <button
          type="button"
          className="nodrag nopan"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            width: ICON_HIT_SIZE,
            height: ICON_HIT_SIZE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            pointerEvents: isVisible ? 'all' : 'none',
            zIndex: 10,
            background: 'transparent',
            border: 'none',
            padding: 0,
          }}
          onMouseEnter={() => {
            clearHideTimer();
            setIconHovered(true);
          }}
          onMouseLeave={scheduleHide}
          onClick={handleDelete}
          aria-label="删除连线"
        >
          <DeleteFilled
            style={{
              color: '#ff4d4f',
              fontSize: ICON_SIZE,
              opacity: isVisible ? 1 : 0,
              transition: 'opacity 160ms ease',
            }}
          />
        </button>
      </EdgeLabelRenderer>
    </>
  );
};
