/**
 * 根据已注册插件构建 React Flow nodeTypes
 */
import { getAllNodePlugins } from '../plugin/registry';

export function buildNodeTypes(): Record<string, React.ComponentType<any>> {
  const plugins = getAllNodePlugins();
  const types: Record<string, React.ComponentType<any>> = {};
  for (const p of plugins) {
    types[p.meta.id] = (props: any) => (
      <p.NodeComponent id={props.id} data={props.data} selected={props.selected} {...props} />
    );
  }
  return types;
}
