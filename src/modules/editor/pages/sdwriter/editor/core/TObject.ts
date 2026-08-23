// @ts-nocheck
import type { Orion } from './Orion';

/**
 * 基础类，所有类的基类
 */
export class TObject {
  // 编辑器核心
  private _orion: Orion;

  constructor(orion: Orion) {
    this._orion = orion;
  }

  get orion() {
    return this._orion;
  }
}
