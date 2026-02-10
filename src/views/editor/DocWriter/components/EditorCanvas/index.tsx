/**
 * 编辑区画布：整块 Canvas 绘制，中央为 A4 纸张尺寸的编辑页面
 * A4: 210mm x 297mm，按 96dpi 换算约 794 x 1123 px
 * 默认以 100% 比例绘制，使屏幕上的 A4 接近真实尺寸；画布可滚动查看整页
 */
import { useCallback, useEffect, useRef, useState } from 'react';

/** A4 纸宽高（mm） */
const A4_MM = { width: 210, height: 297 };

/** 画布边距（纸张与灰色区域间距） */
const CANVAS_MARGIN = 48;

/** 将 mm 转为 px，96dpi 下与真实 A4 打印尺寸一致 */
function mmToPx(mm: number): number {
  return (mm * 96) / 25.4;
}

interface EditorCanvasProps {
  className?: string;
  /** 画布与 A4 的缩放比例，默认 1.0（100%，接近真实 A4 大小） */
  scale?: number;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({ className = '', scale: propScale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** 默认 1.0：按 96dpi 的 A4 像素尺寸绘制，视觉上接近真实 A4 大小 */
  const [scale, setScale] = useState(propScale ?? 1);

  const a4Px = useCallback(() => {
    return {
      width: mmToPx(A4_MM.width),
      height: mmToPx(A4_MM.height),
    };
  }, []);

  /** 画布内容区尺寸：A4 缩放后 + 左右上下边距 */
  const contentSize = useCallback(() => {
    const { width: a4w, height: a4h } = a4Px();
    return {
      width: Math.ceil(a4w * scale) + CANVAS_MARGIN * 2,
      height: Math.ceil(a4h * scale) + CANVAS_MARGIN * 2,
    };
  }, [a4Px, scale]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const { width: a4w, height: a4h } = a4Px();
      const scaledW = a4w * scale;
      const scaledH = a4h * scale;
      const x = (w - scaledW) / 2;
      const y = (h - scaledH) / 2;

      // 画布背景（整块灰色）
      ctx.fillStyle = '#e8e8e8';
      ctx.fillRect(0, 0, w, h);

      // A4 白纸
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, scaledW, scaledH);
      ctx.strokeStyle = '#d9d9d9';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, scaledW, scaledH);

      // 占位提示文本（居中在 A4 内）
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = '#000';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('编辑区域（A4 纸张）', a4w / 2, a4h / 2 - 10);
      ctx.fillText('此处为病历正文占位，后续接入富文本或块编辑', a4w / 2, a4h / 2 + 15);
      ctx.restore();
    },
    [scale, a4Px]
  );

  useEffect(() => {
    if (propScale != null) {
      setScale(propScale);
    }
  }, [propScale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const { width: cw, height: ch } = contentSize();
    if (!canvas || cw <= 0 || ch <= 0) {
      return;
    }

    const dpr = window.devicePixelRatio ?? 1;
    const bufferW = Math.floor(cw * dpr);
    const bufferH = Math.floor(ch * dpr);
    canvas.width = bufferW;
    canvas.height = bufferH;
    canvas.style.width = `${cw}px`;
    canvas.style.height = `${ch}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(ctx, cw, ch);
    }
  }, [contentSize, draw]);

  const { width: contentW, height: contentH } = contentSize();

  return (
    <div className={`relative flex flex-1 flex-col items-center justify-start overflow-auto bg-[#e8e8e8] ${className}`}>
      {/* 内层按“A4 缩放 + 边距”固定尺寸，画布即真实 A4 比例；区域大时居中，小时可滚动 */}
      <div ref={wrapperRef} style={{ width: contentW, height: contentH }}>
        <canvas ref={canvasRef} className="block" />
      </div>
    </div>
  );
};

export default EditorCanvas;
