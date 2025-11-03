import type { Endpoint } from '@/services/integrated/endpoint/endpointApi';
import { useMemo } from 'react';

interface StatisticsData {
  total: number;
  enabled: number;
  disabled: number;
  typeData: Array<{ name: string; value: number }>;
  categoryData: Array<{ name: string; value: number }>;
}

/**
 * 端点统计数据Hook
 */
export const useEndpointStatistics = (endpoints: Endpoint[], total: number): StatisticsData => {
  return useMemo(() => {
    const enabled = endpoints.filter((e) => e.status).length;
    const disabled = endpoints.filter((e) => !e.status).length;

    // 按类型统计
    const typeStats: Record<string, number> = {};
    const typeData: Array<{ name: string; value: number }> = [];
    endpoints.forEach((e) => {
      typeStats[e.endpointType] = (typeStats[e.endpointType] || 0) + 1;
    });
    Object.entries(typeStats).forEach(([name, value]) => {
      typeData.push({ name, value });
    });

    // 按分类统计
    const categoryStats: Record<string, number> = {};
    const categoryData: Array<{ name: string; value: number }> = [];
    endpoints.forEach((e) => {
      const category = e.category || '未分类';
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });
    Object.entries(categoryStats).forEach(([name, value]) => {
      categoryData.push({ name, value });
    });

    return {
      total,
      enabled,
      disabled,
      typeData,
      categoryData,
    };
  }, [endpoints, total]);
};

