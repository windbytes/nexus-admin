import { useQuery } from '@tanstack/react-query';
import { Card, Col, Row } from 'antd';
import type React from 'react';
import { fetchWorkbenchData } from '@/modules/dashboard/api';
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
import './Workbench.module.css';

/**
 * 工作台
 */
const Workbench: React.FC = () => {
  const { isFetching } = useQuery({
    queryKey: ['workbench'],
    queryFn: fetchWorkbenchData,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="min-h-screen workbench">
      <StatisticCards />

      <Row gutter={[8, 8]} className="mt-2">
        <Col xs={24} xl={18} lg={16} className="flex! flex-col gap-2">
          <Card
            hoverable
            loading={isFetching}
            title="流程运行时间趋势图 (近7日)"
            className="mainCard"
            styles={{
              header: {
                borderBottom: 'none',
              },
            }}
          >
            <FlowTrendChart />
          </Card>

          <Card hoverable loading={isFetching} title="热门流程 TOP5" className="mainCard">
            <HotFlowsTable />
          </Card>

          <Card hoverable loading={isFetching} title="失败流程列表" className="mainCard">
            <FailedFlowsList />
          </Card>

          <Card hoverable loading={isFetching} title="等待人工处理的流程" className="mainCard">
            <PendingFlowsList />
          </Card>

          <Card hoverable loading={isFetching} title="流程类别分布" className="mainCard">
            <FlowCategoryChart />
          </Card>

          <Card hoverable loading={isFetching} className="mainCard">
            <ProjectDescription />
          </Card>
        </Col>

        <Col xs={24} xl={6} lg={8} className="flex! flex-col gap-2">
          <Card
            hoverable
            loading={isFetching}
            title="快捷入口"
            className="sidebarCard"
            extra={<a href="/dashboard/workbench">管理</a>}
          >
            <QuickAccess />
          </Card>

          <Card hoverable loading={isFetching} title="最近访问" className="sidebarCard">
            <RecentVisits />
          </Card>

          <Card hoverable loading={isFetching} title="待办提醒 / 异常警报" className="sidebarCard">
            <TodoReminders />
          </Card>

          <Card
            hoverable
            loading={isFetching}
            title="公告"
            className="sidebarCard"
            extra={<a href="/announcements">查看更多</a>}
          >
            <Announcements />
          </Card>

          <Card
            hoverable
            loading={isFetching}
            title="帮助文档"
            className="mainCard"
            extra={<a href="/help">查看更多</a>}
          >
            <HelpDocuments />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Workbench;
