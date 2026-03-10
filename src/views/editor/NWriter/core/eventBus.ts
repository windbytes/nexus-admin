/**
 * 轻量事件总线：工具栏点击/变更先 emit，再按配置执行 command，便于后续替换为真实业务逻辑
 */

type Handler = (payload: unknown) => void;

const listeners = new Map<string, Set<Handler>>();

function getHandlers(event: string): Set<Handler> {
  let set = listeners.get(event);
  if (!set) {
    set = new Set();
    listeners.set(event, set);
  }
  return set;
}

/** 订阅事件 */
export function on(event: string, handler: Handler): void {
  getHandlers(event).add(handler);
}

/** 取消订阅 */
export function off(event: string, handler: Handler): void {
  getHandlers(event).delete(handler);
}

/** 发布事件 */
export function emit(event: string, payload?: unknown): void {
  getHandlers(event).forEach((h) => {
    try {
      h(payload);
    } catch (err) {
      console.error(`[NWriter.EventBus] handler error for "${event}":`, err);
    }
  });
}

/** 工具点击等事件 payload 类型 */
export interface ToolEventPayload {
  tabKey: string;
  groupKey?: string;
  toolKey: string;
  type: string;
  value?: unknown;
}
