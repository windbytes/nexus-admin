import { usePanelManager } from '@flowgram.ai/panel-manager-plugin';
import type { NodeFormPanelProps } from '../../components/sidebar/node-form-panel';
import { PanelType } from './constants';

/**
 * 使用节点表单面板
 */
export const useNodeFormPanel = () => {
  const panelManager = usePanelManager();

  const open = (props: NodeFormPanelProps) => {
    panelManager.open(PanelType.NodeFormPanel, 'right', {
      props,
    });
  };

  const close = () => {
    panelManager.close(PanelType.NodeFormPanel);
  };

  return {
    open,
    close,
  };
};
