import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { useEffect, useRef } from 'react';
import echarts from '@/shared/config/echartsConfig';
import { fetchCategoryData } from '@/modules/dashboard/api';
import { getFlowCategoryBarChartOption, getResponsiveChartOption } from '../chartConfigs';

export const FlowCategoryChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const { data: chartData, isFetching } = useQuery({
    queryKey: ['flowCategoryData'],
    queryFn: fetchCategoryData,
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

      const baseOption = getFlowCategoryBarChartOption(chartData);
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
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-gray-800">{chartData.total.toLocaleString()}</div>
        <div className="text-sm text-gray-500">总流程量</div>
      </div>
      <div ref={chartRef} className="w-full h-64" />
      <div className="mt-4 grid grid-cols-2 gap-2">
        {chartData.categories.map((category, index) => (
          <div key={`legend-${category}`} className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded mr-2"
                style={{
                  background: `linear-gradient(to bottom, ${chartData.colors[index]}40, ${chartData.colors[index]})`,
                }}
              />
              <span className="text-gray-700 truncate">{category}</span>
            </div>
            <span className="text-gray-800 font-medium">{chartData.values[index]?.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
