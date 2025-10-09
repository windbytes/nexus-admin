// 前端参数缓存工具：内存 + localStorage + 后端API
import { sysParamService } from '@/services/system/params/paramsApi';

/**
 * 参数缓存项接口
 */
interface ParamCacheItem {
  /** 参数值 */
  value: string;
  /** 过期时间戳 */
  expireTime: number;
  /** 创建时间戳 */
  createTime: number;
}

/**
 * 参数服务配置
 */
interface ParamServiceConfig {
  /** 默认缓存有效期（毫秒），默认30分钟 */
  defaultExpireTime: number;
  /** localStorage 键名前缀 */
  storagePrefix: string;
  /** 内存缓存最大数量，默认500 */
  maxMemoryCacheSize: number;
}

/**
 * 获取参数选项
 */
interface GetParamOptions {
  /** 参数编码 */
  code: string;
  /** 默认值 */
  defaultValue?: string;
  /** 有效期（毫秒），不传则使用默认值 */
  expireTime?: number;
}

/**
 * 参数服务类
 */
class ParamService {
  private config: ParamServiceConfig;
  private memoryCache: Map<string, ParamCacheItem> = new Map();

  constructor(config?: Partial<ParamServiceConfig>) {
    this.config = {
      defaultExpireTime: 30 * 60 * 1000, // 30分钟
      storagePrefix: 'param_cache_',
      maxMemoryCacheSize: 500,
      ...config,
    };
  }

  /**
   * 获取参数值
   * @param options 获取参数选项
   * @returns 参数值
   */
  async getParam(options: GetParamOptions): Promise<string> {
    const { code, defaultValue = '', expireTime } = options;
    const actualExpireTime = expireTime ?? this.config.defaultExpireTime;

    // 1. 先从内存缓存中获取
    const memoryValue = this.getFromMemoryCache(code);
    if (memoryValue !== null) {
      return memoryValue;
    }

    // 2. 从 localStorage 中获取
    const storageValue = this.getFromStorageCache(code);
    if (storageValue !== null) {
      // 将 localStorage 的值同步到内存缓存
      this.setToMemoryCache(code, storageValue, actualExpireTime);
      return storageValue;
    }

    // 3. 从后端接口获取
    try {
      const apiValue = await this.getFromApi(code);
      // 同时更新内存缓存和 localStorage
      this.setToMemoryCache(code, apiValue, actualExpireTime);
      this.setToStorageCache(code, apiValue, actualExpireTime);
      return apiValue;
    } catch (error) {
      console.warn(`获取参数 ${code} 失败:`, error);
      return defaultValue;
    }
  }

  /**
   * 从内存缓存获取参数
   * @param code 参数编码
   * @returns 参数值或null
   */
  private getFromMemoryCache(code: string): string | null {
    const item = this.memoryCache.get(code);
    if (!item) {
      return null;
    }

    // 检查是否过期
    if (Date.now() > item.expireTime) {
      this.memoryCache.delete(code);
      return null;
    }

    return item.value;
  }

  /**
   * 从 localStorage 获取参数
   * @param code 参数编码
   * @returns 参数值或null
   */
  private getFromStorageCache(code: string): string | null {
    try {
      const key = this.config.storagePrefix + code;
      const itemStr = localStorage.getItem(key);
      if (!itemStr) {
        return null;
      }

      const item: ParamCacheItem = JSON.parse(itemStr);

      // 检查是否过期
      if (Date.now() > item.expireTime) {
        localStorage.removeItem(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.warn(`从 localStorage 获取参数 ${code} 失败:`, error);
      return null;
    }
  }

  /**
   * 从后端API获取参数
   * @param code 参数编码
   * @returns 参数值
   */
  private async getFromApi(code: string): Promise<string> {
    return await sysParamService.getParamByCode(code);
  }

  /**
   * 设置内存缓存
   * @param code 参数编码
   * @param value 参数值
   * @param expireTime 过期时间（毫秒）
   */
  private setToMemoryCache(code: string, value: string, expireTime: number): void {
    // 检查内存缓存大小，如果超过限制则清理最旧的缓存
    if (this.memoryCache.size >= this.config.maxMemoryCacheSize) {
      this.cleanupMemoryCache();
    }

    const now = Date.now();
    this.memoryCache.set(code, {
      value,
      expireTime: now + expireTime,
      createTime: now,
    });
  }

  /**
   * 设置 localStorage 缓存
   * @param code 参数编码
   * @param value 参数值
   * @param expireTime 过期时间（毫秒）
   */
  private setToStorageCache(code: string, value: string, expireTime: number): void {
    try {
      const key = this.config.storagePrefix + code;
      const item: ParamCacheItem = {
        value,
        expireTime: Date.now() + expireTime,
        createTime: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn(`设置 localStorage 缓存失败:`, error);
    }
  }

  /**
   * 清理内存缓存（保留最新的50%）
   */
  private cleanupMemoryCache(): void {
    const entries = Array.from(this.memoryCache.entries());
    // 按创建时间排序，保留最新的50%
    entries.sort((a, b) => b[1].createTime - a[1].createTime);
    const keepCount = Math.floor(this.config.maxMemoryCacheSize * 0.5);

    this.memoryCache.clear();
    entries.slice(0, keepCount).forEach(([code, item]) => {
      this.memoryCache.set(code, item);
    });
  }

  /**
   * 更新缓存
   * @param code 参数编码
   * @param value 新的参数值
   * @param expireTime 过期时间（毫秒），不传则使用默认值
   */
  updateCache(code: string, value: string, expireTime?: number): void {
    const actualExpireTime = expireTime ?? this.config.defaultExpireTime;

    // 更新内存缓存
    this.setToMemoryCache(code, value, actualExpireTime);

    // 更新 localStorage 缓存
    this.setToStorageCache(code, value, actualExpireTime);
  }

  /**
   * 删除缓存
   * @param code 参数编码
   */
  deleteCache(code: string): void {
    // 从内存缓存中删除
    this.memoryCache.delete(code);

    // 从 localStorage 中删除
    try {
      const key = this.config.storagePrefix + code;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`删除 localStorage 缓存失败:`, error);
    }
  }

  /**
   * 清空所有缓存
   */
  clearAllCache(): void {
    // 清空内存缓存
    this.memoryCache.clear();

    // 清空 localStorage 中的参数缓存
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.config.storagePrefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn(`清空 localStorage 缓存失败:`, error);
    }
  }

  /**
   * 获取缓存统计信息
   * @returns 缓存统计信息
   */
  getCacheStats(): {
    memoryCacheSize: number;
    storageCacheSize: number;
    memoryCacheKeys: string[];
  } {
    const memoryCacheKeys = Array.from(this.memoryCache.keys());

    let storageCacheSize = 0;
    try {
      const keys = Object.keys(localStorage);
      storageCacheSize = keys.filter((key) => key.startsWith(this.config.storagePrefix)).length;
    } catch (error) {
      console.warn(`获取 localStorage 缓存统计失败:`, error);
    }

    return {
      memoryCacheSize: this.memoryCache.size,
      storageCacheSize,
      memoryCacheKeys,
    };
  }

  /**
   * 批量获取参数
   * @param codes 参数编码数组
   * @param defaultValue 默认值
   * @param expireTime 有效期（毫秒）
   * @returns 参数值映射
   */
  async getParams(codes: string[], defaultValue: string = '', expireTime: number = 30 * 60 * 1000): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    // 并行获取所有参数
    const promises = codes.map(async (code) => {
      const value = await this.getParam({ code, defaultValue, expireTime });
      return { code, value };
    });

    const paramResults = await Promise.all(promises);
    paramResults.forEach(({ code, value }) => {
      results[code] = value;
    });

    return results;
  }
}

// 创建默认实例
export const paramService = new ParamService();

// 导出类和接口
export { ParamService, type GetParamOptions, type ParamServiceConfig, type ParamCacheItem };

// 导出便捷方法
export const getParam = (code: string, defaultValue: string = '', expireTime: number = 30 * 60 * 1000) =>
  paramService.getParam({ code, defaultValue, expireTime });

export const updateParamCache = (code: string, value: string, expireTime: number = 30 * 60 * 1000) =>
  paramService.updateCache(code, value, expireTime);

export const deleteParamCache = (code: string) => paramService.deleteCache(code);

export const clearAllParamCache = () => paramService.clearAllCache();

export const getParamCacheStats = () => paramService.getCacheStats();
