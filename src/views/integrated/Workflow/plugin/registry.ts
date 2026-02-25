/**
 * 工作流节点插件注册表
 * 仅负责注册与查询，不做生命周期
 */
import type { WorkflowNodePlugin } from './types';

const registry = new Map<string, WorkflowNodePlugin>();

export function registerNodePlugin(plugin: WorkflowNodePlugin): void {
  const { id } = plugin.meta;
  if (registry.has(id)) {
    console.warn(`[Workflow.Plugin] 节点插件 ID 已存在，将被覆盖: ${id}`);
  }
  registry.set(id, plugin);
}

export function getNodePlugin(pluginId: string): WorkflowNodePlugin | undefined {
  return registry.get(pluginId);
}

export function getAllNodePlugins(): WorkflowNodePlugin[] {
  return Array.from(registry.values());
}

/** 按端点大类分组：工具类型 / 与外部交互类型 */
export function getNodePluginsByCategory(): {
  tool: WorkflowNodePlugin[];
  external: WorkflowNodePlugin[];
} {
  const all = getAllNodePlugins();
  const tool: WorkflowNodePlugin[] = [];
  const external: WorkflowNodePlugin[] = [];
  for (const p of all) {
    if (p.meta.endpointCategory === 'external') {
      external.push(p);
    } else {
      tool.push(p);
    }
  }
  return { tool, external };
}

export function unregisterNodePlugin(pluginId: string): boolean {
  return registry.delete(pluginId);
}
