import type { NodeRenderReturnType } from '@flowgram.ai/free-layout-editor';
import React from 'react';

interface INodeRenderContext extends NodeRenderReturnType {}

/** 业务自定义节点上下文 */
export const NodeRenderContext = React.createContext<INodeRenderContext>(
  {} as INodeRenderContext,
);
