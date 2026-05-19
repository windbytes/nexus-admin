/**
 * 流程编排模块共享常量
 */
import type { NodeEndpointCategory } from './types';

/** 节点端点分类的中文标签映射 */
export const CATEGORY_LABELS: Record<NodeEndpointCategory, string> = {
  TRIGGER: '触发器',
  PROCESSOR: '处理器',
  CONNECTOR: '连接器',
  CONTROL: '控制',
};

/** 所有端点分类的有序枚举，用于遍历与展示 */
export const CATEGORY_ORDER: NodeEndpointCategory[] = ['TRIGGER', 'PROCESSOR', 'CONNECTOR', 'CONTROL'];
