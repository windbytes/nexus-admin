import { useEffect, useRef } from 'react';
import { OrionEditor } from '../../editor';

interface EditorCanvasProps {
  className?: string;
  /** 画布与 A4 的缩放比例，默认 1.0（100%，接近真实 A4 大小） */
  scale?: number;
}
/**
 * 编辑区画布：提供指定宽高的 div 容器，在容器宽高有效时（ResizeObserver 检测到非零尺寸）创建 OrionEditor 实例负责绘制
 */
const EditorCanvas: React.FC<EditorCanvasProps> = ({ className = '', scale: propScale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<OrionEditor | null>(null);

  const scale = propScale ?? 1;

  useEffect(() => {
    const container = wrapperRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        observer.disconnect();
        const editor = new OrionEditor(container, { scale });
        editorRef.current = editor;
      }
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
      editorRef.current = null;
    };
  }, [scale]);

  return (
    <div className={`relative flex flex-1 flex-col items-center justify-start overflow-auto bg-[#e8e8e8] ${className}`}>
      <div ref={wrapperRef} className="w-full h-full" />
    </div>
  );
};

export default EditorCanvas;
