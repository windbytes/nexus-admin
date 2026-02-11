/**
 * 编辑器核心，统一管理贯穿编辑器全文的工具或者状态
 * 例如：输入、光标、存储、剪贴板
 *      聚焦状态、统一的事件管理转发等等
 */
export class NW {
  private instanceID: string; // 编辑器实例ID，用于标识编辑器实例
  private _mode: string; // 编辑器模式，用于标识编辑器模式
  private _focus: boolean; // 编辑器焦点状态，用于标识编辑器焦点状态
  private _parentElement!: HTMLElement; // 编辑器父元素，用于标识编辑器父元素
  private _scale: number; // 编辑器缩放比例，用于标识编辑器缩放比例
  private _dpi: number; // 编辑器分辨率，用于标识编辑器分辨率
  private _nwHCanvas: HTMLCanvasElement | null; // 编辑器绘制canvas

  constructor() {
    this.instanceID = '';
    this._mode = '';
    this._focus = false;
    this._scale = 1;
    this._dpi = 1;
    this._nwHCanvas = null;
  }

  /**
   * 设置编辑器父元素
   * @param element 编辑器父元素
   */
  set parentElement(element: HTMLElement) {
    if (element && this._parentElement !== element) {
      this._parentElement = element;
      // 生成实例ID
      // 创建绘制canvas
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
}
