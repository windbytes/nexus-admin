import { useIsModal } from '@/hooks/workflow/use-is-modal';
import { useIsSidebar } from '@/hooks/workflow/use-is-sidebar';
import { usePreferencesStore } from '@/stores/store';
import type { FlowNodeJSON } from '@/types/workflow/node';
import { useNodeRender, ValidateTrigger, type FormMeta, type FormRenderProps } from '@flowgram.ai/free-layout-editor';

/**
 * http 输出节点
 * @returns
 */
export const HttpNode = (props: FormRenderProps<FlowNodeJSON>) => {
  console.log('HttpNode', props);
  const { node, updateData } = useNodeRender();
  const nodeMeta = node.getNodeMeta();
  const isSidebar = useIsSidebar();
  const isNodeModal = useIsModal();
  // 主题
  // 获取主题配置
  const colorPrimary = usePreferencesStore((state) => state.preferences.theme.colorPrimary);
  // 弹窗里面渲染的东西
  if (isNodeModal) {
    return <div>http节点的弹窗配置界面</div>;
  }
  // 侧边栏里面渲染的东西
  if (isSidebar) {
    return <div>http节点的具体配置界面</div>;
  }
  // 画布上节点渲染的内容
  return (
    <div
      style={{ width: nodeMeta.size.width, height: nodeMeta.size.height, backgroundColor: colorPrimary }}
      className="text-blue-500"
    >
      http输出节点
    </div>
  );
};

export const formMeta: FormMeta<FlowNodeJSON> = {
  render: HttpNode,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    title: ({ value }: { value: string }) => (value ? undefined : 'Title is required'),
  },
};
