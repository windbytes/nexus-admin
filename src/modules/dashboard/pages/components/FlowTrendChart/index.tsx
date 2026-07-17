import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { useEffect, useRef } from 'react';
import echarts from '@/shared/config/echartsConfig';
import { fetchTrendData } from '@/modules/dashboard/api';
import { getFlowTrendChartOption, getResponsiveChartOption } from '../chartConfigs';

export const FlowTrendChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const { data: chartData, isFetching } = useQuery({
    queryKey: ['flowTrendData'],
    queryFn: fetchTrendData,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!chartRef.current || !chartData) {
      return;
    }

    const checkAndInitChart = () => {
      if (!chartRef.current) {
        return;
      }

      const { clientWidth, clientHeight } = chartRef.current;
      if (clientWidth === 0 || clientHeight === 0) {
        requestAnimationFrame(checkAndInitChart);
        return;
      }

      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      const baseOption = getFlowTrendChartOption(chartData);
      const isMobile = window.innerWidth < 768;
      const option = getResponsiveChartOption(baseOption, isMobile);
      chartInstance.current.setOption(option);
    };

    requestAnimationFrame(checkAndInitChart);

    resizeObserverRef.current = new ResizeObserver(() => {
      chartInstance.current?.resize();
    });

    if (chartRef.current) {
      resizeObserverRef.current.observe(chartRef.current);
    }

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [chartData]);

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">暂无数据</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">总流程量: {chartData.totalFlows?.toLocaleString()}</div>
      </div>
      <div ref={chartRef} className="w-full h-64" />
    </div>
  );
};
