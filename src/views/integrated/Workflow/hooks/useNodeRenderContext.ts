import { useContext } from 'react';
import { NodeRenderContext } from '../context/node-render-context';

/**
 * 获取节点渲染上下文
 * @returns
 */
export function useNodeRenderContext() {
  return useContext(NodeRenderContext);
}
