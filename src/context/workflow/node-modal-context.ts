import React from 'react';

/**
 * 节点详情弹窗上下文
 */
export const NodeModalContext = React.createContext<{
  open: boolean;
  nodeId: string;
  setNodeId: (nodeId: string) => void;
}>({
  open: false,
  nodeId: '',
  setNodeId: (nodeId: string) => {},
});

/**
 * 判定是否为节点详情弹窗的上下文
 */
export const IsNodeModalContext = React.createContext<boolean>(false);
