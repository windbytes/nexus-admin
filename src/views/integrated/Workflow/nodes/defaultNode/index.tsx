import {
  type FlowNodeJSON,
  type FormMeta,
  type FormRenderProps,
  ValidateTrigger,
} from '@flowgram.ai/free-layout-editor';

/**
 * 默认节点渲染
 * @param form 表单
 * @returns 返回默认节点渲染
 */
export const renderDefaultNode = ({ form }: FormRenderProps<FlowNodeJSON>) => {
  return <div>默认节点</div>;
};

/**
 * 默认节点
 */
export const DefaultNode: FormMeta<FlowNodeJSON> = {
  render: renderDefaultNode,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    title: ({ value }: { value: string }) => (value ? undefined : 'Title is required'),
  },

  /**
   * 初始化（fromJSON） 数据转换
   */
  formatOnInit(value, context) {
    return value;
  },

  /**
   * 提交（toJSON） 数据转换
   * @param value 值
   * @param context 上下文
   * @returns 返回转换后的值
   */
  formatOnSubmit(value, context) {
    return value;
  },

  effect: {},
};
