/**
 * 滚动条控制：管理垂直和水平滚动条的绘制与交互
 */
export class Scrollbar {
  /** 滚动条宽度（px） */
  static readonly WIDTH = 10;
  /** 滑轨颜色 */
  static readonly TRACK_COLOR = '#f0f0f0';
  /** 滑块颜色 */
  static readonly THUMB_COLOR = '#c0c0c0';
  /** 滑块悬停颜色 */
  static readonly THUMB_HOVER_COLOR = '#a0a0a0';
  /** 滑块最小尺寸（px） */
  static readonly THUMB_MIN_SIZE = 20;

  /** 视口宽度（canvas 逻辑像素） */
  private viewportWidth: number = 0;
  /** 视口高度（canvas 逻辑像素） */
  private viewportHeight: number = 0;
  /** 内容总宽度（文档宽度） */
  private contentWidth: number = 0;
  /** 内容总高度（文档高度） */
  private contentHeight: number = 0;
  /** 水平滚动偏移 */
  private _scrollLeft: number = 0;
  /** 垂直滚动偏移 */
  private _scrollTop: number = 0;

  /**
   * 更新视口与内容尺寸
   * @param viewportWidth 视口宽度
   * @param viewportHeight 视口高度
   * @param contentWidth 内容总宽度
   * @param contentHeight 内容总高度
   */
  setDimensions(viewportWidth: number, viewportHeight: number, contentWidth: number, contentHeight: number): void {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.contentWidth = contentWidth;
    this.contentHeight = contentHeight;
  }

  /**
   * 更新滚动位置
   * @param scrollLeft 水平滚动偏移
   * @param scrollTop 垂直滚动偏移
   */
  setScroll(scrollLeft: number, scrollTop: number): void {
    this._scrollLeft = Math.max(0, Math.min(scrollLeft, this.getMaxScrollLeft()));
    this._scrollTop = Math.max(0, Math.min(scrollTop, this.getMaxScrollTop()));
  }

  /**
   * 获取水平滚动偏移
   */
  get scrollLeft(): number {
    return this._scrollLeft;
  }

  /**
   * 设置水平滚动偏移
   */
  set scrollLeft(value: number) {
    this._scrollLeft = Math.max(0, Math.min(value, this.getMaxScrollLeft()));
  }

  /**
   * 获取垂直滚动偏移
   */
  get scrollTop(): number {
    return this._scrollTop;
  }

  /**
   * 设置垂直滚动偏移
   */
  set scrollTop(value: number) {
    this._scrollTop = Math.max(0, Math.min(value, this.getMaxScrollTop()));
  }

  /**
   * 获取水平最大滚动偏移
   */
  getMaxScrollLeft(): number {
    return Math.max(0, this.contentWidth - (this.viewportWidth - Scrollbar.WIDTH));
  }

  /**
   * 获取垂直最大滚动偏移
   */
  getMaxScrollTop(): number {
    return Math.max(0, this.contentHeight - (this.viewportHeight - Scrollbar.WIDTH));
  }

  /**
   * 是否需要显示垂直滚动条
   */
  hasVerticalScrollbar(): boolean {
    return this.contentHeight > this.viewportHeight - Scrollbar.WIDTH;
  }

  /**
   * 是否需要显示水平滚动条
   */
  hasHorizontalScrollbar(): boolean {
    return this.contentWidth > this.viewportWidth - Scrollbar.WIDTH;
  }

  /**
   * 获取垂直滚动条滑块的位置与尺寸
   */
  getVerticalThumb(): { top: number; height: number } {
    const trackHeight = this.viewportHeight - Scrollbar.WIDTH;
    const maxScroll = this.getMaxScrollTop();
    if (maxScroll <= 0) {
      return { top: 0, height: trackHeight };
    }
    const thumbHeight = Math.max(Scrollbar.THUMB_MIN_SIZE, (trackHeight / this.contentHeight) * trackHeight);
    const thumbTop = (this.scrollTop / maxScroll) * (trackHeight - thumbHeight);
    return { top: thumbTop, height: thumbHeight };
  }

  /**
   * 获取水平滚动条滑块的位置与尺寸
   */
  getHorizontalThumb(): { left: number; width: number } {
    const trackWidth = this.viewportWidth - Scrollbar.WIDTH;
    const maxScroll = this.getMaxScrollLeft();
    if (maxScroll <= 0) {
      return { left: 0, width: trackWidth };
    }
    const thumbWidth = Math.max(Scrollbar.THUMB_MIN_SIZE, (trackWidth / this.contentWidth) * trackWidth);
    const thumbLeft = (this.scrollLeft / maxScroll) * (trackWidth - thumbWidth);
    return { left: thumbLeft, width: thumbWidth };
  }

  /**
   * 绘制滚动条（垂直 + 水平）
   * @param ctx 2D 上下文
   * @param viewportWidth 视口宽度
   * @param viewportHeight 视口高度
   */
  draw(ctx: CanvasRenderingContext2D, viewportWidth: number, viewportHeight: number): void {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;

    const hasVertical = this.hasVerticalScrollbar();
    const hasHorizontal = this.hasHorizontalScrollbar();

    // 绘制垂直滚动条
    if (hasVertical) {
      this.drawVerticalScrollbar(ctx);
    }

    // 绘制水平滚动条
    if (hasHorizontal) {
      this.drawHorizontalScrollbar(ctx);
    }

    // 绘制右下角填充块（两个滚动条交汇处）
    if (hasVertical && hasHorizontal) {
      ctx.fillStyle = Scrollbar.TRACK_COLOR;
      ctx.fillRect(viewportWidth - Scrollbar.WIDTH, viewportHeight - Scrollbar.WIDTH, Scrollbar.WIDTH, Scrollbar.WIDTH);
    }
  }

  /**
   * 绘制垂直滚动条
   */
  private drawVerticalScrollbar(ctx: CanvasRenderingContext2D): void {
    const x = this.viewportWidth - Scrollbar.WIDTH;
    const y = 0;
    const width = Scrollbar.WIDTH;
    const height = this.viewportHeight - (this.hasHorizontalScrollbar() ? Scrollbar.WIDTH : 0);

    // 绘制滑轨
    ctx.fillStyle = Scrollbar.TRACK_COLOR;
    ctx.fillRect(x, y, width, height);

    // 绘制滑块
    const thumb = this.getVerticalThumb();
    ctx.fillStyle = Scrollbar.THUMB_COLOR;
    ctx.fillRect(x + 2, y + thumb.top, width - 4, thumb.height);
  }

  /**
   * 绘制水平滚动条
   */
  private drawHorizontalScrollbar(ctx: CanvasRenderingContext2D): void {
    const x = 0;
    const y = this.viewportHeight - Scrollbar.WIDTH;
    const width = this.viewportWidth - (this.hasVerticalScrollbar() ? Scrollbar.WIDTH : 0);
    const height = Scrollbar.WIDTH;

    // 绘制滑轨
    ctx.fillStyle = Scrollbar.TRACK_COLOR;
    ctx.fillRect(x, y, width, height);

    // 绘制滑块
    const thumb = this.getHorizontalThumb();
    ctx.fillStyle = Scrollbar.THUMB_COLOR;
    ctx.fillRect(x + thumb.left, y + 2, thumb.width, height - 4);
  }

  /**
   * 获取可用内容区域宽度（扣除滚动条占用）
   */
  getAvailableWidth(): number {
    return this.viewportWidth - (this.hasVerticalScrollbar() ? Scrollbar.WIDTH : 0);
  }

  /**
   * 获取可用内容区域高度（扣除滚动条占用）
   */
  getAvailableHeight(): number {
    return this.viewportHeight - (this.hasHorizontalScrollbar() ? Scrollbar.WIDTH : 0);
  }
}
