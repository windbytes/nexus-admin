import DragModal from '@/components/modal/DragModal';
import type { Endpoint } from '@/services/integrated/endpoint/endpointApi';
import { Button } from 'antd';
import type React from 'react';

interface EndpointCallChainTraceModalProps {
  open: boolean;
  /** 端点信息 */
  endpoint: Endpoint | null;
  /** 关闭回调 */
  onClose: () => void;
}

/**
 * 调用链路追踪弹窗组件
 */
const EndpointCallChainTraceModal: React.FC<EndpointCallChainTraceModalProps> = ({ open, endpoint, onClose }) => {
  return (
    <DragModal
      title="调用链路追踪"
      open={open}
      onCancel={onClose}
      width={1200}
      centered
      styles={{ body: { height: '70vh', overflowY: 'auto' } }}
      footer={<Button onClick={onClose}>关闭</Button>}
    >
      <div>EndpointCallChainTraceModal</div>
    </DragModal>
  );
};

export default EndpointCallChainTraceModal;
