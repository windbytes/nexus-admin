import { createPanelManagerPlugin as create, type PanelFactory } from '@flowgram.ai/panel-manager-plugin';
import type { NodeFormPanelProps } from '../../components/sidebar/node-form-panel';
import NodeFormPanel from '../../components/sidebar/node-form-panel';

/**
 * 节点表单面板工厂
 */
const nodeFormPanelFactory: PanelFactory<NodeFormPanelProps> = {
  key: 'node-form-panel',
  defaultSize: 500,
  style: {
    marginTop: 50,
    height: 'calc(100% - 50px)',
  },
  render: (props) => {
    return <NodeFormPanel {...props} />;
  },
};

/**
 * 创建面板管理器插件
 * @returns
 */
export const createPanelManagerPlugin = () =>
  create({
    factories: [nodeFormPanelFactory],
    layerProps: {
      children: <div>插件</div>,
    },
  });
