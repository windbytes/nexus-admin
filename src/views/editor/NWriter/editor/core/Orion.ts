import { Scrollbar } from '../controls/Scrollbar';
import { Caret } from '../cursor/Caret';
import { Ime } from '../cursor/Ime';
import { OrionCanvas } from '../draw/Graphics';
import { Application } from './Application';
import { DirtyManager } from './DirtyManager';
import type { Rect } from './Rect';

/**
 * 编辑器核心，统一管理贯穿编辑器全文的工具或者状态
 * 例如：输入、光标、存储、剪贴板
 *      聚焦状态、统一的事件管理转发等等
 */
export class Orion {
  private instanceID: number; // 编辑器实例ID，用于标识编辑器实例
  private _mode: string; // 编辑器模式，用于标识编辑器模式
  private _focus: boolean; // 编辑器焦点状态，用于标识编辑器焦点状态
  private _parentElement!: HTMLElement; // 编辑器父元素，用于标识编辑器父元素
  private _scale: number; // 编辑器缩放比例，用于标识编辑器缩放比例
  private _dpi: number; // 编辑器分辨率，用于标识编辑器分辨率，一般精度为96dpi
  private _dpr: number; // 编辑器设备像素比，用于标识编辑器设备像素比

  // 输入法代理
  private _ime: Ime;

  // 编辑器宽度
  private _width: number;
  // 编辑器高度
  private _height: number;

  // 自动适应父元素宽高
  private _autoWidth: boolean;
  private _autoHeight: boolean;

  // 是否水平居中
  private _horizontalCenter: boolean;
  private _left: number;

  // 更新计数
  private _updateCount: number;

  // 背景层 页面背景、页边距区域、页码底色、水印、分页分隔线
  private _bgH5Canvas!: HTMLCanvasElement;
  private _bgCanvas!: OrionCanvas;

  // 内容层 文本、表格、图片、公式、图表、修订痕迹等，使用 dirtyRect进行区域更新
  private _orionH5Canvas!: HTMLCanvasElement; // 编辑器绘制canvas
  private _orionCanvas!: OrionCanvas; // 编辑器绘制canvas包装

  // 选区层 选区、控件选中、表格选中块等
  private _selectionH5Canvas!: HTMLCanvasElement;
  private _selectionCanvas!: OrionCanvas;

  // 交互层 hover效果、高亮、命中提示、对其辅助线、拖拽框等
  private _interactionH5Canvas!: HTMLCanvasElement;
  private _interactionCanvas!: OrionCanvas;

  // 光标层 光标闪烁、输入法候选定位参考线
  private _caretH5Canvas!: HTMLCanvasElement;
  private _caretCanvas!: OrionCanvas;

  // 滚动条层 水平滚动条、垂直滚动条
  private _scrollbarH5Canvas!: HTMLCanvasElement;
  private _scrollbarCanvas!: OrionCanvas;

  // 离屏渲染使用的canvas 用于提高绘制性能使用
  private _offscreenH5Canvas!: HTMLCanvasElement;
  private _offscreenCanvas!: OrionCanvas;

  // 一个临时canvas，用于字体测量等相关操作
  private _tempH5Canvas: HTMLCanvasElement;
  private _tempCanvas: OrionCanvas;

  // 光标对象
  private _caret: Caret;

  // 滚动条对象
  private _scrollbar: Scrollbar;

  // canvas最小宽度
  private _minWidth: number;

  // 父元素的监听器对象
  private _parentResizeObserver: ResizeObserver | null;

  // 应用
  private _application: Application | null;

  // 是否加载完成
  private _loaded: boolean;

  /** 脏区域管理器（内容更新管线用） */
  private _dirtyManager: DirtyManager;
  /** 内容更新管线的 rAF id */
  private _contentUpdateFrameId: number | null = null;
  /** 视口更新管线的 rAF id */
  private _viewportUpdateFrameId: number | null = null;

  /** 光标位置（临时实现用于闪烁绘制） */
  private _cursorX: number = 0;
  private _cursorY: number = 0;
  private _cursorHeight: number = 20;
  /** 光标闪烁是否显示 */
  private _caretBlinkOn: boolean = true;
  /** 上次切换光标显示状态的时间戳（用于 requestAnimationFrame 闪烁） */
  private _caretLastToggle: number = 0;
  /** 光标闪烁动画帧 id（用于 cancelAnimationFrame） */
  private _caretAnimationFrameId: number | null = null;

  constructor() {
    this.instanceID = 0;
    this._mode = '';
    this._focus = false;
    this._scale = 1;
    this._dpi = 1;

    this._ime = new Ime();

    this._minWidth = 256;
    this._parentResizeObserver = null;
    this._updateCount = 0;
    this._caret = new Caret();
    this._scrollbar = new Scrollbar();
    this._width = 1450;
    this._height = 658;
    this._application = null;
    this._tempH5Canvas = document.createElement('canvas');
    this._tempCanvas = new OrionCanvas(this, this._tempH5Canvas.getContext('2d') as CanvasRenderingContext2D);
    this._loaded = false;
    this._dirtyManager = new DirtyManager();
  }

  /**
   * 运行应用
   */
  applicationRun() {
    if (!this._parentElement) {
      this._parentElement = document.body;
    }
    this._focus = true; // 临时：使光标层能绘制；后续可改为随容器 focus 更新
    this.resize();
    this.startCaretBlinkTimer();
  }

  /**
   * 父元素resize事件
   */
  private parentResize() {
    this.resize();
  }

  /**
   * 移除编辑器的容器元素绑定的事件
   */
  removeEvent() {
    if (this._parentResizeObserver) {
      this._parentResizeObserver.unobserve(this._parentElement);
    }
    if (this.parentElement) {
      this.parentElement.removeEventListener('resize', this.parentResize.bind(this));
    }
    console.log('removeEvent');
  }

  /**
   * 给编辑器的容器元素绑定事件
   */
  bindEvent() {
    this.removeEvent();
    if (this._parentElement) {
      // 绑定键盘事件、焦点、鼠标、拖拽、复制粘贴、鼠标滚动等，统一处理绑定到容器上，内部进行转发到不同的层
      // mouse event
      this.parentElement.addEventListener('wheel', this.mouseWheel.bind(this));
      // keyboard event
      // resize event

      this.parentElement.addEventListener('resize', this.parentResize.bind(this));
    }

    // 添加父元素的监听器
    if (!this._parentResizeObserver) {
      this._parentResizeObserver = new ResizeObserver(this.parentResize.bind(this));
    }
    this._parentResizeObserver.observe(this._parentElement);
  }

  /**
   * 调整编辑器尺寸
   */
  resize() {
    if (this._parentElement) {
      // 开始计数更新
      this.beginUpdate();
      try {
        if (this._autoWidth) {
          this._left = 0;
          this._width = this.getViewPortWidth();
        } else {
          if (this._horizontalCenter) {
            this._left = this.getAdjustLeft();
          }
        }
        if (this._autoHeight) {
          this._height = this.getViewPortHeight();
        }
        // 调整所有canvas的left，调整之前需要判定left是否发生的变化
        if (this._bgH5Canvas && this._bgH5Canvas.style.left !== `${this._left}px`) {
          this._bgH5Canvas.style.left = `${this._left}px`;
        }
        if (this._orionH5Canvas && this._orionH5Canvas.style.left !== `${this._left}px`) {
          this._orionH5Canvas.style.left = `${this._left}px`;
        }
        if (this._selectionH5Canvas && this._selectionH5Canvas.style.left !== `${this._left}px`) {
          this._selectionH5Canvas.style.left = `${this._left}px`;
        }
        if (this._interactionH5Canvas && this._interactionH5Canvas.style.left !== `${this._left}px`) {
          this._interactionH5Canvas.style.left = `${this._left}px`;
        }
        if (this._caretH5Canvas && this._caretH5Canvas.style.left !== `${this._left}px`) {
          this._caretH5Canvas.style.left = `${this._left}px`;
        }

        // 设置临时canvas的宽高
        this._tempH5Canvas.width = Math.max(this._width, this._minWidth);
        this._tempH5Canvas.height = Math.max(this._height, this._minWidth);
        this._tempCanvas.prepareConext(this._scale, this._dpr);
        // 获取浏览器的DPR
        this._dpr = this.getDpr();

        // 设置所有canvas的宽高
        this._bgH5Canvas.style.width = `${this._width}px`;
        this._bgH5Canvas.style.height = `${this._height}px`;
        this._bgH5Canvas.width = Math.floor(this._width * this._dpr);
        this._bgH5Canvas.height = Math.floor(this._height * this._dpr);
        this._bgCanvas.prepareConext(this._scale, this._dpr);
        // 设置内容层canvas的宽高
        this._orionH5Canvas.style.width = `${this._width}px`;
        this._orionH5Canvas.style.height = `${this._height}px`;
        this._orionH5Canvas.width = Math.floor(this._width * this._dpr);
        this._orionH5Canvas.height = Math.floor(this._height * this._dpr);
        this._orionCanvas.prepareConext(this._scale, this._dpr);

        // 设置选区层canvas的宽高
        this._selectionH5Canvas.style.width = `${this._width}px`;
        this._selectionH5Canvas.style.height = `${this._height}px`;
        this._selectionH5Canvas.width = Math.floor(this._width * this._dpr);
        this._selectionH5Canvas.height = Math.floor(this._height * this._dpr);
        this._selectionCanvas.prepareConext(this._scale, this._dpr);

        // 设置交互层canvas的宽高
        this._interactionH5Canvas.style.width = `${this._width}px`;
        this._interactionH5Canvas.style.height = `${this._height}px`;
        this._interactionH5Canvas.width = Math.floor(this._width * this._dpr);
        this._interactionH5Canvas.height = Math.floor(this._height * this._dpr);
        this._interactionCanvas.prepareConext(this._scale, this._dpr);

        // 设置光标层canvas的宽高
        this._caretH5Canvas.style.width = `${this._width}px`;
        this._caretH5Canvas.style.height = `${this._height}px`;
        this._caretH5Canvas.width = Math.floor(this._width * this._dpr);
        this._caretH5Canvas.height = Math.floor(this._height * this._dpr);
        this._caretCanvas.prepareConext(this._scale, this._dpr);

        // 设置离屏渲染canvas的宽高
        this._offscreenH5Canvas.style.width = `${this._width}px`;
        this._offscreenH5Canvas.style.height = `${this._height}px`;
        this._offscreenH5Canvas.width = Math.floor(this._width * this._dpr);
        this._offscreenH5Canvas.height = Math.floor(this._height * this._dpr);
        this._offscreenCanvas.prepareConext(this._scale, this._dpr);

        // 设置滚动条层canvas的宽高
        this._scrollbarH5Canvas.style.width = `${this._width}px`;
        this._scrollbarH5Canvas.style.height = `${this._height}px`;
        this._scrollbarH5Canvas.width = Math.floor(this._width * this._dpr);
        this._scrollbarH5Canvas.height = Math.floor(this._height * this._dpr);
        this._scrollbarCanvas.prepareConext(this._scale, this._dpr);
      } finally {
        this.endUpdate();
      }
    }
  }

  /**
   * 鼠标滚动事件
   * @param event 鼠标滚动事件
   */
  private mouseWheel(event: WheelEvent) {
    event.preventDefault();

    // 垂直滚动
    if (!event.shiftKey && Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      const currentScrollTop = this._scrollbar.scrollTop;
      const newScrollTop = Math.max(0, currentScrollTop + event.deltaY);
      this.setScrollTop(newScrollTop);
    }

    // 水平滚动（按住 Shift 或横向滚动）
    if (event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      const currentScrollLeft = this._scrollbar.scrollLeft;
      const currentScrollTop = 0;
      const newScrollLeft = Math.max(0, currentScrollLeft + (event.shiftKey ? event.deltaY : event.deltaX));
      this.setScrollTop(currentScrollTop, newScrollLeft);
    }
  }

  /**
   * 更新计数累加
   */
  private beginUpdate() {
    this._updateCount++;
  }

  /**
   * 更新计数累减
   */
  private endUpdate() {
    if (this._updateCount > 0) {
      this._updateCount--;
      if (this._updateCount === 0) {
        this.update();
      }
    }
  }

  /**
   * 更新整个编辑器（resize 等场景触发，走视口更新管线）
   */
  private update() {
    if (this._updateCount > 0) {
      return;
    }
    this.requestViewportUpdate();
  }

  /**
   * 更新指定区域（已弃用，请使用 invalidate）
   * @param t 更新区域
   * @deprecated 使用 invalidate(rect) 替代
   */
  private updateRect(t: Rect) {
    this.invalidate(t);
  }

  // ========== ① 内容更新管线（数据变化）==========

  /**
   * 标记区域为脏（输入、删除、公式变化、批注变化、编辑操作等触发）
   * @param rect 脏区域
   */
  invalidate(rect: Rect): void {
    this._dirtyManager.invalidate(rect);
    this.requestContentUpdate();
  }

  /**
   * 请求内容更新（通过 rAF 合并多次 invalidate）
   */
  private requestContentUpdate(): void {
    if (this._contentUpdateFrameId !== null) {
      return;
    }
    this._contentUpdateFrameId = requestAnimationFrame(() => {
      this._contentUpdateFrameId = null;
      this.updateContentPipeline();
    });
  }

  /**
   * 内容更新管线主流程
   */
  private updateContentPipeline(): void {
    const dirtyRegion = this._dirtyManager.getDirtyRegion();
    if (!dirtyRegion) {
      return;
    }
    this._dirtyManager.clear();
    this.updateOffscreen(dirtyRegion);
    this.blitToContentLayer(dirtyRegion);
    this.repaintSelection();
    this.repaintOverlay();
  }

  /**
   * 在离屏 canvas 上更新脏区域（绘制文本、图表、公式等内容）
   * @param rect 脏区域
   */
  private updateOffscreen(rect: Rect): void {
    const ctx = this._offscreenH5Canvas?.getContext('2d');
    if (!ctx) {
      return;
    }
    const scale = rect.scale(this._dpr, true);
    ctx.clearRect(scale.left, scale.top, scale.width, scale.height);
    // TODO: 实际内容绘制逻辑（文本、表格、图片、公式等）
    // 这里暂时画一个示例矩形表示内容区域
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(scale.left, scale.top, scale.width, scale.height);
  }

  /**
   * 将离屏 canvas 的指定区域 blit（拷贝）到内容层
   * @param rect 区域
   */
  private blitToContentLayer(rect: Rect): void {
    const contentCtx = this._orionH5Canvas?.getContext('2d');
    const offscreenCtx = this._offscreenH5Canvas?.getContext('2d');
    if (!contentCtx || !offscreenCtx) {
      return;
    }
    const scale = rect.scale(this._dpr, true);
    const imageData = offscreenCtx.getImageData(scale.left, scale.top, scale.width, scale.height);
    contentCtx.putImageData(imageData, scale.left, scale.top);
  }

  // ========== ② 视口更新管线（视口变化）==========

  /**
   * 设置滚动位置（触发视口更新管线）
   * @param scrollTop 垂直滚动偏移
   * @param scrollLeft 水平滚动偏移（可选）
   */
  setScrollTop(scrollTop: number, scrollLeft: number = this._scrollbar.scrollLeft): void {
    if (this._scrollbar.scrollTop === scrollTop && this._scrollbar.scrollLeft === scrollLeft) {
      return;
    }
    this._scrollbar.scrollTop = scrollTop;
    this._scrollbar.scrollLeft = scrollLeft;
    this.requestViewportUpdate();
  }

  /**
   * 设置缩放（触发视口更新管线）
   * @param scale 缩放比例
   */
  setScale(scale: number): void {
    if (this._scale === scale) {
      return;
    }
    this._scale = scale;
    this.requestViewportUpdate();
  }

  /**
   * 请求视口更新（通过 rAF）
   */
  private requestViewportUpdate(): void {
    if (this._viewportUpdateFrameId !== null) {
      return;
    }
    this._viewportUpdateFrameId = requestAnimationFrame(() => {
      this._viewportUpdateFrameId = null;
      this.updateViewportPipeline();
    });
  }

  /**
   * 视口更新管线主流程（不更新离屏，不走 dirty，重绘整个 viewport）
   */
  private updateViewportPipeline(): void {
    this.repaintBackground();
    this.repaintContentFromOffscreen();
    this.repaintSelection();
    this.repaintOverlay();
    this.repaintCaret();
    this.repaintScrollbar();
  }

  /**
   * 重绘背景层（灰底 + A4 白纸，考虑滚动条占用）
   */
  private repaintBackground(): void {
    const bgCtx = this._bgH5Canvas?.getContext('2d');
    if (!bgCtx) {
      return;
    }
    // 更新滚动条尺寸（假设内容区域比视口大，需要滚动条）
    const contentWidth = Orion.A4_WIDTH * this._scale + 100;
    const contentHeight = Orion.A4_HEIGHT * this._scale + Orion.PAPER_TOP_MARGIN * 2;
    this._scrollbar.setDimensions(this._width, this._height, contentWidth, contentHeight);
    this._scrollbar.setScroll(this._scrollbar.scrollLeft, this._scrollbar.scrollTop);

    const gray = '#e0e0e0';
    const white = '#ffffff';
    const topMargin = Orion.PAPER_TOP_MARGIN;
    const a4W = Orion.A4_WIDTH * this._scale;
    const a4H = Orion.A4_HEIGHT * this._scale;

    // 可用宽度（扣除垂直滚动条）
    const availableWidth = this._scrollbar.getAvailableWidth();
    const a4Left = (availableWidth - a4W) / 2;
    const a4Top = topMargin - this._scrollbar.scrollTop;

    // 灰色背景填充整个 canvas
    bgCtx.fillStyle = gray;
    bgCtx.fillRect(0, 0, this._width, this._height);

    // A4 白纸（考虑滚动偏移）
    bgCtx.fillStyle = white;
    bgCtx.fillRect(a4Left, a4Top, a4W, a4H);

    // 绘制纸张四个方向的边角线（标识页边距）
    this.drawPaperMarginCorners(bgCtx, a4Left, a4Top, a4W, a4H);
  }

  /**
   * 绘制纸张四个方向的边角线（L 形标识页边距）
   * @param ctx 背景层上下文
   * @param paperLeft 纸张左边界
   * @param paperTop 纸张上边界
   * @param paperWidth 纸张宽度
   * @param paperHeight 纸张高度
   */
  private drawPaperMarginCorners(
    ctx: CanvasRenderingContext2D,
    paperLeft: number,
    paperTop: number,
    paperWidth: number,
    paperHeight: number
  ): void {
    const marginH = Orion.PAPER_MARGIN_HORIZONTAL * this._scale;
    const marginV = Orion.PAPER_MARGIN_VERTICAL * this._scale;
    const lineLen = Orion.CORNER_LINE_LENGTH;
    const lineColor = '#cccccc';

    // 边距线的位置（物理像素）
    const leftMarginX = paperLeft + marginH;
    const rightMarginX = paperLeft + paperWidth - marginH;
    const topMarginY = paperTop + marginV;
    const bottomMarginY = paperTop + paperHeight - marginV;

    // 像素对齐：将坐标调整到半像素位置 (x.5)，确保 1px 线条清晰
    // 对于物理像素坐标，需要考虑 DPR
    const snap = (value: number) => Math.floor(value * this._dpr) / this._dpr + 0.5 / this._dpr;

    const leftX = snap(leftMarginX);
    const rightX = snap(rightMarginX);
    const topY = snap(topMarginY);
    const bottomY = snap(bottomMarginY);

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();

    // 左上角 ┘（向左、向上）
    ctx.moveTo(leftX, topY);
    ctx.lineTo(leftX - lineLen, topY); // 横线向左
    ctx.moveTo(leftX, topY);
    ctx.lineTo(leftX, topY - lineLen); // 竖线向上

    // 右上角 └（向右、向上）
    ctx.moveTo(rightX, topY);
    ctx.lineTo(rightX + lineLen, topY); // 横线向右
    ctx.moveTo(rightX, topY);
    ctx.lineTo(rightX, topY - lineLen); // 竖线向上

    // 左下角 ┐（向左、向下）
    ctx.moveTo(leftX, bottomY);
    ctx.lineTo(leftX - lineLen, bottomY); // 横线向左
    ctx.moveTo(leftX, bottomY);
    ctx.lineTo(leftX, bottomY + lineLen); // 竖线向下

    // 右下角 ┌（向右、向下）
    ctx.moveTo(rightX, bottomY);
    ctx.lineTo(rightX + lineLen, bottomY); // 横线向右
    ctx.moveTo(rightX, bottomY);
    ctx.lineTo(rightX, bottomY + lineLen); // 竖线向下

    ctx.stroke();
  }

  /**
   * 从离屏 canvas 重绘内容层（整个视口，考虑滚动偏移）
   */
  private repaintContentFromOffscreen(): void {
    const contentCtx = this._orionH5Canvas?.getContext('2d');
    if (!contentCtx) {
      return;
    }
    contentCtx.clearRect(0, 0, this._width, this._height);
    // TODO: 根据 scrollTop / scrollLeft 从离屏 canvas blit 可见区域
    // 这里暂时绘制临时示例内容
    const topMargin = Orion.PAPER_TOP_MARGIN;
    const a4W = Orion.A4_WIDTH * this._scale;
    const availableWidth = this._scrollbar.getAvailableWidth();
    const a4Left = (availableWidth - a4W) / 2;
    const a4Top = topMargin - this._scrollbar.scrollTop;
    const textX = a4Left + Orion.PAPER_MARGIN_HORIZONTAL;
    const textY = a4Top + Orion.PAPER_MARGIN_VERTICAL + 4;
    const lineHeight = 24;
    const line1 = 'Orion 病历编辑器';
    const line2 = '（视口更新管线 + 滚动条）';
    contentCtx.fillStyle = '#333333';
    contentCtx.font = '16px sans-serif';
    contentCtx.textBaseline = 'top';
    contentCtx.textAlign = 'left';
    contentCtx.fillText(line1, textX, textY);
    contentCtx.fillText(line2, textX, textY + lineHeight);
  }

  /**
   * 重绘选区层（考虑滚动偏移）
   * 使用混合模式确保选区颜色深时文字依然清晰可见
   */
  private repaintSelection(): void {
    const selectionCtx = this._selectionH5Canvas?.getContext('2d');
    if (!selectionCtx) {
      return;
    }
    selectionCtx.clearRect(0, 0, this._width, this._height);
    // TODO: 根据当前选区数据绘制选区
    // 这里暂时绘制第一行选中示例
    const topMargin = Orion.PAPER_TOP_MARGIN;
    const a4W = Orion.A4_WIDTH * this._scale;
    const availableWidth = this._scrollbar.getAvailableWidth();
    const a4Left = (availableWidth - a4W) / 2;
    const a4Top = topMargin - this._scrollbar.scrollTop;
    const textX = a4Left + Orion.PAPER_MARGIN_HORIZONTAL;
    const textY = a4Top + Orion.PAPER_MARGIN_VERTICAL + 4;
    const lineHeight = 24;
    const line1 = 'Orion 病历编辑器';
    selectionCtx.font = '16px sans-serif';
    const line1Width = selectionCtx.measureText(line1).width;
    const selectionY = textY - 4;

    // 方案1：使用混合模式（推荐）- 让选区颜色与下方文字混合而非遮挡
    selectionCtx.save();
    selectionCtx.globalCompositeOperation = 'multiply'; // 正片叠底，颜色变暗但文字清晰
    selectionCtx.fillStyle = 'rgba(0, 120, 215, 0.4)'; // 可以使用更深的颜色
    selectionCtx.fillRect(textX, selectionY, line1Width, lineHeight);
    selectionCtx.restore();
  }

  /**
   * 重绘交互层（hover、高亮、对齐辅助线、拖拽框等）
   */
  private repaintOverlay(): void {
    const interactionCtx = this._interactionH5Canvas?.getContext('2d');
    if (!interactionCtx) {
      return;
    }
    interactionCtx.clearRect(0, 0, this._width, this._height);
    // TODO: 根据当前交互状态绘制交互层内容
  }

  /**
   * 重绘光标层（考虑滚动偏移）
   */
  private repaintCaret(): void {
    // 更新光标位置（临时：第二行末尾）
    const topMargin = Orion.PAPER_TOP_MARGIN;
    const a4W = Orion.A4_WIDTH * this._scale;
    const availableWidth = this._scrollbar.getAvailableWidth();
    const a4Left = (availableWidth - a4W) / 2;
    const a4Top = topMargin - this._scrollbar.scrollTop;
    const textX = a4Left + Orion.PAPER_MARGIN_HORIZONTAL;
    const textY = a4Top + Orion.PAPER_MARGIN_VERTICAL + 4;
    const lineHeight = 24;
    const line2 = '（视口更新管线 + 滚动条）';
    const ctx = this._orionH5Canvas?.getContext('2d');
    if (ctx) {
      ctx.font = '16px sans-serif';
      const line2Width = ctx.measureText(line2).width;
      this._cursorX = textX + line2Width;
      this._cursorY = textY + lineHeight;
      this._cursorHeight = lineHeight;
    }
    this.paintCaretLayer();
  }

  /**
   * 重绘滚动条层（垂直 + 水平滚动条）
   */
  private repaintScrollbar(): void {
    const scrollbarCtx = this._scrollbarH5Canvas?.getContext('2d');
    if (!scrollbarCtx) {
      return;
    }
    scrollbarCtx.clearRect(0, 0, this._width, this._height);
    this._scrollbar.draw(scrollbarCtx, this._width, this._height);
  }

  /** A4 纸张尺寸（96dpi 下的像素值） */
  private static readonly A4_WIDTH = 794;
  private static readonly A4_HEIGHT = 1123;
  /** 白色纸张与灰色背景之间的上边距（像素） */
  private static readonly PAPER_TOP_MARGIN = 24;
  /** 纸张页边距（打印边距）- 上下边距 2.54cm ≈ 96px，左右边距 3.18cm ≈ 120px */
  private static readonly PAPER_MARGIN_VERTICAL = 96; // 2.54cm
  private static readonly PAPER_MARGIN_HORIZONTAL = 120; // 3.18cm
  /** 边角线长度（px） */
  private static readonly CORNER_LINE_LENGTH = 25;

  /** 仅清空并重绘光标层（用于闪烁） */
  private paintCaretLayer() {
    const ctx = this._caretH5Canvas?.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, this._width, this._height);
    if (this._caretBlinkOn && this._focus) {
      ctx.fillStyle = 'black';
      ctx.fillRect(this._cursorX, this._cursorY - 4, 1, this._cursorHeight);
    }
  }

  /** 光标闪烁动画循环（500ms 切换一次，仅重绘光标层） */
  private animateCaret(timestamp: number) {
    if (timestamp - this._caretLastToggle > 500) {
      this._caretBlinkOn = !this._caretBlinkOn;
      this._caretLastToggle = timestamp;
      this.paintCaretLayer();
    }
    this._caretAnimationFrameId = requestAnimationFrame(this.animateCaret.bind(this));
  }

  /** 启动光标闪烁（requestAnimationFrame，仅启动一次） */
  private startCaretBlinkTimer() {
    if (this._caretAnimationFrameId !== null) {
      return;
    }
    this._caretAnimationFrameId = requestAnimationFrame(this.animateCaret.bind(this));
  }

  /** 停止光标闪烁 */
  private stopCaretBlinkTimer() {
    if (this._caretAnimationFrameId !== null) {
      cancelAnimationFrame(this._caretAnimationFrameId);
      this._caretAnimationFrameId = null;
    }
  }

  /**
   * 获取浏览器设备像素比
   * @returns 设备像素比
   */
  private getDpr() {
    return window.devicePixelRatio;
  }

  /**
   * 获取浏览器视口宽度
   * @returns 视口宽度
   */
  private getViewPortWidth() {
    return this._parentElement && this._parentElement !== document.body
      ? this._parentElement.clientWidth
      : document.documentElement.clientWidth || document.body.clientWidth;
  }

  /**
   * 获取浏览器视口高度
   * @returns 视口高度
   */
  private getViewPortHeight() {
    return this._parentElement && this._parentElement !== document.body
      ? this._parentElement.clientHeight
      : document.documentElement.clientHeight || document.body.clientHeight;
  }

  /**
   * 获取浏览器视口左偏移量
   * @returns 左偏移量
   */
  private getAdjustLeft() {
    let vLeft = (this.getViewPortWidth() - this._width) / 2;
    if (this._loaded && vLeft < this._parentElement.clientLeft) {
      vLeft = this._parentElement.clientLeft;
    }
    return vLeft;
  }

  /**
   * 释放编辑器资源
   */
  dispose(): void {
    this.stopCaretBlinkTimer();
    this.removeEvent();
    this._dirtyManager.dispose();
    this._parentResizeObserver?.disconnect();
    this._parentResizeObserver = null;
    this._application?.dispose();
    this._application = null;
    this._loaded = false;
    // 移除所有canvas
    this._bgH5Canvas.remove();
    this._orionH5Canvas.remove();
    this._selectionH5Canvas.remove();
    this._interactionH5Canvas.remove();
    this._caretH5Canvas.remove();
    this._scrollbarH5Canvas.remove();
    this._offscreenH5Canvas.remove();
    this._tempH5Canvas.remove();
  }

  /**
   * 设置编辑器父元素
   * @param element 编辑器父元素
   */
  set parentElement(element: HTMLElement) {
    if (element && this._parentElement !== element) {
      this._parentElement = element;
      // 生成实例ID
      this.instanceID = Date.now();
      // 创建背景层
      this._bgH5Canvas = document.createElement('canvas');
      this._bgH5Canvas.setAttribute('id', `bg-h5-canvas-${this.instanceID}`);
      this._bgH5Canvas.width = this._width;
      this._bgH5Canvas.height = this._height;
      this._bgH5Canvas.style.position = 'absolute';
      this._bgH5Canvas.tabIndex = -1;
      this._bgH5Canvas.style.zIndex = '1';
      this._bgH5Canvas.style.outline = 'none';
      this._bgCanvas = new OrionCanvas(this, this._bgH5Canvas.getContext('2d') as CanvasRenderingContext2D);
      // 创建内容层
      this._orionH5Canvas = document.createElement('canvas');
      this._orionH5Canvas.setAttribute('id', `orion-h5-canvas-${this.instanceID}`);
      this._orionH5Canvas.width = this._width;
      this._orionH5Canvas.height = this._height;
      this._orionH5Canvas.style.position = 'absolute';
      this._orionH5Canvas.tabIndex = -1;
      this._orionH5Canvas.style.zIndex = '2';
      this._orionH5Canvas.style.outline = 'none';
      this._orionCanvas = new OrionCanvas(this, this._orionH5Canvas.getContext('2d') as CanvasRenderingContext2D);

      // 创建选区层
      this._selectionH5Canvas = document.createElement('canvas');
      this._selectionH5Canvas.setAttribute('id', `selection-h5-canvas-${this.instanceID}`);
      this._selectionH5Canvas.width = this._width;
      this._selectionH5Canvas.height = this._height;
      this._selectionH5Canvas.style.position = 'absolute';
      this._selectionH5Canvas.tabIndex = -1;
      this._selectionH5Canvas.style.zIndex = '3';
      this._selectionH5Canvas.style.outline = 'none';
      this._selectionH5Canvas.style.pointerEvents = 'none';
      this._selectionCanvas = new OrionCanvas(
        this,
        this._selectionH5Canvas.getContext('2d') as CanvasRenderingContext2D
      );

      // 创建交互层
      this._interactionH5Canvas = document.createElement('canvas');
      this._interactionH5Canvas.setAttribute('id', `interaction-h5-canvas-${this.instanceID}`);
      this._interactionH5Canvas.width = this._width;
      this._interactionH5Canvas.height = this._height;
      this._interactionH5Canvas.style.position = 'absolute';
      this._interactionH5Canvas.tabIndex = -1;
      this._interactionH5Canvas.style.zIndex = '4';
      this._interactionH5Canvas.style.outline = 'none';
      this._interactionH5Canvas.style.pointerEvents = 'none';
      this._interactionCanvas = new OrionCanvas(
        this,
        this._interactionH5Canvas.getContext('2d') as CanvasRenderingContext2D
      );

      // 创建光标层
      this._caretH5Canvas = document.createElement('canvas');
      this._caretH5Canvas.setAttribute('id', `caret-h5-canvas-${this.instanceID}`);
      this._caretH5Canvas.width = this._width;
      this._caretH5Canvas.height = this._height;
      this._caretH5Canvas.style.position = 'absolute';
      this._caretH5Canvas.tabIndex = -1;
      this._caretH5Canvas.style.zIndex = '5';
      this._caretH5Canvas.style.outline = 'none';
      this._caretH5Canvas.style.pointerEvents = 'none';
      this._caretCanvas = new OrionCanvas(this, this._caretH5Canvas.getContext('2d') as CanvasRenderingContext2D);

      // 创建滚动条层
      this._scrollbarH5Canvas = document.createElement('canvas');
      this._scrollbarH5Canvas.setAttribute('id', `scrollbar-h5-canvas-${this.instanceID}`);
      this._scrollbarH5Canvas.width = this._width;
      this._scrollbarH5Canvas.height = this._height;
      this._scrollbarH5Canvas.style.position = 'absolute';
      this._scrollbarH5Canvas.tabIndex = -1;
      this._scrollbarH5Canvas.style.zIndex = '999';
      this._scrollbarH5Canvas.style.outline = 'none';
      this._scrollbarH5Canvas.style.pointerEvents = 'auto';
      this._scrollbarCanvas = new OrionCanvas(
        this,
        this._scrollbarH5Canvas.getContext('2d') as CanvasRenderingContext2D
      );

      // 创建离屏渲染canvas
      this._offscreenH5Canvas = document.createElement('canvas');
      this._offscreenCanvas = new OrionCanvas(
        this,
        this._offscreenH5Canvas.getContext('2d') as CanvasRenderingContext2D
      );
      // 将所有canvas添加到父元素中
      element.appendChild(this._bgH5Canvas);
      element.appendChild(this._orionH5Canvas);
      element.appendChild(this._selectionH5Canvas);
      element.appendChild(this._interactionH5Canvas);
      element.appendChild(this._caretH5Canvas);
      element.appendChild(this._scrollbarH5Canvas);
      // 重置编辑器尺寸
      this.resize();
      // 绑定事件
      this.bindEvent();
    }
  }

  set autoWidth(t: boolean) {
    if (this._autoWidth !== t) {
      this._autoWidth = t;
      this.resize();
    }
  }

  set autoHeight(t: boolean) {
    if (this._autoHeight !== t) {
      this._autoHeight = t;
      this.resize();
    }
  }

  set mode(mode: string) {
    if (this._mode !== mode) {
      this._mode = mode;
    }
  }

  get mode(): string {
    return this._mode;
  }

  get parentElement(): HTMLElement {
    return this._parentElement;
  }

  get scale(): number {
    return this._scale;
  }

  get dpi(): number {
    return this._dpi;
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get ime(): Ime {
    return this._ime;
  }

  /**
   * 获取应用
   * @returns 应用
   */
  get application(): Application {
    if (!this._application) {
      this._application = new Application(this);
    }
    return this._application;
  }
}
