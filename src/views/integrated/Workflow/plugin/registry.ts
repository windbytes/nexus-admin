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

/** 按端点大类分组：TRIGGER / PROCESSOR / CONNECTOR / CONTROL */
export function getNodePluginsByCategory(): {
  TRIGGER: WorkflowNodePlugin[];
  PROCESSOR: WorkflowNodePlugin[];
  CONNECTOR: WorkflowNodePlugin[];
  CONTROL: WorkflowNodePlugin[];
} {
  const all = getAllNodePlugins();
  const TRIGGER: WorkflowNodePlugin[] = [];
  const PROCESSOR: WorkflowNodePlugin[] = [];
  const CONNECTOR: WorkflowNodePlugin[] = [];
  const CONTROL: WorkflowNodePlugin[] = [];
  for (const p of all) {
    const cat = p.meta.endpointCategory;
    if (cat === 'TRIGGER') TRIGGER.push(p);
    else if (cat === 'PROCESSOR') PROCESSOR.push(p);
    else if (cat === 'CONNECTOR') CONNECTOR.push(p);
    else if (cat === 'CONTROL') CONTROL.push(p);
  }
  return { TRIGGER, PROCESSOR, CONNECTOR, CONTROL };
}

export function unregisterNodePlugin(pluginId: string): boolean {
  return registry.delete(pluginId);
}
