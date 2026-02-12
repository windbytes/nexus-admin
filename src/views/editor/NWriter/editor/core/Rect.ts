/**
 * 矩形区域
 */
export class Rect {
  private left: number = 0;
  private top: number = 0;
  private right: number = 0;
  private bottom: number = 0;

  /**
   * 重置矩形区域
   * @param left 左边界
   * @param top 上边界
   * @param right 右边界
   * @param bottom 下边界
   * @returns 矩形区域
   */
  reset(left: number, top: number, right: number, bottom: number): Rect {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    return this;
  }

  /**
   * 重置矩形区域
   * @param rect 矩形区域
   * @returns 矩形区域
   */
  resetRect(rect: Rect): Rect {
    return this.reset(rect.left, rect.top, rect.right, rect.bottom);
  }

  /**
   * 创建矩形区域
   * @param left 左边界
   * @param top 上边界
   * @param right 右边界
   * @param bottom 下边界
   * @returns 矩形区域
   */
  static create(left: number, top: number, right: number, bottom: number): Rect {
    const newRect = new Rect();
    newRect.left = left;
    newRect.top = top;
    newRect.right = right;
    newRect.bottom = bottom;
    return newRect;
  }

  /**
   * 获取矩形区域宽度
   * @returns 宽度
   */
  get width(): number {
    return this.right - this.left;
  }

  /**
   * 获取矩形区域高度
   * @returns 高度
   */
  get height(): number {
    return this.bottom - this.top;
  }
}
