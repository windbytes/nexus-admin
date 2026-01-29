import { injectable, type WorkflowLineEntity } from '@flowgram.ai/free-layout-editor';

/**
 * 运行时服务
 */
@injectable()
export class WorkflowRuntimeService {
  /**
   * 是否为流动线
   * @param line
   * @returns
   */
  isFlowingLine(line: WorkflowLineEntity) {
    return true;
  }
}
