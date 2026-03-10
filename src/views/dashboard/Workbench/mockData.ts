import React from 'react';
import {
  FileTextOutlined,
  PlayCircleOutlined,
  ExclamationCircleOutlined,
  RiseOutlined,
  PlusOutlined,
  BookOutlined,
  MonitorOutlined,
  SettingOutlined,
  FileSearchOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

export interface StatisticData {
  title: string;
  value: string;
  icon: React.ReactNode;
  suffix?: string;
  trend?: string;
  trendType?: 'up' | 'down';
}

export interface TrendData {
  dates: string[];
  values: number[];
  totalFlows: number;
  highlightDate?: string;
  highlightValue?: number;
}

export interface HotFlow {
  rank: number;
  name: string;
  executions: number;
  dailyIncrease: number;
  increaseType: 'up' | 'down';
}

export interface QuickAccessItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}

export interface RecentVisit {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  visitTime?: string;
}

export interface TodoReminder {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Announcement {
  id: string;
  type: 'activity' | 'message' | 'notification';
  title: string;
  time: string;
}

export interface HelpDocument {
  id: string;
  title: string;
  link: string;
}

export interface CategoryData {
  categories: string[];
  values: number[];
  total: number;
  colors: string[];
}

export interface FailedFlow {
  id: string;
  name: string;
  errorMessage: string;
  failedTime: string;
  retryCount: number;
}

export interface PendingFlow {
  id: string;
  name: string;
  waitingTime: string;
  priority: 'high' | 'medium' | 'low';
  assignee?: string;
}

export interface WorkbenchData {
  userName: string;
  statistics: StatisticData[];
  trendData: TrendData;
  hotFlows: HotFlow[];
  quickAccess: QuickAccessItem[];
  recentVisits: RecentVisit[];
  todoReminders: TodoReminder[];
  announcements: Announcement[];
  helpDocuments: HelpDocument[];
  categoryData: CategoryData;
  failedFlows: FailedFlow[];
  pendingFlows: PendingFlow[];
}

export const mockWorkbenchData = async (): Promise<WorkbenchData> => {
  // 模拟API延迟
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    userName: 'Ryan Septimus',
    statistics: [
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
    ],
    trendData: {
      dates: ['03-07', '03-08', '03-09', '03-10', '03-11', '03-12', '03-13'],
      values: [12000, 19000, 15000, 25000, 39068, 28000, 22000],
      totalFlows: 39068,
      highlightDate: '03-11',
      highlightValue: 39068,
    },
    hotFlows: [
      {
        rank: 1,
        name: '用户数据同步流程',
        executions: 3483000,
        dailyIncrease: 35,
        increaseType: 'up',
      },
      {
        rank: 2,
        name: '订单处理自动化',
        executions: 2895000,
        dailyIncrease: 28,
        increaseType: 'up',
      },
      {
        rank: 3,
        name: '库存管理系统',
        executions: 2156000,
        dailyIncrease: 15,
        increaseType: 'down',
      },
      {
        rank: 4,
        name: '支付网关集成',
        executions: 1892000,
        dailyIncrease: 42,
        increaseType: 'up',
      },
      {
        rank: 5,
        name: '报表生成服务',
        executions: 1568000,
        dailyIncrease: 8,
        increaseType: 'up',
      },
    ],
    quickAccess: [
      {
        icon: React.createElement(PlusOutlined, { className: 'text-blue-500' }),
        title: '新建流程',
        description: '创建新的工作流程',
        link: '/workflow/create',
      },
      {
        icon: React.createElement(BookOutlined, { className: 'text-green-500' }),
        title: '流程模板库',
        description: '查看和选择流程模板',
        link: '/workflow/templates',
      },
      {
        icon: React.createElement(MonitorOutlined, { className: 'text-purple-500' }),
        title: '流程监控',
        description: '实时监控流程运行状态',
        link: '/workflow/monitor',
      },
      {
        icon: React.createElement(SettingOutlined, { className: 'text-orange-500' }),
        title: '节点管理',
        description: '管理和配置流程节点',
        link: '/workflow/nodes',
      },
      {
        icon: React.createElement(FileSearchOutlined, { className: 'text-red-500' }),
        title: '操作日志',
        description: '查看系统操作记录',
        link: '/system/logs',
      },
      {
        icon: React.createElement(CheckCircleOutlined, { className: 'text-cyan-500' }),
        title: '系统状态',
        description: '查看系统整体运行状态',
        link: '/system/status',
      },
    ],
    recentVisits: [
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
    ],
    todoReminders: [
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
    ],
    announcements: [
      {
        id: '1',
        type: 'activity',
        title: '流程管理最新优惠活动',
        time: '2小时前',
      },
      {
        id: '2',
        type: 'message',
        title: '新增流程尚未通过审核',
        time: '4小时前',
      },
      {
        id: '3',
        type: 'notification',
        title: '当前产品试用期即将截止',
        time: '6小时前',
      },
      {
        id: '4',
        type: 'notification',
        title: '1月新系统升级计划通知',
        time: '1天前',
      },
    ],
    helpDocuments: [
      {
        id: '1',
        title: '产品概述',
        link: '/help/overview',
      },
      {
        id: '2',
        title: '使用指南',
        link: '/help/guide',
      },
      {
        id: '3',
        title: '接入流程',
        link: '/help/integration',
      },
      {
        id: '4',
        title: '接口文档',
        link: '/help/api',
      },
    ],
    categoryData: {
      categories: ['成功流程', '失败流程', '等待中流程'],
      values: [48, 36, 16],
      total: 928531,
      colors: ['#1890ff', '#52c41a', '#faad14'],
    },
    failedFlows: [
      {
        id: '1',
        name: '用户数据同步流程',
        errorMessage: '数据库连接超时',
        failedTime: '2分钟前',
        retryCount: 3,
      },
      {
        id: '2',
        name: '订单处理自动化',
        errorMessage: 'API接口返回错误',
        failedTime: '5分钟前',
        retryCount: 2,
      },
      {
        id: '3',
        name: '库存管理系统',
        errorMessage: '文件上传失败',
        failedTime: '10分钟前',
        retryCount: 1,
      },
    ],
    pendingFlows: [
      {
        id: '1',
        name: '财务审批流程',
        waitingTime: '30分钟',
        priority: 'high',
        assignee: '张经理',
      },
      {
        id: '2',
        name: '人事变动申请',
        waitingTime: '2小时',
        priority: 'medium',
        assignee: '李主管',
      },
      {
        id: '3',
        name: '设备采购申请',
        waitingTime: '1天',
        priority: 'low',
        assignee: '王总监',
      },
    ],
  };
};
