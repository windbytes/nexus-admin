/** A4 纸宽高（mm） */
const A4_MM = { width: 210, height: 297 };

/** 画布边距（纸张与灰色区域间距） */
const CANVAS_MARGIN = 0;

/** 页面上下边距（mm），用于绘制内容区域线 */
const PAGE_MARGIN_MM = 25;

/** 将 mm 转为 px，96dpi 下与真实 A4 打印尺寸一致 */
function mmToPx(mm: number): number {
  return (mm * 96) / 25.4;
}

/** 根据 scale 计算画布内容区尺寸 */
export function getContentSize(scale: number) {
  const a4w = mmToPx(A4_MM.width);
  const a4h = mmToPx(A4_MM.height);
  return {
    width: Math.ceil(a4w * scale) + CANVAS_MARGIN * 2,
    height: Math.ceil(a4h * scale) + CANVAS_MARGIN * 2,
  };
}

export interface NWriterEditorOptions {
  /** 画布与 A4 的缩放比例，默认 1.0 */
  scale?: number;
}

/**
 * 病历编辑器：接收外层包裹 div，负责 canvas 创建与绘制
 */
export class NWriterEditor {
  private container: HTMLDivElement;
  private options: Required<NWriterEditorOptions>;
  private canvas: HTMLCanvasElement | null = null;

  constructor(container: HTMLDivElement, options: NWriterEditorOptions = {}) {
    this.container = container;
    this.options = {
      scale: options.scale ?? 1,
    };
    this.init();
  }

  private init() {
    const { scale } = this.options;
    const { width: cw, height: ch } = getContentSize(scale);
    if (cw <= 0 || ch <= 0) {
      return;
    }

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'block';
    this.container.appendChild(this.canvas);

    const dpr = window.devicePixelRatio ?? 1;
    const bufferW = Math.floor(cw * dpr);
    const bufferH = Math.floor(ch * dpr);
    this.canvas.width = bufferW;
    this.canvas.height = bufferH;
    this.canvas.style.width = `${cw}px`;
    this.canvas.style.height = `${ch}px`;

    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.draw(ctx, cw, ch);
    }
  }

  private draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const { scale } = this.options;
    const a4w = mmToPx(A4_MM.width);
    const a4h = mmToPx(A4_MM.height);
    const scaledW = a4w * scale;
    const scaledH = a4h * scale;
    const x = (w - scaledW) / 2;
    const y = (h - scaledH) / 2;

    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, scaledW, scaledH);
    ctx.strokeStyle = '#d9d9d9';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, scaledW, scaledH);

    const marginPx = mmToPx(PAGE_MARGIN_MM) * scale;
    const rx = x + marginPx;
    const ry = y + marginPx;
    const rw = scaledW - marginPx * 2;
    const rh = scaledH - marginPx * 2;
    const cornerLen = 32 * scale;
    ctx.strokeStyle = '#bfbfbf';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx, ry - cornerLen);
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - cornerLen, ry);
    ctx.moveTo(rx + rw, ry);
    ctx.lineTo(rx + rw, ry - cornerLen);
    ctx.moveTo(rx + rw, ry);
    ctx.lineTo(rx + rw + cornerLen, ry);
    ctx.moveTo(rx, ry + rh);
    ctx.lineTo(rx, ry + rh + cornerLen);
    ctx.moveTo(rx, ry + rh);
    ctx.lineTo(rx - cornerLen, ry + rh);
    ctx.moveTo(rx + rw, ry + rh);
    ctx.lineTo(rx + rw, ry + rh + cornerLen);
    ctx.moveTo(rx + rw, ry + rh);
    ctx.lineTo(rx + rw + cornerLen, ry + rh);
    ctx.stroke();

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#000';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('yyyy年MM月dd日 HH时mm分', a4w / 2, a4h / 2 - 10);
    ctx.fillText('此处为病历正文占位，后续接入富文本或块编辑', a4w / 2, a4h / 2 + 15);
    ctx.restore();
  }

  /** 更新参数并重绘（不销毁 DOM，仅调整尺寸后清空重绘） */
  update(options: Partial<NWriterEditorOptions>) {
    this.options = { ...this.options, ...options };
    if (!this.canvas) {
      return;
    }

    const { scale } = this.options;
    const { width: cw, height: ch } = getContentSize(scale);
    if (cw <= 0 || ch <= 0) {
      return;
    }

    const dpr = window.devicePixelRatio ?? 1;
    const bufferW = Math.floor(cw * dpr);
    const bufferH = Math.floor(ch * dpr);
    this.canvas.width = bufferW;
    this.canvas.height = bufferH;
    this.canvas.style.width = `${cw}px`;
    this.canvas.style.height = `${ch}px`;

    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.draw(ctx, cw, ch);
    }
  }

  /** 销毁并清理 */
  destroy() {
    if (this.canvas && this.container.contains(this.canvas)) {
      this.container.removeChild(this.canvas);
    }
    this.canvas = null;
  }
}
