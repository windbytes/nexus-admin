import { useEffect, useRef } from 'react';
import { getContentSize, NWriterEditor } from '../../editor';

interface EditorCanvasProps {
  className?: string;
  /** 画布与 A4 的缩放比例，默认 1.0（100%，接近真实 A4 大小） */
  scale?: number;
}
/**
 * 编辑区画布：提供指定宽高的 div 容器，在 useEffect 中创建 NWriterEditor 实例负责绘制
 */
const EditorCanvas: React.FC<EditorCanvasProps> = ({ className = '', scale: propScale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<NWriterEditor | null>(null);

  const scale = propScale ?? 1;
  const { width: contentW, height: contentH } = getContentSize(scale);

  useEffect(() => {
    const container = wrapperRef.current;
    if (!container) {
      return;
    }

    const editor = new NWriterEditor(container, { scale });
    editorRef.current = editor;

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (propScale != null && editorRef.current) {
      editorRef.current.update({ scale: propScale });
    }
  }, [propScale]);

  return (
    <div className={`relative flex flex-1 flex-col items-center justify-start overflow-auto bg-[#e8e8e8] ${className}`}>
      <div ref={wrapperRef} style={{ width: contentW, height: contentH }} />
    </div>
  );
};

export default EditorCanvas;
