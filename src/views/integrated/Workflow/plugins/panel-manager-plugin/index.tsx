import { createPanelManagerPlugin as create, type PanelFactory } from '@flowgram.ai/panel-manager-plugin';
import type { NodeFormPanelProps } from '../../components/sidebar/node-form-panel';
import NodeFormPanel from '../../components/sidebar/node-form-panel';
import { PanelType } from './constants';

/**
 * 节点表单面板工厂
 */
const nodeFormPanelFactory: PanelFactory<NodeFormPanelProps> = {
  key: PanelType.NodeFormPanel,
  defaultSize: 500,
  style: {
    marginTop: 50,
    height: 'calc(100% - 50px)',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
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
  });
