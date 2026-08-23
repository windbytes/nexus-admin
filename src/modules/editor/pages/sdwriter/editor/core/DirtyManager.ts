// @ts-nocheck
import { Rect } from './Rect';

/**
 * 脏区域管理器：合并需要重绘的矩形区域
 */
export class DirtyManager {
  /** 脏区域列表 */
  private dirtyRects: Rect[] = [];
  /** 是否有脏区域 */
  private hasDirty: boolean = false;

  /**
   * 标记区域为脏（需要重绘）
   * @param rect 脏区域
   */
  invalidate(rect: Rect): void {
    if (!rect || rect.width <= 0 || rect.height <= 0) {
      return;
    }
    this.dirtyRects.push(rect);
    this.hasDirty = true;
  }

  /**
   * 标记整个视口为脏
   * @param width 视口宽度
   * @param height 视口高度
   */
  invalidateAll(width: number, height: number): void {
    this.dirtyRects = [Rect.createByBounds(0, 0, width, height)];
    this.hasDirty = true;
  }

  /**
   * 获取所有脏区域（简单实现：返回包围盒；复杂场景可优化为多个矩形）
   * @returns 合并后的脏区域，若无脏区域返回 null
   */
  getDirtyRegion(): Rect | null {
    if (!this.hasDirty || this.dirtyRects.length === 0) {
      return null;
    }
    if (this.dirtyRects.length === 1) {
      return this.dirtyRects[0] || null;
    }
    // 合并所有脏区域为一个包围盒
    let minLeft = Number.POSITIVE_INFINITY;
    let minTop = Number.POSITIVE_INFINITY;
    let maxRight = Number.NEGATIVE_INFINITY;
    let maxBottom = Number.NEGATIVE_INFINITY;
    for (const rect of this.dirtyRects) {
      minLeft = Math.min(minLeft, rect.left);
      minTop = Math.min(minTop, rect.top);
      maxRight = Math.max(maxRight, rect.right);
      maxBottom = Math.max(maxBottom, rect.bottom);
    }
    return Rect.create(minLeft, minTop, maxRight, maxBottom);
  }

  /**
   * 清空所有脏区域
   */
  clear(): void {
    this.dirtyRects = [];
    this.hasDirty = false;
  }

  /**
   * 是否有脏区域需要更新
   */
  isDirty(): boolean {
    return this.hasDirty;
  }

  dispose(): void {
    this.clear();
  }
}
