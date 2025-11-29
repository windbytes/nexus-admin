import type { FlowNodeRegistry } from '@/types/workflow/node';
import { DefaultNode } from './defaultNode';

/**
 * 默认节点（调用到未注册的节点显示的情况）
 */
export const DefaultNodeConfig: FlowNodeRegistry = {
  type: 'default',
  meta: {
    disableSideBar: true,
    disableModal: true,
    defaultPorts: [],
    size: {
      width: 300,
      height: 120,
    },
  },
  info: {
    icon: '',
    description: '默认节点',
  },
  formMeta: DefaultNode,
  canAdd() {
    return false;
  },
  onDblClick(ctx, node) {
    console.log('onDblClick', node);
  },
};
