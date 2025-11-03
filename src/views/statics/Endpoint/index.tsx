import type { EndpointSearchParams } from '@/services/integrated/endpoint/endpointApi';
import { endpointService } from '@/services/integrated/endpoint/endpointApi';
import { useQuery } from '@tanstack/react-query';
import { Spin } from 'antd';
import type React from 'react';
import { useState } from 'react';
import EndpointCharts from './components/EndpointCharts';
import EndpointStatistics from './components/EndpointStatistics';
import { useEndpointStatistics } from './hooks/useEndpointStatistics';

/**
 * 端点统计页面
 *
 * 功能说明：
 * - 展示端点总数、启用/禁用数量、活跃率等统计信息
 * - 展示端点类型分布饼图
 * - 展示端点分类统计柱状图
 */
const Endpoint: React.FC = () => {
  // 搜索参数（获取所有端点数据用于统计）
  const [searchParams] = useState<EndpointSearchParams>({
    pageNum: 1,
    pageSize: 10000, // 获取所有数据用于统计
  });

  // 查询端点列表
  const { data: result, isLoading } = useQuery({
    queryKey: ['endpoint_statistics', searchParams],
    queryFn: () => endpointService.getEndpointList(searchParams),
  });

  // 计算统计数据
  const statisticsData = useEndpointStatistics(result?.records || [], result?.totalRow || 0);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spin size="large" tip="加载统计数据中..." />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* 统计卡片 */}
      <EndpointStatistics
        total={statisticsData.total}
        enabled={statisticsData.enabled}
        disabled={statisticsData.disabled}
      />

      {/* 图表区域 */}
      <EndpointCharts typeData={statisticsData.typeData} categoryData={statisticsData.categoryData} />
    </div>
  );
};

export default Endpoint;
