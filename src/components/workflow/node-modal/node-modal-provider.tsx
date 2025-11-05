import { NodeModalContext } from '@/context/workflow/node-modal-context';
import { useState, type ReactNode } from 'react';

/**
 * 节点弹窗上下文提供器
 */
export const NodeModalProvider: React.FC<{ children: ReactNode }> = ({ children }: { children: ReactNode }) => {
  const [nodeId, setNodeId] = useState<string>('');
  return <NodeModalContext value={{ open: !!nodeId, nodeId, setNodeId }}>{children}</NodeModalContext>;
};
