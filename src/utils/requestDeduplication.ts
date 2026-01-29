/**
 * 请求去重工具
 * 防止相同请求在短时间内重复发送
 */

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

class RequestDeduplication {
  private pendingRequests = new Map<string, PendingRequest>();
  private readonly DEFAULT_TTL = 5000; // 5秒内相同请求会被去重

  /**
   * 生成请求的唯一标识
   */
  private generateKey(url: string, method: string, params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${method.toUpperCase()}:${url}:${paramsStr}`;
  }

  /**
   * 检查请求是否应该被去重
   */
  private shouldDeduplicate(key: string): boolean {
    const pending = this.pendingRequests.get(key);
    if (!pending) return false;

    const now = Date.now();
    const isExpired = now - pending.timestamp > this.DEFAULT_TTL;

    if (isExpired) {
      this.pendingRequests.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 执行去重请求
   */
  async deduplicate<T>(
    url: string,
    method: string,
    requestFn: () => Promise<T>,
    params?: any,
    ttl?: number
  ): Promise<T> {
    const key = this.generateKey(url, method, params);
    const requestTTL = ttl || this.DEFAULT_TTL;

    // 检查是否有相同的请求正在进行
    if (this.shouldDeduplicate(key)) {
      const pending = this.pendingRequests.get(key);
      if (pending) {
        console.log(`Deduplicating request: ${key}`);
        return pending.promise;
      }
    }

    // 创建新的请求
    const promise = requestFn().finally(() => {
      // 请求完成后清理
      setTimeout(() => {
        this.pendingRequests.delete(key);
      }, requestTTL);
    });

    // 记录正在进行的请求
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
    });

    return promise;
  }

  /**
   * 清理过期的请求
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, pending] of this.pendingRequests.entries()) {
      if (now - pending.timestamp > this.DEFAULT_TTL) {
        this.pendingRequests.delete(key);
      }
    }
  }

  /**
   * 清空所有待处理的请求
   */
  clear(): void {
    this.pendingRequests.clear();
  }

  /**
   * 获取当前待处理的请求数量
   */
  getPendingCount(): number {
    return this.pendingRequests.size;
  }
}

// 创建单例实例
export const requestDeduplication = new RequestDeduplication();

// 定期清理过期请求
setInterval(() => {
  requestDeduplication.cleanup();
}, 30000); // 每30秒清理一次

export default requestDeduplication;
