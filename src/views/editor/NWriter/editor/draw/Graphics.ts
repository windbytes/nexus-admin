import type { Orion } from '../core/Orion';
import { TObject } from '../core/TObject';

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
   * 设备像素比
   */
  private dpr: number;

  constructor(orion: Orion, h5Context: CanvasRenderingContext2D) {
    super(orion);
    this.h5Context = h5Context;
  }

  /**
   * 准备绘制上下文
   * @param scale 缩放比例
   * @param dpr 设备像素比
   */
  prepareConext(scale: number, dpr: number) {
    this.scale = scale;
    this.dpr = dpr;
    this.h5Context.scale(dpr, dpr);
    this.h5Context.shadowColor = 'black';
    this.h5Context.textBaseline = 'top';
    this.h5Context.textAlign = 'left';
    this.h5Context.lineCap = 'square';
    this.h5Context.setLineDash([]);
    this.h5Context.lineDashOffset = 0;
    // 设置默认的字体、字号
  }
}
