import { useRef, useEffect } from 'react';
import echarts from '@/config/echartsConfig';

/**
 * ECharts Hook
 * 提供ECharts图表的创建和管理功能
 */
export const useECharts = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  /**
   * 初始化图表
   */
  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
      
      // 监听窗口大小变化
      const handleResize = () => {
        chartInstance.current?.resize();
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        chartInstance.current?.dispose();
      };
    }
  }, []);

  /**
   * 设置图表选项
   * @param option 图表配置选项
   */
  const setOption = (option: any) => {
    if (chartInstance.current) {
      chartInstance.current.setOption(option);
    }
  };

  /**
   * 获取图表实例
   */
  const getInstance = () => chartInstance.current;

  return {
    chartRef,
    setOption,
    getInstance,
  };
};
