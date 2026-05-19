/**
 * 根据已注册插件构建 React Flow nodeTypes 映射表
 */
import { getAllNodePlugins } from '../plugin/registry';
import type { WorkflowNodeComponentProps } from '../plugin/types';

/**
 * 遍历所有已注册插件，生成 React Flow 所需的 nodeTypes 对象
 * @returns key 为插件 ID、value 为包装后节点组件的映射表
 */
export function buildNodeTypes(): Record<string, React.ComponentType<WorkflowNodeComponentProps>> {
  const plugins = getAllNodePlugins();
  const types: Record<string, React.ComponentType<WorkflowNodeComponentProps>> = {};
  for (const p of plugins) {
    types[p.meta.id] = (nodeProps: WorkflowNodeComponentProps) => <p.NodeComponent {...nodeProps} />;
  }
  return types;
}
