import { InfoCircleOutlined } from '@ant-design/icons';
import { useNodeRender, type FlowNodeEntity } from '@flowgram.ai/free-layout-editor';
import { ConfigProvider } from 'antd';
import { useCallback } from 'react';
import { NodeRenderContext } from '../../context/node-render-context';
import NodeWrapper from './node-wrapper';

/**
 * 节点渲染方法（所有节点渲染的入口）
 */
const BaseNode = ({ node }: { node: FlowNodeEntity }) => {
  /**
   * 提供节点渲染相关的方法
   */
  const nodeRender = useNodeRender();

  /**
   * 只有在节点引擎开启的时候才能使用表单
   */
  const form = nodeRender.form;
  /**
   * 用于让 Tooltip 跟随节点缩放, 这个可以根据不同的 ui 库自己实现
   */
  const getPopupContainer = useCallback((node?: HTMLElement) => {
    return node || document.body;
  }, []);

  return (
    <ConfigProvider getPopupContainer={() => getPopupContainer(node.renderData.node)}>
      <NodeRenderContext value={nodeRender}>
        <NodeWrapper>
          {form?.state.invalid && (
            <InfoCircleOutlined
              style={{
                position: 'absolute',
                color: 'red',
                left: -6,
                top: -6,
                zIndex: 1,
                background: 'white',
                borderRadius: 8,
              }}
            />
          )}
          {form?.render()}
        </NodeWrapper>
      </NodeRenderContext>
      {/* <WorkflowNodeRenderer node={node}>
        {form?.render()}
      </WorkflowNodeRenderer> */}
    </ConfigProvider>
  );
};
export default BaseNode;
