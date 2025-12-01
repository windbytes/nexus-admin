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
import './Workbench.module.scss';

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

  return (
    <div className={`min-h-screen workbench}`}>
      {/* 统计卡片 */}
      <StatisticCards />

      <Row gutter={[12, 12]} className="mt-3">
        {/* 左侧主要内容区域 - 调整为更大的比例 */}
        <Col xs={24} xl={18} lg={16} className="flex! flex-col gap-2">
          {/* 流程运行时间趋势图 */}
          <Card
            hoverable
            loading={isLoading}
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

          {/* 热门流程 TOP5 */}
          <Card hoverable loading={isLoading} title="热门流程 TOP5" className="mainCard">
            <HotFlowsTable />
          </Card>

          {/* 失败流程列表 */}
          <Card hoverable loading={isLoading} title="失败流程列表" className="mainCard">
            <FailedFlowsList />
          </Card>

          {/* 等待人工处理的流程 */}
          <Card hoverable loading={isLoading} title="等待人工处理的流程" className="mainCard">
            <PendingFlowsList />
          </Card>

          {/* 流程类别占比 - 移动到左侧 */}
          <Card hoverable loading={isLoading} title="流程类别分布" className="mainCard">
            <FlowCategoryChart />
          </Card>

          {/* 项目介绍 */}
          <Card hoverable loading={isLoading} className="mainCard">
            <ProjectDescription />
          </Card>
        </Col>

        {/* 右侧边栏 - 调整比例并增加间距 */}
        <Col xs={24} xl={6} lg={8} className="flex! flex-col gap-2">
          {/* 快捷入口 */}
          <Card
            hoverable
            loading={isLoading}
            title="快捷入口"
            className="sidebarCard"
            extra={<a href="/dashboard/workbench">管理</a>}
          >
            <QuickAccess />
          </Card>

          {/* 最近访问 */}
          <Card hoverable loading={isLoading} title="最近访问" className="sidebarCard">
            <RecentVisits />
          </Card>

          {/* 待办提醒 / 异常警报 */}
          <Card hoverable loading={isLoading} title="待办提醒 / 异常警报" className="sidebarCard">
            <TodoReminders />
          </Card>

          {/* 公告 */}
          <Card
            hoverable
            loading={isLoading}
            title="公告"
            className="sidebarCard"
            extra={<a href="/announcements">查看更多</a>}
          >
            <Announcements />
          </Card>

          {/* 帮助文档 */}
          <Card
            hoverable
            loading={isLoading}
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
