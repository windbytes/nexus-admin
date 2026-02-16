import type { Orion } from '../core/Orion';
import type { Rect } from '../core/Rect';
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

  /**
   * 保存canvas状态
   */
  save() {
    this.h5Context.save();
    // 保存字体、绘笔等状态
  }

  /**
   * 恢复canvas状态
   */
  restore() {
    this.h5Context.restore();
    // 恢复字体、绘笔等状态
  }

  /**
   * 清空指定区域
   * @param x 左边界
   * @param y 上边界
   * @param w 宽度
   * @param h 高度
   */
  clear(x: number, y: number, w: number, h: number) {
    this.h5Context.clearRect(x, y, w, h);
  }

  /**
   * 清空指定区域
   * @param rect 区域
   */
  clearRect(rect: Rect) {
    this.h5Context.clearRect(rect.left, rect.top, rect.right, rect.bottom);
  }
}
