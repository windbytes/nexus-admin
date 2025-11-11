import { useNodeRender, type FlowNodeEntity } from '@flowgram.ai/free-layout-editor';
import { NodeRenderContext } from '../../context/node-render-context';

/**
 * 侧边栏节点渲染器
 *
 * 主要用于在侧边栏渲染每个选中的节点的配置信息
 * @param {FlowNodeEntity} node - 节点实体
 * @returns {React.ReactNode}
 */
const SidebarNodeRenderer: React.FC<{ node: FlowNodeEntity }> = ({ node }) => {
  const nodeRender = useNodeRender(node);
  return (
    <NodeRenderContext value={nodeRender}>
      <div
        style={{
          background: 'rgb(251, 251, 251)',
          height: '100%',
          width: '100%',
          borderRadius: 8,
          border: '1px solid rgba(82,100,154, 0.13)',
          boxSizing: 'border-box',
        }}
      >
        {nodeRender.form?.render()}
      </div>
    </NodeRenderContext>
  );
};

export default SidebarNodeRenderer;
