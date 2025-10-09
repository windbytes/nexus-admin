import {
  definePluginCreator,
  type FreeLayoutPluginContext,
  type PluginCreator,
  WorkflowHoverService,
} from '@flowgram.ai/free-layout-editor';
import {
  WorkflowNodePanelService,
} from '@flowgram.ai/free-node-panel-plugin';
import { ContextMenuLayer } from './context-menu-layer';

export interface ContextMenuPluginOptions {
  name?: string;
}

/**
 * A plugin that adds a context menu to the playground.
 */
export const createContextMenuPlugin: PluginCreator<ContextMenuPluginOptions> =
  definePluginCreator<ContextMenuPluginOptions, FreeLayoutPluginContext>({
    onInit(ctx, opts) {
      // 手动创建依赖实例
      const nodePanelService = ctx.get(WorkflowNodePanelService);
      const hoverService = ctx.get(WorkflowHoverService);
      // 创建图层实例并传入依赖
      ctx.playground.registerLayer(class extends ContextMenuLayer {
        constructor() {
          super(ctx, nodePanelService, hoverService);
        }
      }, opts);
    },
  });