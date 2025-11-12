import { FreeLayoutPluginContext, Layer, inject, injectable } from '@flowgram.ai/free-layout-editor';

/**
 * 右键菜单图层
 * 除节点上右键外的其他地方右键操作，出现例如添加节点的菜单面板（包括导出、导入、运行等）
 */
@injectable()
export class ContextMenuLayer extends Layer {
  /**
   * 上下文
   */
  @inject(FreeLayoutPluginContext) ctx: FreeLayoutPluginContext;

  /**
   * 初始化时候触发
   */
  override onReady(): void {
    // 监听右键菜单事件
    this.listenPlaygroundEvent('contextmenu', (e) => {
      // 阻止默认事件
      e.preventDefault();
      // 阻止事件冒泡
      e.stopPropagation();
      // 打印右键菜单事件
      console.log('onContextMenu', e);
    });
  }
}
