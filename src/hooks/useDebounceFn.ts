import { useMemo, useRef } from 'react';

interface DebounceOptions {
  wait?: number;
}

// biome-ignore lint/suspicious/noExplicitAny: generic utility hook requires flexible function signature
type AnyFn = (...args: any[]) => unknown;

interface DebouncedFn<T extends AnyFn> {
  run: (...args: Parameters<T>) => void;
  cancel: () => void;
}

/**
 * 防抖函数
 * @param fn 函数
 * @param options 选项
 * @returns 防抖函数
 */
export default function useDebounceFn<T extends AnyFn>(fn: T, options?: DebounceOptions): DebouncedFn<T> {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wait = options?.wait ?? 300;

  return useMemo(() => {
    const cancel = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const run = (...args: Parameters<T>) => {
      cancel();
      timerRef.current = setTimeout(() => {
        fnRef.current(...args);
      }, wait);
    };

    return { run, cancel };
  }, [wait]);
}
