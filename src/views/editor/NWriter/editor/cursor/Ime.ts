import type { Control } from '../controls/Control';
import type { Orion } from '../core/Orion';
import { Point } from '../core/Point';
import { ImeMode } from '../system/constants';

/**
 * 光标代理
 * 负责处理输入、键盘事件等操作
 */
export class Ime {
  // 代理光标输入的dom元素
  private agentCursorDom: HTMLTextAreaElement;

  private _control: Control | null;

  // 是否激活状态
  private _active: boolean;

  // 输入法变化事件
  private onCompositionUpdate: ((event: Event) => void) | null;

  constructor() {
    // 代理光标绘制
    const agentCursorDom = document.createElement('textarea');
    agentCursorDom.autocomplete = 'off';
    agentCursorDom.classList.add('orion-inputarea');
    agentCursorDom.innerText = '';
    agentCursorDom.style.position = 'absolute';
    agentCursorDom.style.top = '0';
    agentCursorDom.style.left = '0';
    agentCursorDom.style.width = '10px';
    agentCursorDom.style.height = '10px';
    agentCursorDom.style.opacity = '0';
    agentCursorDom.style.pointerEvents = 'none';
    agentCursorDom.style.zIndex = '1000';
    this.agentCursorDom = agentCursorDom;
    this._control = null;

    this._active = false;

    // 部分事件处理
    // 聚焦
    this.agentCursorDom.onfocus = () => {
      this._doFocus();
    };
    // 失焦
    this.agentCursorDom.onblur = () => {
      this._doBlur();
    };
    // 输入开始
    this.agentCursorDom.addEventListener('compositionstart', () => {
      this.agentCursorDom.value = '';
    });
    // 输入更新
    this.agentCursorDom.addEventListener('compositionupdate', (event: CompositionEvent) => {
      this._doCompositionUpdate(event);
    });
    // 输入结束
    this.agentCursorDom.addEventListener('compositionend', (event: CompositionEvent) => {
      this._doInput(event.data);
    });
    // input
    this.agentCursorDom.oninput = (event: Event) => {
      if (!(event as InputEvent).isComposing) {
        this._doInput(this.agentCursorDom.value);
        this.agentCursorDom.value = '';
      }
    };
  }

  /**
   * 编辑器加载完成回调
   * @param orion 编辑器核心
   */
  _orionLoaded(orion: Orion) {
    orion.parentElement.appendChild(this.agentCursorDom);
  }

  /**
   * 编辑器卸载完成回调
   * @param orion 编辑器核心
   */
  _orionUnloaded(orion: Orion) {
    orion.parentElement.removeChild(this.agentCursorDom);
  }

  /**
   * 聚焦事件
   */
  _doFocus() {
    this._active = true;
  }

  /**
   * 失焦事件
   */
  _doBlur() {
    this._active = false;
    this._control = null;
  }

  /**
   * 输入事件
   * @param str 输入字符
   */
  _doInput(str: string) {
    this.agentCursorDom.value = '';
    this._control?.imeInput(str);
  }

  /**
   * 输入更新事件
   * @param event 输入事件
   */
  _doCompositionUpdate(event: CompositionEvent) {
    this.onCompositionUpdate?.(event);
  }

  killFocus() {
    this._doBlur();
  }

  /**
   * 更新尺寸
   * @param height 高度
   */
  updateSize(height: number) {
    if (!this._control) {
      return;
    }
    this.agentCursorDom.style.height = `${height}px`;
  }

  /**
   * 更新位置
   * @param left 左
   * @param top 上
   */
  updatePosition(left: number, top: number) {
    if (!this._control) {
      return;
    }
    const point: Point = this._control.clientToScreen(new Point(left, top));
    this.agentCursorDom.style.left = `${Math.max(0, Math.min(point.x, this._control.orion.width - this.agentCursorDom.offsetWidth))}px`;
    this.agentCursorDom.style.top = `${Math.max(0, Math.min(point.y, this._control.orion.height - this.agentCursorDom.offsetHeight))}px`;
  }

  /**
   * 设置控制器
   * @param control 控制器
   */
  setControl(control: Control) {
    if (this._control !== control) {
      this._control = control;
    } else {
      this._control = null;
    }
    if (this._control != null) {
      if (control.imeMode === ImeMode.disabled || this._active) {
        this.updateSize(16);
        this.agentCursorDom.focus();
        this._control.imeActive();
      }
    } else {
      this.agentCursorDom.value = '';
    }
  }

  /**
   * 移除控制器
   * @param control 控制器
   */
  removeControl(control: Control) {
    if (this._control === control) {
      this._control = null;
      this.agentCursorDom.value = '';
    }
  }

  get control() {
    return this._control;
  }
}
