import { useRef, useEffect, useCallback, useState } from 'react';
import echarts from '@/config/echartsConfig';

/**
 * ECharts Hook
 * 提供ECharts图表的创建和管理功能，支持懒加载和实例复用
 */
export const useECharts = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 初始化图表
   */
  const initChart = useCallback(async () => {
    if (!chartRef.current || chartInstance.current) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // 使用 Intersection Observer 实现懒加载
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !chartInstance.current) {
              chartInstance.current = echarts.init(chartRef.current!);
              observer.disconnect();
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(chartRef.current);
    } catch (err) {
      setError('图表初始化失败');
      console.error('ECharts initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 设置图表选项
   * @param option 图表配置选项
   * @param notMerge 是否不合并配置
   */
  const setOption = useCallback((option: any, notMerge = false) => {
    if (chartInstance.current && option) {
      try {
        chartInstance.current.setOption(option, notMerge);
      } catch (err) {
        setError('图表配置失败');
        console.error('ECharts setOption error:', err);
      }
    }
  }, []);

  /**
   * 获取图表实例
   */
  const getInstance = useCallback(() => chartInstance.current, []);

  /**
   * 重新渲染图表
   */
  const resize = useCallback(() => {
    if (chartInstance.current) {
      chartInstance.current.resize();
    }
  }, []);

  /**
   * 销毁图表
   */
  const dispose = useCallback(() => {
    if (chartInstance.current) {
      chartInstance.current.dispose();
      chartInstance.current = null;
    }
  }, []);

  /**
   * 显示加载状态
   */
  const showLoading = useCallback((text = '加载中...') => {
    if (chartInstance.current) {
      chartInstance.current.showLoading('default', {
        text,
        color: '#1677ff',
        textColor: '#000',
        maskColor: 'rgba(255, 255, 255, 0.8)',
        zlevel: 0,
      });
    }
  }, []);

  /**
   * 隐藏加载状态
   */
  const hideLoading = useCallback(() => {
    if (chartInstance.current) {
      chartInstance.current.hideLoading();
    }
  }, []);

  useEffect(() => {
    initChart();

    // 监听窗口大小变化
    const handleResize = () => {
      resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      dispose();
    };
  }, [initChart, resize, dispose]);

  return {
    chartRef,
    setOption,
    getInstance,
    resize,
    dispose,
    showLoading,
    hideLoading,
    isLoading,
    error,
  };
};
