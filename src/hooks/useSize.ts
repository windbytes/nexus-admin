import { type RefObject, useEffect, useRef, useState } from 'react';

interface Size {
  width: number;
  height: number;
}

/**
 * 获取元素尺寸
 * @param target 元素
 * @returns 元素尺寸
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
