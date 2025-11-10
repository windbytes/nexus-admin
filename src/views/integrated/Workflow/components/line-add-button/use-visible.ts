import { usePlayground, type WorkflowLineEntity } from '@flowgram.ai/free-layout-editor';

/**
 * 判断连线中间内容是否可见
 * @param params
 */
export const useVisible = (params: {
  line: WorkflowLineEntity;
  selected: boolean | undefined;
  hovered: boolean | undefined;
}): boolean => {
  const playground = usePlayground();
  const { line, selected = false, hovered } = params;
  if (line.disposed) {
    return false;
  }
  if (playground.config.readonly) {
    return false;
  }
  if (!selected && !hovered) {
    return false;
  }
  return true;
};
