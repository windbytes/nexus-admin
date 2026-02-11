import type { NW } from './NW';

/**
 * 基础类，所有类的基类
 */
export class TObject {
  // 编辑器核心
  private _nw: NW;

  constructor(nw: NW) {
    this._nw = nw;
  }

  get nw() {
    return this._nw;
  }
}
