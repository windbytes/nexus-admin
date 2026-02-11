import type { NW } from '../core/NW';
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

  constructor(nw: NW) {
    super(nw);
    this.container = nw.parentElement;
    // 代理光标绘制
    const agentCursorDom = document.createElement('textarea');
    agentCursorDom.autocomplete = 'off';
    agentCursorDom.classList.add('nw-inputarea');
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
