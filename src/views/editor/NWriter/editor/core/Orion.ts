import { Caret } from '../cursor/Caret';
import { Ime } from '../cursor/Ime';
import { OrionCanvas } from '../draw/Graphics';
import { Application } from './Application';
import { Rect } from './Rect';

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

  // 内容层 文本、表格、图片、公式、图表、修订痕迹等
  private _orionH5Canvas!: HTMLCanvasElement; // 编辑器绘制canvas
  private _orionCanvas!: OrionCanvas; // 编辑器绘制canvas包装

  // 选区层 选区、控件选中等
  private _selectionH5Canvas!: HTMLCanvasElement;
  private _selectionCanvas!: OrionCanvas;

  // 交互层 hover效果、高亮、命中提示、对其辅助线、拖拽框等
  private _interactionH5Canvas!: HTMLCanvasElement;
  private _interactionCanvas!: OrionCanvas;

  // 光标层
  private _caretH5Canvas!: HTMLCanvasElement;
  private _caretCanvas!: OrionCanvas;

  // 离屏渲染使用的canvas 用于提高绘制性能使用
  private _offscreenH5Canvas!: HTMLCanvasElement;
  private _offscreenCanvas!: OrionCanvas;

  // 一个临时canvas，用于字体测量等相关操作
  private _tempH5Canvas: HTMLCanvasElement;
  private _tempCanvas: OrionCanvas;

  private _caret: Caret;

  // canvas最小宽度
  private _minWidth: number;

  // 父元素的监听器对象
  private _parentResizeObserver: ResizeObserver | null;

  // 应用
  private _application: Application | null;

  // 是否加载完成
  private _loaded: boolean;

  /** 光标位置（临时实现用于闪烁绘制） */
  private _cursorX: number = 0;
  private _cursorY: number = 0;
  private _cursorHeight: number = 20;
  /** 光标闪烁是否显示 */
  private _caretBlinkOn: boolean = true;
  private _caretBlinkTimerId: ReturnType<typeof setInterval> | null = null;

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
    this._width = 1450;
    this._height = 658;
    this._application = null;
    this._tempH5Canvas = document.createElement('canvas');
    this._tempCanvas = new OrionCanvas(this, this._tempH5Canvas.getContext('2d') as CanvasRenderingContext2D);
    this._loaded = false;
  }

  /**
   * 运行应用
   */
  applicationRun() {
    if (!this._parentElement) {
      this._parentElement = document.body;
    }
    this.resize();
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
      console.log('bindEvent');
      this.parentElement.addEventListener('resize', this.parentResize.bind(this));
    }
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
      } finally {
        this.endUpdate();
      }
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
   * 更新整个编辑器
   */
  private update() {
    this._updateCount > 0 || this.paint(Rect.createByBounds(0, 0, this.width, this.height));
  }

  /**
   * 更新指定区域
   * @param t 更新区域
   */
  private updateRect(t: Rect) {
    this._updateCount > 0 ||
      // (this.brower === Miss_Ed ? this._paint(t) : this._paint(t.inFlate(this.theme.shadow, this.theme.shadow, true)));
      this.paint(t);
  }

  /** A4 纸张尺寸（96dpi 下的像素值） */
  private static readonly A4_WIDTH = 794;
  private static readonly A4_HEIGHT = 1123;
  /** 白色纸张与灰色背景之间的上边距（像素） */
  private static readonly PAPER_TOP_MARGIN = 24;

  /**
   * 绘制指定区域（临时实现：背景层页面背景；内容层两行文字；选区层第一行选中；光标层第二行末闪烁光标）
   * @param _t 绘制区域（临时实现未做区域裁剪）
   */
  private paint(_t: Rect) {
    const bgCtx = this._bgH5Canvas?.getContext('2d');
    if (!bgCtx) {
      return;
    }

    const gray = '#e0e0e0';
    const white = '#ffffff';
    const topMargin = Orion.PAPER_TOP_MARGIN;
    const a4W = Orion.A4_WIDTH * this._scale;
    const a4H = Orion.A4_HEIGHT * this._scale;
    const a4Left = (this._width - a4W) / 2;
    const a4Top = topMargin;
    const lineHeight = 24;

    // 背景层：灰色页面背景 + 居中 A4 白纸（上边距）
    bgCtx.fillStyle = gray;
    bgCtx.fillRect(0, 0, this._width, this._height);
    bgCtx.fillStyle = white;
    bgCtx.fillRect(a4Left, a4Top, a4W, a4H);

    const textX = a4Left + 40;
    const textY = a4Top + 40;
    const line1 = 'Orion 病历编辑器';
    const line2 = '(临时绘制：灰底 + A4 白纸区域)';

    // 内容层：两行文字
    const contentCtx = this._orionH5Canvas?.getContext('2d');
    let line1Width = 0;
    let line2Width = 0;
    if (contentCtx) {
      contentCtx.fillStyle = '#333333';
      contentCtx.font = '16px sans-serif';
      contentCtx.textAlign = 'left';
      contentCtx.fillText(line1, textX, textY);
      contentCtx.fillText(line2, textX, textY + lineHeight);
      line1Width = contentCtx.measureText(line1).width;
      line2Width = contentCtx.measureText(line2).width;
    }

    // 选区层：第一行文本选中状态（浅蓝色）
    const selectionCtx = this._selectionH5Canvas?.getContext('2d');
    if (selectionCtx) {
      selectionCtx.fillStyle = 'rgba(173, 216, 230, 0.45)';
      selectionCtx.fillRect(textX, textY - 4, line1Width, lineHeight);
    }

    // 光标层：第二行末尾闪烁光标（位置在 paint 中写入，闪烁由定时器驱动）
    this._cursorX = textX + line2Width;
    this._cursorY = textY + lineHeight;
    this._cursorHeight = lineHeight;
    this.paintCaretLayer();
    this.startCaretBlinkTimer();
  }

  /** 仅重绘光标层（用于闪烁） */
  private paintCaretLayer() {
    const ctx = this._caretH5Canvas?.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, this._width, this._height);
    if (this._caretBlinkOn) {
      ctx.fillStyle = '#333333';
      ctx.fillRect(this._cursorX, this._cursorY - 4, 1, this._cursorHeight);
    }
  }

  /** 启动光标闪烁定时器（仅启动一次） */
  private startCaretBlinkTimer() {
    if (this._caretBlinkTimerId !== null) {
      return;
    }
    this._caretBlinkTimerId = setInterval(() => {
      this._caretBlinkOn = !this._caretBlinkOn;
      this.paintCaretLayer();
    }, 530);
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
