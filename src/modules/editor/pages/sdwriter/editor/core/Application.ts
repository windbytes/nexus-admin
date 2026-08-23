// @ts-nocheck
import type { Orion } from './Orion';
import { TObject } from './TObject';

/**
 * 应用类，负责管理编辑器应用的生命周期
 */
export class Application extends TObject {
  private _updateCount: number;
  private _running: boolean;

  constructor(orion: Orion) {
    super(orion);
    this._updateCount = 0;
    this._running = false;
  }

  /**
   * 运行应用
   */
  public run() {
    this.orion.applicationRun();
    this._running = true;
  }

  get runing(): boolean {
    return this._running;
  }

  dispose(): void {
    this._running = false;
  }
}
