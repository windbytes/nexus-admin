import { definePluginCreator, type FreeLayoutPluginContext, type PluginCreator } from '@flowgram.ai/free-layout-editor';
import { ContextMenuLayer } from './context-menu-layer';

export type ContextMenuPluginOptions = {
  menus?: string[];
};

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
