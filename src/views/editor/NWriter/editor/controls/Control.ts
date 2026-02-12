import type { Orion } from '../core/Orion';
import { Rect } from '../core/Rect';
import { TObject } from '../core/TObject';

/**
 * 控制器类，例如控制鼠标事件、键盘事件
 * 会针对不同对象有不同的控制器，控制各自的行为
 * 例如图片控件类，可以控制点击的时候显示其放大预览图
 */
export class Control extends TObject {
  // 更新计数
  private _updateCount: number;
  // 记录位置
  private _left: number;
  private _top: number;
  private _width: number;
  private _height: number;

  // 记录可用状态
  private _enabled: boolean;
  private _visible: boolean;

  // 记录聚焦
  private _focused: boolean;

  // 记录父级
  private _parent: Control | null;

  constructor(orion: Orion) {
    super(orion);
    this._updateCount = 0;
    this._left = 0;
    this._top = 0;
    this._width = 100;
    this._height = 100;
    this._enabled = true;
    this._visible = true;
    this._focused = false;
    this._parent = null;
  }

  /**
   * 开始更新
   */
  beginUpdate() {
    this._updateCount++;
  }

  /**
   * 结束更新
   */
  endUpdate() {
    if (this._updateCount > 0) {
      this._updateCount--;
      if (this._updateCount === 0) {
        this.update();
      }
    }
  }

  clientRect() {
    return Rect.create(0, 0, this.width, this.height);
  }

  /**
   * 设置边界
   */
  _setBounds() {
    // 更新调整
  }

  /**
   * 设置父级
   * @param value 父级
   */
  _setParent(value: Control | null) {
    if (this._parent !== value) {
      if (this._parent !== null) {
        this._parent.removeControl(this);
      }
      if (value !== null) {
        value.addControl(this);
      } else {
        this._remove();
      }
    }
  }

  /**
   * 添加控制器
   * @param control 控制器
   */
  addControl(control: Control) {}

  /**
   * 移除控制器
   */
  _remove() {
    this.deactive();
    this._parent = null;
  }

  /**
   * 移除控制器
   * @param control 控制器
   */
  removeControl(control: Control) {}

  /**
   * 设置边界
   */
  _doSetBound() {
    if (this.parent !== null) {
      this.parent.reAlign();
    }
  }

  /**
   * 重新对齐
   */
  reAlign() {
    this.update();
  }

  /**
   * 取消激活状态
   * 取消聚焦的操作
   */
  deactive() {}

  /**
   * 更新
   */
  update() {
    // 子类实现
  }

  /**
   * 更新指定区域
   * @param rect 更新区域
   */
  updateRect(rect: Rect) {}

  get left() {
    return this._left;
  }

  get top() {
    return this._top;
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  get enabled() {
    return this._enabled;
  }

  get visible() {
    return this._visible;
  }

  get focused() {
    return this._focused;
  }

  get parent() {
    return this._parent;
  }

  set left(value: number) {
    if (this._left !== value) {
      this._left = value;
      this._setBounds();
    }
  }

  set top(value: number) {
    this._top = value;
  }

  set width(value: number) {
    this._width = value;
  }

  set height(value: number) {
    this._height = value;
  }

  set enabled(value: boolean) {
    this._enabled = value;
  }

  set visible(value: boolean) {
    this._visible = value;
  }

  set parent(value: Control | null) {
    this._setParent(value);
  }
}
