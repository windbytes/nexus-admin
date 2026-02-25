/**
 * 注册内置工作流节点插件
 */
import { registerNodePlugin } from '../registry';
import { defaultNodePlugin } from './DefaultNode';
import { httpRequestNodePlugin } from './HttpRequestNode';

export function registerBuiltinNodePlugins(): void {
  registerNodePlugin(defaultNodePlugin);
  registerNodePlugin(httpRequestNodePlugin);
}
