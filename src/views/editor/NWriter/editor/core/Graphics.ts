import type { Orion } from './Orion';
import { TObject } from './TObject';

/**
 * 封装canvas中的绘制工具，包括：
 * 1. 绘制基础图形
 * 2. 绘制文本
 * 3. 绘制图片
 * 4. 绘制路径
 * 5. 绘制渐变
 * 6. 绘制阴影
 * 7. 绘制圆角
 * 8. 绘制边框
 * 9. 绘制背景
 * 等等
 */
export class OrionCanvas extends TObject {
  /**
   * 绘制上下文
   */
  private h5Context: CanvasRenderingContext2D;
  /**
   * 绘制缩放比例
   */
  private scale: number;
  /**
   * 绘制分辨率
   */
  private dpi: number;

  constructor(orion: Orion, h5Context: CanvasRenderingContext2D) {
    super(orion);
    this.h5Context = h5Context;
  }
}
