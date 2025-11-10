import { useQuery } from '@tanstack/react-query';
import { Card, Col, Row } from 'antd';
import type React from 'react';
import {
  Announcements,
  FailedFlowsList,
  FlowCategoryChart,
  FlowTrendChart,
  HelpDocuments,
  HotFlowsTable,
  PendingFlowsList,
  QuickAccess,
  RecentVisits,
  StatisticCards,
  TodoReminders,
} from './components';
import ProjectDescription from './components/ProjectDescription';
import { mockWorkbenchData } from './mockData';
import styles from './Workbench.module.scss';

/**
 * 工作台
 * @returns 工作台组件
 */
const Workbench: React.FC = () => {
  const { data: workbenchData, isLoading } = useQuery({
    queryKey: ['workbench'],
    queryFn: mockWorkbenchData,
    staleTime: 5 * 60 * 1000, // 5分钟
  });

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-2 min-h-screen ${styles.workbench}`}>
      {/* 统计卡片 */}
      <StatisticCards />

      <Row gutter={[16, 24]} className="mt-4">
        {/* 左侧主要内容区域 - 调整为更大的比例 */}
        <Col xs={24} xl={18} lg={16} className="flex! flex-col gap-4">
          {/* 流程运行时间趋势图 */}
          <Card
            title="流程运行时间趋势图 (近7日)"
            className={styles.mainCard}
            styles={{
              header: {
                borderBottom: 'none',
              },
            }}
          >
            <FlowTrendChart />
          </Card>

          {/* 热门流程 TOP5 */}
          <Card title="热门流程 TOP5" className={styles.mainCard}>
            <HotFlowsTable />
          </Card>

          {/* 失败流程列表 */}
          <Card title="失败流程列表" className={styles.mainCard}>
            <FailedFlowsList />
          </Card>

          {/* 等待人工处理的流程 */}
          <Card title="等待人工处理的流程" className={styles.mainCard}>
            <PendingFlowsList />
          </Card>

          {/* 流程类别占比 - 移动到左侧 */}
          <Card title="流程类别分布" className={styles.mainCard}>
            <FlowCategoryChart />
          </Card>

          {/* 项目介绍 */}
          <Card className={styles.mainCard}>
            <ProjectDescription />
          </Card>
        </Col>

        {/* 右侧边栏 - 调整比例并增加间距 */}
        <Col xs={24} xl={6} lg={8} className="flex! flex-col gap-4">
          {/* 快捷入口 */}
          <Card title="快捷入口" className={styles.sidebarCard} extra={<a href="/dashboard/workbench">管理</a>}>
            <QuickAccess />
          </Card>

          {/* 最近访问 */}
          <Card title="最近访问" className={styles.sidebarCard}>
            <RecentVisits />
          </Card>

          {/* 待办提醒 / 异常警报 */}
          <Card title="待办提醒 / 异常警报" className={styles.sidebarCard}>
            <TodoReminders />
          </Card>

          {/* 公告 */}
          <Card title="公告" className={styles.sidebarCard} extra={<a href="/announcements">查看更多</a>}>
            <Announcements />
          </Card>

          {/* 帮助文档 */}
          <Card title="帮助文档" className={styles.mainCard} extra={<a href="/help">查看更多</a>}>
            <HelpDocuments />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Workbench;
