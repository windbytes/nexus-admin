import DragModal from '@/components/modal/DragModal';
import { IsNodeModalContext, NodeModalContext } from '@/context/workflow/node-modal-context';
import type { FlowNodeMeta } from '@/types/workflow/node';
import { PlaygroundEntityContext, useClientContext, useRefresh } from '@flowgram.ai/free-layout-editor';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { NodeModalRenderer } from './node-modal-renderer';

/**
 * 用于渲染各个组件需要的弹窗操作（通过双击触发的）
 * @returns
 */
const ModalRenderer: React.FC = () => {
  const { nodeId, setNodeId } = useContext(NodeModalContext);
  const refresh = useRefresh();
  const { playground, document } = useClientContext();
  // 节点
  const node = nodeId ? document.getNode(nodeId) : undefined;

  /**
   * 关闭弹窗
   */
  const handleClose = useCallback(() => {
    setNodeId('');
  }, []);

  /**
   * 点击确定
   */
  const handleOk = useCallback(() => {
    console.log('点击了确定，更新节点数据');
    setNodeId('');
  }, []);

  /**
   * 监听画布实例变更
   */
  useEffect(() => {
    const disposable = playground.config.onReadonlyOrDisabledChange(() => {
      handleClose();
      refresh();
    });
    console.log('监听到画布实例变更', playground);
    return () => {
      disposable.dispose();
    };
  }, [playground]);

  /**
   * 监听节点销毁
   */
  useEffect(() => {
    if (node) {
      const toDispose = node.onDispose(() => {
        console.log('监听到节点销毁', node);
        setNodeId('');
      });
      return () => {
        toDispose.dispose();
      };
    }
  }, [node]);

  /**
   * 节点渲染
   */
  const visible = useMemo(() => {
    if (!node) {
      return false;
    }
    const { disableModal = false } = node.getNodeMeta<FlowNodeMeta>();
    return !disableModal;
  }, [node]);

  if (playground.config.readonly) {
    return null;
  }

  // 弹窗内容
  const content = node ? (
    <PlaygroundEntityContext value={node} key={node.id}>
      <NodeModalRenderer node={node} />
    </PlaygroundEntityContext>
  ) : null;

  return (
    <DragModal open={visible} onCancel={handleClose} onOk={handleOk}>
      <IsNodeModalContext value={true}>{content}</IsNodeModalContext>
    </DragModal>
  );
};
export default ModalRenderer;
