import { Caret } from '../cursor/Caret';
import type { OrionCanvas } from './Graphics';

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
  private _dpi: number; // 编辑器分辨率，用于标识编辑器分辨率

  // 编辑器宽度
  private _width: number;
  // 编辑器高度
  private _height: number;

  // 更新计数
  private _updateCount: number;

  // 主画布绘制使用的canvas
  private _orionH5Canvas: HTMLCanvasElement | null; // 编辑器绘制canvas
  private _orionCanvas: OrionCanvas | null; // 编辑器绘制canvas包装

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
      // 绑定键盘事件、焦点、鼠标、拖拽、复制粘贴、鼠标滚动等
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
      // 创建绘制canvas
      // 创建离屏渲染canvas
      // 重置大小
      // 绑定事件
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
}
