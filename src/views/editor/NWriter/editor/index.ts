import { Orion } from './core/Orion';
import { I18n } from './i18n';

export interface OrionEditorOptions {
  /** 画布与 A4 的缩放比例，默认 1.0 */
  scale?: number;
  /** 国际化语言，默认 en */
  locale?: string;
}

/**
 * Orion 病历编辑器：接收外层包裹 div，负责 canvas 创建与绘制
 */
export class OrionEditor {
  private options: Required<OrionEditorOptions>;
  private canvas: HTMLCanvasElement | null = null;

  /** 编辑器核心 */
  private _orion: Orion;

  /** 国际化 */
  private _i18n: I18n;

  constructor(container: HTMLDivElement, options: OrionEditorOptions = {}) {
    this.options = {
      scale: options.scale ?? 1,
      locale: options.locale ?? 'en',
    };

    // 初始化编辑器核心
    this._orion = new Orion();

    // 初始化国际化
    this._i18n = new I18n(this.options.locale);

    // 设置一些全局的配置。例如历史记录管理器、插件管理器、命令管理器等
    // @TODO

    // 设置容器元素
    this.setContainer(container);

    // 注册右键菜单
    this.registerContextMenu();

    // 启动应用
    this._orion.application.run();
    // 设置自动布局：宽高随容器撑满
    this._orion.autoWidth = true;
    this._orion.autoHeight = true;
  }

  /**
   * 设置容器元素
   * @param container 容器元素
   */
  private setContainer(container: HTMLDivElement | string) {
    if (typeof container === 'string') {
      this._orion.parentElement = document.querySelector(container) as HTMLElement;
    } else {
      this._orion.parentElement = container;
    }
  }

  /**
   * 注册右键菜单
   */
  private registerContextMenu() {
    // @TODO
  }
}
