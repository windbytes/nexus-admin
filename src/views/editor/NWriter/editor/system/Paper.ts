import { PaperSizeType } from './constants';

/**
 * 纸张类，用于管理纸张的尺寸、方向、边距等
 */
export class Paper {
  /**
   * 纸张，默认A4纸张
   */
  private _size: number;
  /**
   * 纸张宽度，单位cm
   */
  private _width: number;
  /**
   * 纸张高度，单位cm
   */
  private _height: number;
  /**
   * 纸张方向，默认portrait
   */
  private _orientation: 'portrait' | 'landscape';
  /**
   * 纸张边距，单位cm
   */
  private _marginLeft: number;
  /**
   * 纸张右边距，单位cm
   */
  private _marginRight: number;
  /**
   * 纸张上边距，单位cm
   */
  private _marginTop: number;
  /**
   * 纸张下边距，单位cm
   */
  private _marginBottom: number;

  // 换算的px宽高边距
  private _pxWidth: number;
  private _pxHeight: number;
  private _pxMarginLeft: number;
  private _pxMarginRight: number;
  private _pxMarginTop: number;
  private _pxMarginBottom: number;

  constructor() {
    this._size = PaperSizeType.A4;
    this._width = 0;
    this._height = 0;
    this._orientation = 'portrait';
    this._marginLeft = 0;
    this._marginRight = 0;
    this._marginTop = 0;
    this._marginBottom = 0;
    this._pxWidth = 0;
    this._pxHeight = 0;
    this._pxMarginLeft = 0;
    this._pxMarginRight = 0;
    this._pxMarginTop = 0;
    this._pxMarginBottom = 0;
  }

  /**
   * 设置纸张尺寸
   * @param size 纸张尺寸
   */
  setSize(size: number) {
    if (this._size === size) {
      return;
    }
    this._size = size;
  }

  /**
   * 设置纸张宽度
   * @param width 纸张宽度
   */
  setWidth(width: number) {}

  /**
   * 设置纸张高度
   * @param height 纸张高度
   */
  setHeight(height: number) {}

  /**
   * 设置纸张方向
   * @param orientation 纸张方向
   */
  setOrientation(orientation: 'portrait' | 'landscape') {}

  /**
   * 设置纸张左边距
   * @param marginLeft 纸张左边距
   */
  setMarginLeft(marginLeft: number) {}

  /**
   * 设置纸张右边距
   * @param marginRight 纸张右边距
   */
  setMarginRight(marginRight: number) {}

  /**
   * 设置纸张上边距
   * @param marginTop 纸张上边距
   */
  setMarginTop(marginTop: number) {}

  /**
   * 设置纸张下边距
   * @param marginBottom 纸张下边距
   */
  setMarginBottom(marginBottom: number) {}

  get size(): number {
    return this._size;
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get orientation(): 'portrait' | 'landscape' {
    return this._orientation;
  }

  get marginLeft(): number {
    return this._marginLeft;
  }

  get marginRight(): number {
    return this._marginRight;
  }

  get marginTop(): number {
    return this._marginTop;
  }

  get marginBottom(): number {
    return this._marginBottom;
  }

  get pxWidth(): number {
    return this._pxWidth;
  }

  get pxHeight(): number {
    return this._pxHeight;
  }

  get pxMarginLeft(): number {
    return this._pxMarginLeft;
  }

  get pxMarginRight(): number {
    return this._pxMarginRight;
  }

  get pxMarginTop(): number {
    return this._pxMarginTop;
  }

  get pxMarginBottom(): number {
    return this._pxMarginBottom;
  }

  set size(value: number) {
    this.setSize(value);
  }

  set width(value: number) {
    this.setWidth(value);
  }

  set height(value: number) {
    this.setHeight(value);
  }

  set orientation(value: 'portrait' | 'landscape') {
    this.setOrientation(value);
  }

  set marginLeft(value: number) {
    this.setMarginLeft(value);
  }

  set marginRight(value: number) {
    this.setMarginRight(value);
  }

  set marginTop(value: number) {
    this.setMarginTop(value);
  }

  set marginBottom(value: number) {
    this.setMarginBottom(value);
  }
}
