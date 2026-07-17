import echarts from '@/shared/config/echartsConfig';

// 流程趋势图配置
export const getFlowTrendChartOption = (data: any): echarts.EChartsCoreOption => ({
  title: {
    text: '流程运行趋势',
    left: 'center',
    textStyle: {
      fontSize: 16,
      fontWeight: 'normal',
      color: '#333',
    },
  },
  tooltip: {
    trigger: 'axis',
    formatter: (params: any) => {
      const data = params[0];
      return `${data.name}<br/>
              <span style="color: #1890ff;">●</span> 流程数量: ${data.value.toLocaleString()}`;
    },
  },
  grid: {
    left: '3%',
    right: '3%',
    bottom: '2%',
    top: '2%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: data.dates,
    axisLine: {
      lineStyle: {
        color: '#ddd',
      },
    },
    axisLabel: {
      color: '#666',
      fontSize: 12,
    },
  },
  yAxis: {
    type: 'value',
    name: '流程数量',
    nameTextStyle: {
      color: '#666',
      fontSize: 12,
    },
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    splitLine: {
      lineStyle: {
        color: '#f0f0f0',
        type: 'dashed',
      },
    },
    axisLabel: {
      color: '#666',
      fontSize: 12,
      formatter: (value: number) => {
        if (value >= 10000) {
          return (value / 10000).toFixed(1) + 'w';
        }
        return value.toLocaleString();
      },
    },
  },
  series: [
    {
      name: '流程数量',
      type: 'line',
      data: data.values,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        color: '#1890ff',
        width: 3,
      },
      itemStyle: {
        color: '#1890ff',
        borderColor: '#fff',
        borderWidth: 2,
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
          { offset: 1, color: 'rgba(24, 144, 255, 0.1)' },
        ]),
      },
      markPoint: {
        data: [
          {
            type: 'max',
            name: '最高值',
            itemStyle: {
              color: '#ff4d4f',
            },
          },
        ],
      },
      markLine: {
        data: [
          {
            type: 'average',
            name: '平均值',
            lineStyle: {
              color: '#52c41a',
              type: 'dashed',
            },
          },
        ],
      },
    },
  ],
});

// 流程类别占比柱状图配置
export const getFlowCategoryBarChartOption = (data: any): echarts.EChartsCoreOption => ({
  title: {
    text: '流程类别分布',
    left: 'center',
    top: 10,
    textStyle: {
      fontSize: 14,
      fontWeight: 'normal',
      color: '#333',
    },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
    formatter: (params: any) => {
      const param = params[0];
      return `${param.name}<br/>
              <span style="color: ${param.color};">●</span> 数量: ${param.value.toLocaleString()}`;
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    top: '15%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: data.categories,
    axisLine: {
      lineStyle: {
        color: '#ddd',
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: '#666',
      fontSize: 11,
      rotate: 45,
      interval: 0,
    },
  },
  yAxis: {
    type: 'value',
    name: '流程数量',
    nameTextStyle: {
      color: '#666',
      fontSize: 12,
    },
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    splitLine: {
      lineStyle: {
        color: '#f0f0f0',
        type: 'dashed',
      },
    },
    axisLabel: {
      color: '#666',
      fontSize: 12,
    },
  },
  series: [
    {
      name: '流程数量',
      type: 'bar',
      data: data.categories.map((_category: string, index: number) => ({
        value: data.values[index],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: data.colors[index] + '80' }, // 浅色
            { offset: 1, color: data.colors[index] }, // 深色
          ]),
        },
      })),
      barWidth: '60%',
      barGap: '10%',
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#1890ff80' },
            { offset: 1, color: '#1890ff' },
          ]),
        },
      },
    },
  ],
});

// 流程类别占比饼图配置
export const getFlowCategoryChartOption = (data: any): echarts.EChartsCoreOption => ({
  title: {
    text: '流程类别占比',
    left: 'center',
    top: 10,
    textStyle: {
      fontSize: 14,
      fontWeight: 'normal',
      color: '#333',
    },
  },
  tooltip: {
    trigger: 'item',
    formatter: (params: any) => {
      const percentage = ((params.value / data.total) * 100).toFixed(1);
      return `${params.name}<br/>
              <span style="color: ${params.color};">●</span> 数量: ${params.value.toLocaleString()}<br/>
              <span style="color: ${params.color};">●</span> 占比: ${percentage}%`;
    },
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    top: 'middle',
    itemWidth: 12,
    itemHeight: 12,
    textStyle: {
      fontSize: 12,
      color: '#666',
    },
  },
  series: [
    {
      name: '流程类别',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['65%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 4,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: false,
        position: 'center',
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold',
          color: '#333',
        },
      },
      labelLine: {
        show: false,
      },
      data: data.categories.map((category: string, index: number) => ({
        name: category,
        value: data.values[index],
        itemStyle: {
          color: data.colors[index],
        },
      })),
    },
  ],
});

// 通用图表主题配置
export const chartTheme = {
  color: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'],
  backgroundColor: 'transparent',
  textStyle: {
    color: '#333',
  },
};

// 响应式图表配置
export const getResponsiveChartOption = (
  baseOption: echarts.EChartsCoreOption,
  isMobile: boolean
): echarts.EChartsCoreOption => {
  if (isMobile) {
    return {
      ...baseOption,
      grid: {
        ...(baseOption.grid as any),
        left: '5%',
        right: '5%',
        bottom: '10%',
        top: '15%',
      },
      title: {
        ...(baseOption.title as any),
        textStyle: {
          ...baseOption.textStyle,
          fontSize: 14,
        },
      },
    };
  }
  return baseOption;
};
