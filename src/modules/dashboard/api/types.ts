import type React from 'react';

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
  helpDocuments: HelpDocument[];
  categoryData: CategoryData;
  failedFlows: FailedFlow[];
  pendingFlows: PendingFlow[];
}
