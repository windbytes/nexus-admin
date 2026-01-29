import { type FormMeta, type FormRenderProps, ValidateTrigger } from '@flowgram.ai/free-layout-editor';
import type { FlowNodeJSON } from '@/types/workflow/node';
import FormContent from '../../components/form-components/form-content';
import FormHeader from '../../components/form-components/form-header';
import { useIsSidebar } from '../../hooks/useIsSidebar';

/**
 * 开始节点表单渲染
 * @param form 表单
 * @returns 返回开始节点表单渲染
 */
export const StartNode = ({ form }: FormRenderProps<FlowNodeJSON>) => {
  const isSidebar = useIsSidebar();
  if (isSidebar) {
    return (
      <>
        <FormHeader />
        <FormContent>
          <div className="p-4 pt-0 flex-auto overflow-y-auto">
            开始节点（这里是用作示例，实际开发中应该根据业务需求选择合适的节点）
          </div>
        </FormContent>
      </>
    );
  }
  return (
    <>
      <FormHeader />
      <FormContent>
        <div>显示节点的一些基础信息</div>
      </FormContent>
    </>
  );
};

/**
 * 开始节点表单元数据
 * @returns 返回开始节点表单元数据
 */
export const StartNodeFormMeta: FormMeta<FlowNodeJSON> = {
  render: StartNode,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    title: ({ value }: { value: string }) => (value ? undefined : 'Title is required'),
  },
};
