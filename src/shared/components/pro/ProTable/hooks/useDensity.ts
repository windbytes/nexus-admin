import type { SizeType } from 'antd/es/config-provider/SizeContext';
import { useCallback, useState } from 'react';

/**
 * 表格密度状态。
 */
export interface UseDensityResult {
  /** 当前密度：`large` | `middle` | `small` */
  density: SizeType;
  /**
   * 切换表格密度。
   * @param newDensity - 目标密度
   */
  changeDensity: (newDensity: SizeType) => void;
}

/**
 * 管理 ProTable 行高密度状态。
 *
 * @param defaultDensity - 初始密度，默认 `'middle'`
 * @returns 当前密度与切换方法
 */
export function useDensity(defaultDensity: SizeType = 'middle'): UseDensityResult {
  const [density, setDensity] = useState<SizeType>(defaultDensity);

  const changeDensity = useCallback((newDensity: SizeType) => {
    setDensity(newDensity);
  }, []);

  return {
    density,
    changeDensity,
  };
}
