import type { WorkflowPortEntity } from '@flowgram.ai/free-layout-editor';
import type { NodePanelRenderProps as NodePanelRenderPropsDefault } from '@flowgram.ai/free-node-panel-plugin';
import { Popover } from 'antd';
import { useRef } from 'react';
import './index.scss';
import NodeList from './node-list';
import { NodePlaceholder } from './node-placeholder';

interface NodePanelRenderProps extends NodePanelRenderPropsDefault {
  panelProps?: {
    fromPort?: WorkflowPortEntity; // 从哪个端口添加 From which port to add
    enableNodePlaceholder?: boolean;
  };
}

/**
 * 节点添加面板
 * @returns
 */
export const NodePanel: React.FC<NodePanelRenderProps> = (props) => {
  const { onSelect, position, onClose, containerNode, panelProps = {} } = props;
  const { enableNodePlaceholder, fromPort } = panelProps;
  const ref = useRef<HTMLDivElement>(null);
  return (
    <Popover
      trigger="click"
      open
      placement="right"
      arrow={false}
      align={{
        offset: [10, 0],
      }}
      getPopupContainer={containerNode ? () => ref.current || document.body : undefined}
      styles={{
        root: {
          width: 200,
        },
        body: {
          padding: 8,
        },
      }}
      onOpenChange={(open) => {
        if (!open) {
          onClose?.();
        }
      }}
      content={<NodeList {...{ onSelect, fromPort, containerNode }} />}
    >
      <div
        ref={ref}
        style={
          enableNodePlaceholder
            ? {
                position: 'absolute',
                top: position.y - 61.5,
                left: position.x,
                width: 320,
                height: 100,
              }
            : {
                position: 'absolute',
                top: position.y,
                left: position.x,
                width: 0,
                height: 0,
              }
        }
      >
        {enableNodePlaceholder && <NodePlaceholder />}
      </div>
    </Popover>
  );
};
