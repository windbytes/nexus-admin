import { Caret } from '../cursor/Caret';
import { Ime } from '../cursor/Ime';
import { OrionCanvas } from '../draw/Graphics';

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

  // 更新计数
  private _updateCount: number;

  // 背景层 页面背景、页边距区域、页码底色、水印、分页分隔线
  private _bgH5Canvas: HTMLCanvasElement | null;
  private _bgCanvas: OrionCanvas | null;

  // 内容层 文本、表格、图片、公式、图表、修订痕迹等
  private _orionH5Canvas: HTMLCanvasElement | null; // 编辑器绘制canvas
  private _orionCanvas: OrionCanvas | null; // 编辑器绘制canvas包装

  // 选区层 选区、控件选中等
  private _selectionH5Canvas: HTMLCanvasElement | null;
  private _selectionCanvas: OrionCanvas | null;

  // 交互层 hover效果、高亮、命中提示、对其辅助线、拖拽框等
  private _interactionH5Canvas: HTMLCanvasElement | null;
  private _interactionCanvas: OrionCanvas | null;

  // 光标层
  private _caretH5Canvas: HTMLCanvasElement | null;
  private _caretCanvas: OrionCanvas | null;

  // 离屏渲染使用的canvas 用于提高绘制性能使用
  private _offscreenH5Canvas: HTMLCanvasElement | null;
  private _offscreenCanvas: OrionCanvas | null;
  private _caret: Caret;

  // 父元素的监听器对象
  private _parentResizeObserver: ResizeObserver | null;

  constructor() {
    this.instanceID = 0;
    this._mode = '';
    this._focus = false;
    this._scale = 1;
    this._dpi = 1;

    this._ime = new Ime();

    this._orionH5Canvas = null;
    this._orionCanvas = null;
    this._offscreenH5Canvas = null;
    this._offscreenCanvas = null;
    this._parentResizeObserver = null;
    this._updateCount = 0;
    this._caret = new Caret();
    this._width = 1450;
    this._height = 658;
  }

  /**
   * 移除编辑器的容器元素绑定的事件
   */
  removeEvent() {}

  /**
   * 给编辑器的容器元素绑定事件
   */
  bindEvent() {
    this.removeEvent();
    if (this._parentElement) {
      // 绑定键盘事件、焦点、鼠标、拖拽、复制粘贴、鼠标滚动等，统一处理绑定到容器上，内部进行转发到不同的层
    }
  }

  /**
   * 调整编辑器尺寸
   */
  resize() {
    if (this._parentElement) {
      // 开始计数更新
    }
  }

  /**
   * 更新计数累加
   */
  beginUpdate() {}

  /**
   * 更新计数累减
   */
  endUpdate() {}

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
}
