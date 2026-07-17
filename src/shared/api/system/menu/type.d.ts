/**
 * 系统菜单类型定义。
 * 字段与后端 {@code SysMenu} 实体对齐（permCode / internalOrExternal）。
 */

import type { ReactNode } from 'react';

export interface MenuModel {
  /** 菜单 ID */
  id: string;
  /** 菜单名称 */
  name: string;
  /** 上级菜单 ID */
  parentId: string;
  /** 上级菜单名称 */
  parentName: string;
  /** 路由地址 */
  url: string;
  /** 前端组件路径（相对 modules） */
  component: string;
  /** 组件名 */
  componentName: string;
  /** 默认跳转 */
  redirect: string;
  /** 菜单类型：0 目录 / 1 子菜单 / 2 子路由 / 3 权限按钮 */
  menuType: number;
  /**
   * 权限标识（按钮类使用）。
   * 对应后端字段 {@code permCode}。
   */
  permCode: string;
  /** 排序号 */
  sortNo: number;
  /** 是否隐藏 */
  hidden: boolean;
  /** 图标 */
  icon: string;
  /** 原始图标节点（前端展示用） */
  originalIcon?: ReactNode | null;
  /** 是否路由菜单 */
  route: boolean;
  /** 路由参数 */
  routeQuery: Array<{
    key: string;
    value: string;
  }>;
  /** 是否叶子节点 */
  leaf: boolean;
  /** 是否缓存 */
  keepAlive: boolean;
  /** 是否隐藏 Tab */
  hideTab: boolean;
  /** 描述 */
  description: string;
  /** 删除标记 */
  delFlag: number;
  /** 数据权限标记 */
  ruleFlag: number;
  /** 状态：true 启用 / false 停用 */
  status: boolean;
  /** 是否外链（对应后端 internalOrExternal） */
  internalOrExternal: boolean;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  children?: MenuModel[];
}

/**
 * 菜单目录项（上级 TreeSelect 数据源）。
 * 后端字段为 title / icon / menuType，而非 name。
 */
export interface MenuDirectoryItem {
  id: string | number;
  /** 展示标题（后端返回 title） */
  title: string;
  icon?: string;
  menuType?: number;
  children?: MenuDirectoryItem[];
  [key: string]: unknown;
}
