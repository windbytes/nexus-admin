import type { FlowNodeRegistry } from '@/types/workflow/node';
import { WorkflowNodeType } from '../../constants';
import { formMeta } from './http';

/**
 * http输入的节点
 */
export const HttpNodeRegistry: FlowNodeRegistry = {
  type: WorkflowNodeType.HTTP,

  meta: {
    isStart: true,
    deleteDisable: false,
    copyDisable: false,
    defaultPorts: [
      {
        type: 'output',
      },
    ],
    size: {
      width: 300,
      height: 120,
    },
    // 这个配置表明当前节点不会触发侧边栏的显示
    disableSideBar: true,
    disableModal: false,
  },
  info: {
    icon: '',
    description: 'http输入的节点',
  },
  formMeta,
  canAdd() {
    return false;
  },
  onDblClick(ctx, node) {
    console.log('onDblClick', node);
  },
};
