// @ts-nocheck
import type { Control } from '../controls/Control';

/**
 * 光标对象
 */
export class Caret {
  // 光标控制器
  private control: Control | null;

  private left: number;
  private top: number;
  private width: number;
  private height: number;
  private color: string;
  private visible: boolean;

  constructor() {
    this.control = null;
    this.left = 0;
    this.top = 0;
    this.width = 1;
    this.height = 16;
    this.color = '#000';
    this.visible = false;
  }
}
