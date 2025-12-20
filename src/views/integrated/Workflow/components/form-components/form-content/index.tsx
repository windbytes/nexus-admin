import type { FlowNodeRegistry } from '@/types/workflow/node';
import { useIsSidebar } from '../../../hooks/useIsSidebar';
import { useNodeRenderContext } from '../../../hooks/useNodeRenderContext';

/**
 * 表单内容组件(不是在侧边栏中显示，画布中整体展示的表单内容)
 * @param children 子组件
 * @returns 返回表单内容
 */
const FormContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { node, expanded } = useNodeRenderContext();
  const isSidebar = useIsSidebar();
  const registry = node.getNodeRegistry<FlowNodeRegistry>();
  return (
    <div className="w-full flex flex-col gap-1.5 bg-white rounded-br-lg rounded-bl-lg p-3 pt-0">
      {isSidebar && (
        <div className="text-xs text-gray-500 leading-5 break-all whitespace-break-spaces">
          {registry.info?.description}
        </div>
      )}
      {(expanded || isSidebar) && children}
    </div>
  );
};

export default FormContent;
