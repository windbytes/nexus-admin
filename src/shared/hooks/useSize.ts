import { type RefObject, useEffect, useRef, useState } from 'react';

/**
 * DOM 元素尺寸快照。
 */
interface Size {
  /** 内容区宽度（px） */
  width: number;
  /** 内容区高度（px） */
  height: number;
}

/**
 * 监听目标 DOM 元素尺寸变化（ResizeObserver）。
 *
 * @typeParam T - 目标元素类型，默认 `HTMLElement`
 * @param target - 指向目标元素的 React ref；未挂载或为空时不监听
 * @returns 当前尺寸；尚未测量到时为 `undefined`
 *
 * @example
 * ```ts
 * const ref = useRef<HTMLDivElement>(null);
 * const size = useSize(ref);
 * ```
 */
export default function useSize<T extends HTMLElement = HTMLElement>(target?: RefObject<T | null>): Size | undefined {
  const [size, setSize] = useState<Size>();
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const el = target?.current;
    if (!el) {
      return;
    }

    observerRef.current = new ResizeObserver(([entry]) => {
      const { width, height } = entry?.contentRect ?? { width: 0, height: 0 };
      setSize({ width: width ?? 0, height: height ?? 0 });
    });
    observerRef.current.observe(el);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [target]);

  return size;
}
