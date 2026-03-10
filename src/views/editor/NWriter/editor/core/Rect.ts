/**
 * 矩形区域
 */
export class Rect {
  private _left: number = 0;
  private _top: number = 0;
  private _right: number = 0;
  private _bottom: number = 0;

  /**
   * 重置矩形区域
   * @param left 左边界
   * @param top 上边界
   * @param right 右边界
   * @param bottom 下边界
   * @returns 矩形区域
   */
  reset(left: number, top: number, right: number, bottom: number): Rect {
    this._left = left;
    this._top = top;
    this._right = right;
    this._bottom = bottom;
    return this;
  }

  /**
   * 重置矩形区域
   * @param rect 矩形区域
   * @returns 矩形区域
   */
  resetRect(rect: Rect): Rect {
    return this.reset(rect._left, rect._top, rect._right, rect._bottom);
  }

  /**
   * 缩放矩形区域
   * @param _dpr 缩放比例
   * @param newRect 是否返回新的矩形区域
   * @returns 缩放后的矩形区域
   */
  scale(_dpr: number, newRect: boolean): Rect {
    if (_dpr === 1) {
      if (newRect) {
        return Rect.create(this._left, this._top, this._right, this._bottom);
      }
      return this;
    }
    const left = Math.ceil(this._left * _dpr);
    const top = Math.ceil(this._top * _dpr);
    const right = Math.floor(this._right * _dpr);
    const bottom = Math.floor(this._bottom * _dpr);
    if (newRect) {
      return Rect.create(left, top, right, bottom);
    }
    this._left = left;
    this._top = top;
    this._right = right;
    this._bottom = bottom;
    return this;
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
    newRect._left = left;
    newRect._top = top;
    newRect._right = right;
    newRect._bottom = bottom;
    return newRect;
  }

  /**
   * 创建矩形区域
   * @param left 左边界
   * @param top 上边界
   * @param width 宽度
   * @param height 高度
   * @returns 矩形区域
   */
  static createByBounds(left: number, top: number, width: number, height: number): Rect {
    const newRect = new Rect();
    newRect._left = left;
    newRect._top = top;
    newRect._right = left + width;
    newRect._bottom = top + height;
    return newRect;
  }

  /**
   * 获取矩形区域宽度
   * @returns 宽度
   */
  get width(): number {
    return this._right - this._left;
  }

  /**
   * 获取矩形区域高度
   * @returns 高度
   */
  get height(): number {
    return this._bottom - this._top;
  }

  get left(): number {
    return this._left;
  }
  get top(): number {
    return this._top;
  }
  get right(): number {
    return this._right;
  }
  get bottom(): number {
    return this._bottom;
  }
}
