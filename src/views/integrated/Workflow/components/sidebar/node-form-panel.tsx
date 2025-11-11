import type { FlowNodeMeta } from '@/types/workflow/node';
import { PlaygroundEntityContext, useClientContext, useRefresh } from '@flowgram.ai/free-layout-editor';
import { usePanelManager } from '@flowgram.ai/panel-manager-plugin';
import { startTransition, useCallback, useEffect } from 'react';
import { nodeFormPanelFactory } from '.';
import { IsSidebarContext } from '../../context/sidebar-context';
import SidebarNodeRenderer from './sidebar-node-renderer';

export interface NodeFormPanelProps {
  nodeId: string;
}

/**
 * 节点表单面板(侧边栏包裹容器)
 * @param {NodeFormPanelProps} props - 节点表单面板属性
 * @returns {React.ReactNode}
 */
const NodeFormPanel: React.FC<NodeFormPanelProps> = ({ nodeId }) => {
  const panelManager = usePanelManager();
  const { selection, playground, document } = useClientContext();
  const refresh = useRefresh();

  // 当前选中的节点
  const node = document.getNode(nodeId);
  // 是否禁用侧边栏
  const sidebarDisabled = node?.getNodeMeta<FlowNodeMeta>()?.disableSideBar === true;

  /**
   * 关闭侧边栏
   */
  const handleClosePanel = useCallback(() => {
    startTransition(() => {
      panelManager.close(nodeFormPanelFactory.key);
    });
  }, []);

  /**
   * 监听画布实例变更
   */
  useEffect(() => {
    const disposable = playground.config.onReadonlyOrDisabledChange(() => {
      handleClosePanel();
      refresh();
    });
    console.log('监听到画布实例变更', playground);
    return () => {
      disposable.dispose();
    };
  }, [playground]);

  /**
   * 监听选中节点变更
   */
  useEffect(() => {
    const toDispose = selection.onSelectionChanged(() => {
      // 如果没有选中任何节点，则关闭侧边栏
      if (selection.selection.length === 0) {
        handleClosePanel();
      } else if (selection.selection.length === 1 && selection.selection[0] !== node) {
        handleClosePanel();
      }
    });
    return () => {
      toDispose.dispose();
    };
  }, [selection, node, handleClosePanel]);

  /**
   * 监听到节点销毁
   */
  useEffect(() => {
    if (node) {
      const toDispose = node.onDispose(() => {
        panelManager.close(nodeFormPanelFactory.key);
      });
      return () => toDispose.dispose();
    }
    return () => {};
  }, [node, sidebarDisabled, handleClosePanel]);
  /**
   * 侧边栏禁用时关闭
   */
  useEffect(() => {
    if (!node || sidebarDisabled || playground.config.readonly) {
      handleClosePanel();
    }
  }, [node, sidebarDisabled, playground.config.readonly]);

  if (!node || sidebarDisabled || playground.config.readonly) {
    return null;
  }
  return (
    <IsSidebarContext value={true}>
      <PlaygroundEntityContext key={node?.id} value={node}>
        <SidebarNodeRenderer node={node} />
      </PlaygroundEntityContext>
    </IsSidebarContext>
  );
};

export default NodeFormPanel;
