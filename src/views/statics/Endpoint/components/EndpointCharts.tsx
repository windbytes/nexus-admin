import echarts from '@/config/echartsConfig';
import { Card, Col, Empty, Row, theme } from 'antd';
import type React from 'react';
import { useEffect, useRef } from 'react';

interface EndpointChartsProps {
  /** 按类型统计 */
  typeData: Array<{ name: string; value: number }>;
  /** 按分类统计 */
  categoryData: Array<{ name: string; value: number }>;
}

/**
 * 端点图表组件
 */
const EndpointCharts: React.FC<EndpointChartsProps> = ({ typeData, categoryData }) => {
  const { token } = theme.useToken();
  const typeChartRef = useRef<HTMLDivElement>(null);
  const categoryChartRef = useRef<HTMLDivElement>(null);
  const typeChartInstance = useRef<echarts.ECharts | null>(null);
  const categoryChartInstance = useRef<echarts.ECharts | null>(null);

  /**
   * 初始化端点类型图表
   */
  useEffect(() => {
    if (!typeChartRef.current || typeData.length === 0) return;

    // 初始化图表实例
    if (!typeChartInstance.current) {
      typeChartInstance.current = echarts.init(typeChartRef.current, undefined, { renderer: 'canvas' });
    }

    const option: echarts.EChartsCoreOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: {
          color: token.colorText,
        },
      },
      series: [
        {
          name: '端点类型',
          type: 'pie',
          radius: '60%',
          center: ['60%', '50%'],
          data: typeData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            color: token.colorText,
          },
        },
      ],
      color: [token.colorPrimary, token.colorSuccess, token.colorWarning, token.colorError, token.colorInfo, '#a0d911'],
    };

    typeChartInstance.current.setOption(option);

    // 响应式处理
    const handleResize = () => {
      typeChartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [typeData, token]);

  /**
   * 初始化端点分类图表
   */
  useEffect(() => {
    if (!categoryChartRef.current || categoryData.length === 0) return;

    // 初始化图表实例
    if (!categoryChartInstance.current) {
      categoryChartInstance.current = echarts.init(categoryChartRef.current, undefined, { renderer: 'canvas' });
    }

    const option: echarts.EChartsCoreOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: categoryData.map((item) => item.name),
        axisLabel: {
          color: token.colorText,
        },
        axisLine: {
          lineStyle: {
            color: token.colorBorder,
          },
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: token.colorText,
        },
        splitLine: {
          lineStyle: {
            color: token.colorBorder,
          },
        },
      },
      series: [
        {
          name: '端点数量',
          type: 'bar',
          data: categoryData.map((item) => item.value),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: token.colorPrimary },
              { offset: 1, color: token.colorPrimaryBg },
            ]),
          },
          emphasis: {
            itemStyle: {
              color: token.colorPrimaryActive,
            },
          },
        },
      ],
    };

    categoryChartInstance.current.setOption(option);

    // 响应式处理
    const handleResize = () => {
      categoryChartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [categoryData, token]);

  /**
   * 清理图表实例
   */
  useEffect(() => {
    return () => {
      typeChartInstance.current?.dispose();
      categoryChartInstance.current?.dispose();
    };
  }, []);

  return (
    <Row gutter={[16, 16]}>
      {/* 端点类型分布 */}
      <Col xs={24} lg={12}>
        <Card title="端点类型分布">
          {typeData.length > 0 ? (
            <div ref={typeChartRef} className="h-80" />
          ) : (
            <div className="h-80 flex items-center justify-center">
              <Empty description="暂无数据" />
            </div>
          )}
        </Card>
      </Col>

      {/* 端点分类统计 */}
      <Col xs={24} lg={12}>
        <Card title="端点分类统计">
          {categoryData.length > 0 ? (
            <div ref={categoryChartRef} className="h-80" />
          ) : (
            <div className="h-80 flex items-center justify-center">
              <Empty description="暂无数据" />
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default EndpointCharts;
