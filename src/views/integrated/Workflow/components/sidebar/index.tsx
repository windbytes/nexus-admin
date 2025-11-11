import type { PanelFactory } from '@flowgram.ai/panel-manager-plugin';
import type { NodeFormPanelProps } from './node-form-panel';
import NodeFormPanel from './node-form-panel';

/**
 * 节点表单面板工厂(侧边栏)
 * @returns
 */
export const nodeFormPanelFactory: PanelFactory<NodeFormPanelProps> = {
  key: 'node-form-panel',
  defaultSize: 500,
  render: (props) => {
    return <NodeFormPanel {...props} />;
  },
};
