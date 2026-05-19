import type { SizeType } from 'antd/es/config-provider/SizeContext';
import { useCallback, useState } from 'react';

/**
 * 表格密度管理 Hook
 */
export function useDensity(defaultDensity: SizeType = 'middle') {
  const [density, setDensity] = useState<SizeType>(defaultDensity);

  const changeDensity = useCallback((newDensity: SizeType) => {
    setDensity(newDensity);
  }, []);

  return {
    density,
    changeDensity,
  };
}
