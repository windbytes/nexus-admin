import type { FlowNodeRegistry } from '@/types/workflow/node';
import { StartNodeRegistry } from './start';

/**
 * 节点注册列表
 */
export const nodeRegistries: FlowNodeRegistry[] = [StartNodeRegistry];
