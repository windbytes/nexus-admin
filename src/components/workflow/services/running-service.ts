import {
  type WorkflowLineEntity,
} from '@flowgram.ai/free-layout-editor';

/**
 * 运行时服务
 * 用于其他地方进行依赖注入
 */
export class RunningService {
  /**
   * 是否为流动线
   * @param line
   */
  isFlowingLine(line: WorkflowLineEntity) {
    return true;
  }
}
