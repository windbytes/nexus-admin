import {
  definePluginCreator,
  type FreeLayoutPluginContext,
  type PluginCreator,
} from '@flowgram.ai/free-layout-editor';

export interface SyncVariablePluginOptions {
  enable: boolean;
}

/**
 * 创建一个插件，将输出数据同步到变量引擎中
 */
export const createSyncVariablePlugin: PluginCreator<SyncVariablePluginOptions> =
  definePluginCreator<SyncVariablePluginOptions, FreeLayoutPluginContext>({
    /**
     * 画布注册阶段初始化该插件
     * @param _ctx
     * @param _opts
     */
    onInit(_ctx, _opts) {},
  });
