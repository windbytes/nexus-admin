import { useCallback, useState } from 'react';
import type { TableDensity } from '../types';

/**
 * 表格密度管理 Hook
 */
export function useDensity(defaultDensity: TableDensity = 'middle') {
  const [density, setDensity] = useState<TableDensity>(defaultDensity);

  const changeDensity = useCallback((newDensity: TableDensity) => {
    setDensity(newDensity);
  }, []);

  return {
    density,
    changeDensity,
  };
}
