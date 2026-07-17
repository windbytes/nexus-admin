import type { RouteItem } from '@/types/route';

// 搜索历史项类型
export interface SearchHistoryItem {
  id: string;
  name: string;
  path: string;
  timestamp: number;
}

// 搜索结果项类型
export interface SearchResultItem {
  id: string;
  name: string;
  path: string;
  icon?: string;
  parentPath?: string;
  keyword: string;
  score?: number;
}

export type Menus = RouteItem[];
