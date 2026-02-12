/**
 * 基础配置
 */
export interface BaseOptions {
  // 所属容器
  container: HTMLDivElement;
  // 编辑器宽度，默认100%
  width?: string | number;
  // 编辑器高度，默认100%
  height?: string | number;

  // 纸张类型，默认A4
  pageSize?:
    | 'A4'
    | 'A3'
    | 'A5'
    | 'B4'
    | 'B5'
    | 'Letter'
    | 'Legal'
    | 'Tabloid'
    | {
        width: number;
        height: number;
      };
  // 纸张方向，默认portrait
  pageOrientation?: 'portrait' | 'landscape';
  // 纸张边距，默认25mm
  pageMargin?:
    | {
        top: number; // 上边距
        right: number; // 右边距
        bottom: number; // 下边距
        left: number; // 左边距
      }
    | number; // 统一设置所有边距为同一个值

  // 缩放比例，默认 1.0
  scale?: number;
  // 分辨率，默认 96dpi
  dpi?: number;
}

/**
 * 编辑器选项
 */
export interface EditorOptions {
  /** 画布与 A4 的缩放比例，默认 1.0 */
  scale?: number;
}
