import {
  BellOutlined,
  ExclamationCircleOutlined,
  FallOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Card, Col, Row } from 'antd';
import React, { memo, useMemo } from 'react';
import type { StatisticData } from '../../mockData';
import styles from './StatisticCards.module.scss';

// 模拟获取统计数据的API
const fetchStatisticsData = async (): Promise<StatisticData[]> => {
  // 模拟API延迟
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    {
      title: '今日运行流程数',
      value: '373.5w+',
      icon: React.createElement(FileTextOutlined, { className: 'text-blue-500 text-2xl' }),
      suffix: '个',
      trend: '2.8%',
      trendType: 'up',
    },
    {
      title: '本周运行流程数',
      value: '368',
      icon: React.createElement(PlayCircleOutlined, { className: 'text-green-500 text-2xl' }),
      suffix: '个',
      trend: '5.2%',
      trendType: 'up',
    },
    {
      title: '异常流程预警',
      value: '8874',
      icon: React.createElement(ExclamationCircleOutlined, { className: 'text-orange-500 text-2xl' }),
      suffix: '个',
      trend: '12.5%',
      trendType: 'down',
    },
    {
      title: '待办提醒',
      value: '156',
      icon: React.createElement(BellOutlined, { className: 'text-purple-500 text-2xl' }),
      suffix: '个',
      trend: '3.1%',
      trendType: 'up',
    },
  ];
};

// 获取主渐变颜色 - 使用 useMemo 缓存
const getGradientColor = (index: number): string => {
  const colors: string[] = [
    'rgba(59, 130, 246, 0.8)', // blue
    'rgba(34, 197, 94, 0.8)', // green
    'rgba(249, 115, 22, 0.8)', // orange
    'rgba(147, 51, 234, 0.8)', // purple
  ];
  return colors[index % colors.length]!;
};

// 获取次要渐变颜色 - 使用 useMemo 缓存
const getGradientColorSecondary = (index: number): string => {
  const colors: string[] = [
    'rgba(147, 197, 253, 0.6)', // light blue
    'rgba(134, 239, 172, 0.6)', // light green
    'rgba(251, 191, 36, 0.6)', // light orange
    'rgba(196, 181, 253, 0.6)', // light purple
  ];
  return colors[index % colors.length]!;
};

// 单个统计卡片组件 - 使用 memo 优化
const StatisticCard = memo<{ item: StatisticData; index: number }>(({ item, index }) => {
  // 使用 useMemo 缓存样式计算
  const cardStyles = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${getGradientColor(index)} 0%, ${getGradientColorSecondary(index)} 100%)`,
      backgroundSecondary: `radial-gradient(circle, ${getGradientColor(index)} 0%, transparent 70%)`,
      backgroundSecondary2: `radial-gradient(circle, ${getGradientColorSecondary(index)} 0%, transparent 70%)`,
      borderGradient: `linear-gradient(90deg, ${getGradientColor(index)} 0%, ${getGradientColorSecondary(index)} 100%)`,
      glowEffect: `radial-gradient(circle at center, ${getGradientColor(index)} 0%, transparent 70%)`,
    }),
    [index]
  );

  return (
    <div className={styles['statisticCard']}>
      <Card
        hoverable
        variant="outlined"
        className="h-full border-0 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden"
        styles={{
          body: {
            padding: '16px',
          },
        }}
      >
        {/* 主背景渐变 */}
        <div className="absolute inset-0 opacity-5" style={{ background: cardStyles.background }} />

        {/* 装饰性圆形渐变 */}
        <div className="absolute inset-0 opacity-20">
          <div className={`${styles['decorativeCircle']}`} style={{ background: cardStyles.backgroundSecondary }} />
          <div className={`${styles['decorativeCircle']}`} style={{ background: cardStyles.backgroundSecondary2 }} />
        </div>

        {/* 顶部装饰线 */}
        <div className={styles['topBorder']} style={{ background: cardStyles.borderGradient }} />

        {/* 内容区域 */}
        <div className={styles['cardContent']}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-600 text-sm font-medium tracking-wide">{item.title}</div>
            <div className={styles['iconContainer']}>{item.icon}</div>
          </div>

          <div className="mb-4">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-800 leading-none tracking-tight">{item.value}</span>
              {item.suffix && <span className="text-gray-500 ml-2 text-lg font-medium">{item.suffix}</span>}
            </div>
          </div>

          {item.trend && (
            <div className="flex items-center">
              <div className={`${styles['trendBadge']} ${item.trendType === 'up' ? styles['up'] : styles['down']}`}>
                {item.trendType === 'up' ? <RiseOutlined className="mr-1" /> : <FallOutlined className="mr-1" />}
                {item.trend}
                <span className="ml-1 text-gray-500">{item.trendType === 'up' ? '较昨日' : '较昨日'}</span>
              </div>
            </div>
          )}
        </div>

        {/* 悬停时的光晕效果 */}
        <div className={styles['glowEffect']} style={{ background: cardStyles.glowEffect }} />
      </Card>
    </div>
  );
});

StatisticCard.displayName = 'StatisticCard';

// 加载状态组件 - 使用 memo 优化
const LoadingSkeleton = memo(() => (
  <Row gutter={[8, 16]}>
    {[1, 2, 3, 4].map((index) => (
      <Col xs={24} sm={12} lg={6} key={index}>
        <Card className="h-full">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-8 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </Card>
      </Col>
    ))}
  </Row>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

// 空状态组件 - 使用 memo 优化
const EmptyState = memo(() => <div className="text-center py-8 text-gray-500">暂无统计数据</div>);

EmptyState.displayName = 'EmptyState';

export const StatisticCards: React.FC = memo(() => {
  const { data: statistics, isLoading } = useQuery({
    queryKey: ['statisticsData'],
    queryFn: fetchStatisticsData,
    staleTime: 5 * 60 * 1000, // 5分钟
  });

  // 使用 useMemo 缓存渲染逻辑
  const renderContent = useMemo(() => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }

    if (!statistics || statistics.length === 0) {
      return <EmptyState />;
    }

    return (
      <Row gutter={[12, 12]}>
        {statistics.map((item, index) => (
          <Col xs={24} sm={12} lg={6} key={`stat-${item.title}-${index}`}>
            <StatisticCard item={item} index={index} />
          </Col>
        ))}
      </Row>
    );
  }, [isLoading, statistics]);

  return renderContent;
});

StatisticCards.displayName = 'StatisticCards';
