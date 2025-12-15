import type { FlowNodeRegistry } from '@/types/workflow/node';
import IconStart from '../../assets/icon-start';
import { WorkflowNodeType } from '../constants';
import { StartNodeFormMeta } from './form-meta';

/**
 * 开始节点（这里是用作示例，实际开发中应该根据业务需求选择合适的节点）
 */
export const StartNodeRegistry: FlowNodeRegistry = {
  type: WorkflowNodeType.Start,
  meta: {
    isStart: true,
    copyDisable: true,
    deleteDisable: true,
    // 不在节点面板显示（节点面板用于选择节点）
    nodePanelVisible: false,
    defaultPorts: [{ type: 'output' }],
    size: {
      width: 360,
      height: 211,
    },
  },
  info: {
    icon: IconStart,
    description: '这是流程中的开始节点，用于表示流程的开始',
  },
  // 渲染节点表单
  formMeta: StartNodeFormMeta,
};
