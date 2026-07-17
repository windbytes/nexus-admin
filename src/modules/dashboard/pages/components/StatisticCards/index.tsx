import { FallOutlined, RiseOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Card, Col, Row } from 'antd';
import type React from 'react';
import { fetchStatisticsData, type StatisticData } from '@/modules/dashboard/api';
import styles from './StatisticCards.module.css';

const getGradientColor = (index: number): string => {
  const colors: string[] = [
    'rgba(59, 130, 246, 0.8)',
    'rgba(34, 197, 94, 0.8)',
    'rgba(249, 115, 22, 0.8)',
    'rgba(147, 51, 234, 0.8)',
  ];
  return colors[index % colors.length]!;
};

const getGradientColorSecondary = (index: number): string => {
  const colors: string[] = [
    'rgba(147, 197, 253, 0.6)',
    'rgba(134, 239, 172, 0.6)',
    'rgba(251, 191, 36, 0.6)',
    'rgba(196, 181, 253, 0.6)',
  ];
  return colors[index % colors.length]!;
};

function StatisticCard({ item, index }: { item: StatisticData; index: number }) {
  const cardStyles = {
    background: `linear-gradient(135deg, ${getGradientColor(index)} 0%, ${getGradientColorSecondary(index)} 100%)`,
    backgroundSecondary: `radial-gradient(circle, ${getGradientColor(index)} 0%, transparent 70%)`,
    backgroundSecondary2: `radial-gradient(circle, ${getGradientColorSecondary(index)} 0%, transparent 70%)`,
    borderGradient: `linear-gradient(90deg, ${getGradientColor(index)} 0%, ${getGradientColorSecondary(index)} 100%)`,
    glowEffect: `radial-gradient(circle at center, ${getGradientColor(index)} 0%, transparent 70%)`,
  };

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
        <div className="absolute inset-0 opacity-5" style={{ background: cardStyles.background }} />
        <div className="absolute inset-0 opacity-20">
          <div className={`${styles['decorativeCircle']}`} style={{ background: cardStyles.backgroundSecondary }} />
          <div className={`${styles['decorativeCircle']}`} style={{ background: cardStyles.backgroundSecondary2 }} />
        </div>
        <div className={styles['topBorder']} style={{ background: cardStyles.borderGradient }} />
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
        <div className={styles['glowEffect']} style={{ background: cardStyles.glowEffect }} />
      </Card>
    </div>
  );
}

function LoadingSkeleton() {
  return (
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
  );
}

function EmptyState() {
  return <div className="text-center py-8 text-gray-500">暂无统计数据</div>;
}

export const StatisticCards: React.FC = () => {
  const { data: statistics, isFetching } = useQuery({
    queryKey: ['statisticsData'],
    queryFn: fetchStatisticsData,
    staleTime: 5 * 60 * 1000,
  });

  if (isFetching) {
    return <LoadingSkeleton />;
  }

  if (!statistics || statistics.length === 0) {
    return <EmptyState />;
  }

  return (
    <Row gutter={[8, 8]}>
      {statistics.map((item, index) => (
        <Col xs={24} sm={12} lg={6} key={`stat-${item.title}-${index}`}>
          <StatisticCard item={item} index={index} />
        </Col>
      ))}
    </Row>
  );
};
