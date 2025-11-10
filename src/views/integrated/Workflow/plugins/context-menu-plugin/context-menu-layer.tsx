import { Layer, injectable } from '@flowgram.ai/free-layout-editor';

/**
 * 右键菜单图层
 */
@injectable()
export class ContextMenuLayer extends Layer {
  override render() {
    return (
      <div>
        <div>右键菜单</div>
        <div>
          <button>删除</button>
          <button>复制</button>
          <button>粘贴</button>
        </div>
      </div>
    );
  }
}
