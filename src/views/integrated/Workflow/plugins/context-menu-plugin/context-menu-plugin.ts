import { type PluginCreator, definePluginCreator, FreeLayoutPluginContext } from '@flowgram.ai/free-layout-editor';
import { ContextMenuLayer } from './context-menu-layer';

export interface ContextMenuPluginOptions {}

/**
 * 右键菜单插件
 */
export const createContextMenuPlugin: PluginCreator<ContextMenuPluginOptions> = definePluginCreator<
  ContextMenuPluginOptions,
  FreeLayoutPluginContext
>({
  onInit(ctx, opts) {
    ctx.playground.registerLayer(ContextMenuLayer, opts);
  },
});
