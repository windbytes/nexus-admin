/**
 * 流程画布导出为图片
 * 封装 useReactFlow + html-to-image，支持「当前视图」与「整个工作流」的 PNG/JPEG/SVG 导出
 */
import { useReactFlow } from '@xyflow/react';
import { message } from 'antd';
import { toJpeg, toPng, toSvg } from 'html-to-image';
import { useCallback, useRef, useState } from 'react';

const VIEWPORT_SELECTOR = '.react-flow__viewport';

export type ExportFormat = 'png' | 'jpeg' | 'svg';
export type ExportScope = 'current' | 'full';

export interface ExportImageOptions {
  format: ExportFormat;
  scope: ExportScope;
}

/** 根据 viewport 元素与选项执行导出并触发下载 */
async function captureAndDownload(
  element: HTMLElement,
  format: ExportFormat,
  scope: ExportScope,
  fitView: () => void
): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const baseName = `workflow-${scope === 'current' ? 'view' : 'full'}-${timestamp}`;

  if (scope === 'full') {
    fitView();
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 100);
      });
    });
  }

  const commonOptions = {
    pixelRatio: 2,
    backgroundColor: '#fafafa',
  };

  let dataUrl: string;
  let filename: string;

  switch (format) {
    case 'png': {
      dataUrl = await toPng(element, commonOptions);
      filename = `${baseName}.png`;
      break;
    }
    case 'jpeg': {
      dataUrl = await toJpeg(element, { ...commonOptions, quality: 0.95 });
      filename = `${baseName}.jpg`;
      break;
    }
    case 'svg': {
      dataUrl = await toSvg(element, { ...commonOptions });
      filename = `${baseName}.svg`;
      break;
    }
    default: {
      const _: never = format;
      throw new Error(`Unsupported format: ${_}`);
    }
  }

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function useWorkflowExportImage() {
  const { fitView } = useReactFlow();
  const [isExporting, setIsExporting] = useState(false);
  const hideRef = useRef<ReturnType<typeof message.loading> | null>(null);

  const exportAsImage = useCallback(
    async (options: ExportImageOptions) => {
      const el = document.querySelector(VIEWPORT_SELECTOR) as HTMLElement | null;
      if (!el) {
        message.error('未找到画布视口，请稍后重试');
        return;
      }

      if (isExporting) {
        return;
      }
      setIsExporting(true);
      hideRef.current = message.loading('正在导出...', 0);

      try {
        await captureAndDownload(el, options.format, options.scope, fitView);
        hideRef.current?.();
        hideRef.current = null;
        message.success('导出成功');
      } catch (err) {
        hideRef.current?.();
        hideRef.current = null;
        message.error(err instanceof Error ? err.message : '导出失败');
      } finally {
        setIsExporting(false);
      }
    },
    [fitView, isExporting]
  );

  return { exportAsImage, isExporting };
}
