import type { FlowNodeJSON } from '@/types/workflow/node';
import { type FormMeta, type FormRenderProps, ValidateTrigger } from '@flowgram.ai/free-layout-editor';

export const renderForm = ({ form }: FormRenderProps<FlowNodeJSON>) => {
  return <div>默认节点渲染</div>;
};

/**
 * 默认节点
 */
export const DefaultNode: FormMeta<FlowNodeJSON> = {
  render: renderForm,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    title: ({ value }: { value: string }) => (value ? undefined : 'Title is required'),
  },
};
