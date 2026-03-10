/**
 * Engine 应用与标签模块类型定义
 * 与后端 entity/app 及 controller 对齐
 */

import type { PageQueryParams } from '@/types/global';

/** 集成引擎应用（t_engine_app） */
export interface EngineApp {
  id: string;
  name: string;
  /** 应用分类 ID，用于列表筛选与展示 */
  categoryId?: string | null;
  status?: number;
  priority?: number;
  logLevel?: number;
  remark?: string;
  delFlag?: boolean;
  createBy?: string;
  createUser?: string;
  createTime?: string;
  updateBy?: string;
  updateUser?: string;
  updateTime?: string;
  tags?: Tag[];

  /**
   * Icon
   */
  icon_type: AppIconType | null;
  icon: string;
  iconBg: string | null;
  icon_url: string | null;
}

export type AppIconType = 'image' | 'emoji';

/** 标签（t_tag） */
export interface Tag {
  id: string;
  name: string;
  type: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

export interface AppModalState {
  // 打开新增项目弹窗
  openAddModal: boolean;
  // 打开模板项目弹窗
  openTemplateModal: boolean;
  // 打开上传项目弹窗
  openImportModal: boolean;
}

/** 应用查询参数（与后端 AppQuery 对齐） */
export interface AppQuery extends PageQueryParams {
  name?: string;
  /** 应用分类 ID，0 或空表示全部 */
  categoryId?: number | string | null;
  status?: number;
  tags?: string[];
  isMine?: boolean;
}

/** 应用分类（t_engine_app_category） */
export interface AppCategory {
  id: string;
  name: string;
  code?: string;
  imageUrl?: string;
  sortOrder?: number;
}

/** 应用模板分类（t_engine_app_template_category） */
export interface AppTemplateCategory {
  id: string;
  name: string;
  code?: string;
  imageUrl?: string;
  icon?: string;
  sortOrder?: number;
  isRecommended?: boolean;
}

/** 应用模板（t_engine_app_template） */
export interface AppTemplate {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  iconBg?: string;
  categoryId?: string;
  usageCount?: number;
}

/** 存为模板请求（与后端 SaveAppTemplateRequest 对齐） */
export interface SaveAppTemplateRequest {
  name: string;
  description?: string;
  categoryId?: string | number | null;
}

/** 从模板创建应用请求（与后端 CreateAppFromTemplateRequest 对齐） */
export interface CreateAppFromTemplateRequest {
  appName?: string;
}

/** 流程定义元数据（与后端 FlowDefinition 对齐，用于导出） */
export interface FlowDefinitionExport {
  id?: string;
  tenantId?: string;
  appId?: string;
  flowKey: string;
  flowName: string;
  description?: string;
}

/** 单条流程导出项：流程定义 + 当前版本编排快照 */
export interface FlowExportItem {
  flowDefinition: FlowDefinitionExport;
  /** 当前版本的编排快照（节点、边等 DSL） */
  flowSnapshot: Record<string, unknown>;
}

/** 应用导出结果（与后端 AppExportVO 对齐） */
export interface AppExportVO {
  app: EngineApp;
  flows: FlowExportItem[];
}

/** 应用导入请求（与后端 AppImportRequest 对齐） */
export interface AppImportRequest {
  payload: AppExportVO;
  /** 导入后的应用名称，不传则使用 payload.app.name */
  appName?: string;
  /** 租户 ID，可选 */
  tenantId?: number;
}
