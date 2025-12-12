import { type FlowNodeEntity, useNodeRender } from '@flowgram.ai/free-layout-editor';
import { NodeRenderContext } from '../../context/node-render-context';

/**
 * 侧边栏节点渲染器
 *
 * 主要用于在侧边栏渲染每个选中的节点的配置信息
 * @param node - 节点实体
 */
const SidebarNodeRenderer: React.FC<{ node: FlowNodeEntity }> = ({ node }) => {
  const nodeRender = useNodeRender(node);
  return (
    <NodeRenderContext value={nodeRender}>
      <div className="bg-white rounded-lg border border-gray-200 w-full h-full shadow-lg flex flex-col">
        {nodeRender.form?.render()}
      </div>
    </NodeRenderContext>
  );
};

export default SidebarNodeRenderer;
