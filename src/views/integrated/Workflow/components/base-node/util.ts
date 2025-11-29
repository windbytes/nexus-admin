import type {
  FlowNodeEntity,
  FreeLayoutPluginContext,
} from '@flowgram.ai/free-layout-editor';

/**
 * 滚动到节点可视化区域
 * @param ctx 插件上下文
 * @param node 节点
 * @param sidebarWidth 侧边栏宽度
 */
export function scrollToView(
  ctx: FreeLayoutPluginContext,
  node: FlowNodeEntity,
  sidebarWidth = 448,
) {
  const bounds = node.transform.bounds;
  ctx.playground.scrollToView({
    bounds,
    scrollDelta: {
      x: sidebarWidth / 2,
      y: 0,
    },
    zoom: 1,
    scrollToCenter: true,
  });
}
