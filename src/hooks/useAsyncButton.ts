import { useCallback, useRef, useState } from 'react';

interface AsyncButtonProps {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  cooldown?: number; // 冷却时间，单位为毫秒，用于限制在一段时间内的点击
}

/**
 * 自定义防重复点击的异步按钮 Hook
 * @param asyncFunction - 异步函数
 * @param options - 配置选项
 * @returns 包含 loading 状态和点击处理函数
 */
export function useAsyncButton<T>(asyncFunction: (...args: any[]) => Promise<T>, options: AsyncButtonProps = {}) {
  const { onSuccess, onError, cooldown } = options;
  const [loading, setLoading] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  // 用于存储冷却时间的引用
  const timeRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 开始定时
   */
  const startCooldown = useCallback(() => {
    if (!cooldown) return;
    setCooldownRemaining(cooldown / 1000);
    const startTime = Date.now();
    timeRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.ceil((cooldown - elapsed) / 1000);
      if (remaining <= 0) {
        timeRef.current && clearInterval(timeRef.current);
        setCooldownRemaining(0);
      } else {
        setCooldownRemaining(remaining);
      }
    }, 1000);
  }, [cooldown]);

  /**
   * 按钮点击处理函数
   */
  const run = useCallback(
    async (...args: any[]) => {
      if (loading || cooldownRemaining > 0) return; // 如果正在加载或冷却中，则不执行
      try {
        setLoading(true);
        const result = await asyncFunction(...args);
        onSuccess?.(result);
        startCooldown(); // 开始冷却
        return result;
      } catch (error) {
        onError?.(error);
        throw error; // 抛出错误以供外部处理
      } finally {
        setLoading(false);
      }
    },
    [loading, cooldownRemaining, asyncFunction, onSuccess, startCooldown]
  );

  return {
    loading,
    cooldownRemaining,
    run,
    disabled: loading || cooldownRemaining > 0,
  };
}
