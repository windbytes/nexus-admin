import { useContext } from 'react';
import { IsNodeModalContext } from '../context/node-modal-context';

/**
 * 判定是否为节点详情弹窗的上下文
 * 这里一般是节点渲染里面调用
 */
export function useIsModal() {
  return useContext(IsNodeModalContext);
}
