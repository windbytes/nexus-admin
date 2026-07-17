import {
  BellOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  MonitorOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import React from 'react';
import type {
  CategoryData,
  FailedFlow,
  HelpDocument,
  HotFlow,
  PendingFlow,
  QuickAccessItem,
  RecentVisit,
  StatisticData,
  TodoReminder,
  TrendData,
  WorkbenchData,
} from './types';

const MOCK_DELAY_MS = 300;

async function mockDelay(ms = MOCK_DELAY_MS): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchStatisticsData(): Promise<StatisticData[]> {
  await mockDelay();
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
}

export async function fetchTrendData(): Promise<TrendData> {
  await mockDelay();
  return {
    dates: ['03-07', '03-08', '03-09', '03-10', '03-11', '03-12', '03-13'],
    values: [12000, 19000, 15000, 25000, 39068, 28000, 22000],
    totalFlows: 39068,
    highlightDate: '03-11',
    highlightValue: 39068,
  };
}

export async function fetchCategoryData(): Promise<CategoryData> {
  await mockDelay();
  return {
    categories: [
      '财务审批流程',
      '人事变动申请',
      '设备采购申请',
      '项目立项流程',
      '合同审批流程',
      '报销申请流程',
      '请假申请流程',
      '培训申请流程',
    ],
    values: [156, 89, 234, 67, 189, 312, 145, 78],
    total: 1320,
    colors: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'],
  };
}

export async function fetchHotFlowsData(): Promise<HotFlow[]> {
  await mockDelay();
  return [
    { rank: 1, name: '用户数据同步流程', executions: 3483000, dailyIncrease: 35, increaseType: 'up' },
    { rank: 2, name: '订单处理自动化', executions: 2895000, dailyIncrease: 28, increaseType: 'up' },
    { rank: 3, name: '库存管理系统', executions: 2156000, dailyIncrease: 15, increaseType: 'down' },
    { rank: 4, name: '支付网关集成', executions: 1892000, dailyIncrease: 42, increaseType: 'up' },
    { rank: 5, name: '报表生成服务', executions: 1568000, dailyIncrease: 8, increaseType: 'up' },
  ];
}

export async function fetchFailedFlowsData(): Promise<FailedFlow[]> {
  await mockDelay();
  return [
    { id: '1', name: '用户数据同步流程', errorMessage: '数据库连接超时', failedTime: '2分钟前', retryCount: 3 },
    { id: '2', name: '订单处理自动化', errorMessage: 'API接口返回错误', failedTime: '5分钟前', retryCount: 2 },
    { id: '3', name: '库存管理系统', errorMessage: '文件上传失败', failedTime: '10分钟前', retryCount: 1 },
  ];
}

export async function fetchPendingFlowsData(): Promise<PendingFlow[]> {
  await mockDelay();
  return [
    { id: '1', name: '财务审批流程', waitingTime: '30分钟', priority: 'high', assignee: '张经理' },
    { id: '2', name: '人事变动申请', waitingTime: '2小时', priority: 'medium', assignee: '李主管' },
    { id: '3', name: '设备采购申请', waitingTime: '1天', priority: 'low', assignee: '王总监' },
  ];
}

export async function fetchQuickAccessData(): Promise<QuickAccessItem[]> {
  await mockDelay();
  return [
    {
      icon: React.createElement(PlusOutlined, { className: 'text-2xl' }),
      title: '新建流程',
      description: '创建新的工作流程',
      link: '/workflow/create',
    },
    {
      icon: React.createElement(BookOutlined, { className: 'text-2xl' }),
      title: '流程模板库',
      description: '查看和选择流程模板',
      link: '/workflow/templates',
    },
    {
      icon: React.createElement(MonitorOutlined, { className: 'text-2xl' }),
      title: '流程监控',
      description: '实时监控流程运行状态',
      link: '/workflow/monitor',
    },
    {
      icon: React.createElement(SettingOutlined, { className: 'text-2xl' }),
      title: '节点管理',
      description: '管理和配置流程节点',
      link: '/workflow/nodes',
    },
    {
      icon: React.createElement(FileSearchOutlined, { className: 'text-2xl' }),
      title: '操作日志',
      description: '查看系统操作记录',
      link: '/system/logs',
    },
    {
      icon: React.createElement(CheckCircleOutlined, { className: 'text-2xl' }),
      title: '系统状态',
      description: '查看系统整体运行状态',
      link: '/system/status',
    },
  ];
}

export async function fetchRecentVisitsData(): Promise<RecentVisit[]> {
  await mockDelay();
  return [
    {
      icon: React.createElement(MonitorOutlined, { className: 'text-blue-500' }),
      title: '流程监控',
      description: '实时监控页面',
      link: '/workflow/monitor',
      visitTime: '2分钟前',
    },
    {
      icon: React.createElement(BookOutlined, { className: 'text-green-500' }),
      title: '流程模板库',
      description: '模板管理页面',
      link: '/workflow/templates',
      visitTime: '15分钟前',
    },
    {
      icon: React.createElement(SettingOutlined, { className: 'text-orange-500' }),
      title: '节点管理',
      description: '节点配置页面',
      link: '/workflow/nodes',
      visitTime: '1小时前',
    },
  ];
}

export async function fetchTodoRemindersData(): Promise<TodoReminder[]> {
  await mockDelay();
  return [
    {
      id: '1',
      type: 'warning',
      title: '流程执行异常',
      description: '用户数据同步流程出现超时错误',
      time: '2分钟前',
      priority: 'high',
    },
    {
      id: '2',
      type: 'error',
      title: '系统资源不足',
      description: '服务器CPU使用率超过90%',
      time: '5分钟前',
      priority: 'high',
    },
    {
      id: '3',
      type: 'info',
      title: '新流程待审核',
      description: '3个新流程等待管理员审核',
      time: '10分钟前',
      priority: 'medium',
    },
  ];
}

export async function fetchHelpDocumentsData(): Promise<HelpDocument[]> {
  await mockDelay();
  return [
    { id: '1', title: '产品概述', link: '/help/overview' },
    { id: '2', title: '使用指南', link: '/help/guide' },
    { id: '3', title: '接入流程', link: '/help/integration' },
    { id: '4', title: '接口文档', link: '/help/api' },
  ];
}

/** 工作台聚合数据（页面级 loading 使用） */
export async function fetchWorkbenchData(): Promise<WorkbenchData> {
  await mockDelay(500);
  const [
    statistics,
    trendData,
    hotFlows,
    quickAccess,
    recentVisits,
    todoReminders,
    helpDocuments,
    categoryData,
    failedFlows,
    pendingFlows,
  ] = await Promise.all([
    fetchStatisticsData(),
    fetchTrendData(),
    fetchHotFlowsData(),
    fetchQuickAccessData(),
    fetchRecentVisitsData(),
    fetchTodoRemindersData(),
    fetchHelpDocumentsData(),
    fetchCategoryData(),
    fetchFailedFlowsData(),
    fetchPendingFlowsData(),
  ]);

  return {
    userName: 'Ryan Septimus',
    statistics,
    trendData,
    hotFlows,
    quickAccess,
    recentVisits,
    todoReminders,
    helpDocuments,
    categoryData,
    failedFlows,
    pendingFlows,
  };
}

export const workbenchService = {
  fetchStatisticsData,
  fetchTrendData,
  fetchCategoryData,
  fetchHotFlowsData,
  fetchFailedFlowsData,
  fetchPendingFlowsData,
  fetchQuickAccessData,
  fetchRecentVisitsData,
  fetchTodoRemindersData,
  fetchHelpDocumentsData,
  fetchWorkbenchData,
};
