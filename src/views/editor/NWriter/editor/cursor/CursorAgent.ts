import type { Orion } from '../core/Orion';
import { TObject } from '../core/TObject';
/**
 * 光标代理
 * 负责处理输入、键盘事件等操作
 */
export class CursorAgent extends TObject {
  // 代理光标dom元素
  private agentCursorDom: HTMLTextAreaElement;
  // 光标所在容器
  private container: HTMLElement;

  constructor(orion: Orion) {
    super(orion);
    this.container = orion.parentElement;
    // 代理光标绘制
    const agentCursorDom = document.createElement('textarea');
    agentCursorDom.autocomplete = 'off';
    agentCursorDom.classList.add('orion-inputarea');
    agentCursorDom.innerText = '';
    this.container.appendChild(agentCursorDom);
    this.agentCursorDom = agentCursorDom;

    // 部分事件处理
    // 聚焦
    // 失焦
    // 输入开始
    // 输入结束
    // 输入更新
    // input
  }
}
