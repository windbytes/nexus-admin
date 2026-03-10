/**
 * Engine 插件管理模块类型定义
 * 与后端 entity/plugin 及 controller 对齐
 */

/** 插件逻辑定义（t_engine_plugin_definition） */
export interface PluginDefinition {
  id: string;
  tenantId: string;
  pluginKey: string;
  pluginName: string;
  pluginType: string;
  description?: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

/** 插件版本（t_engine_plugin_version） */
export interface PluginVersion {
  id: string;
  tenantId: string;
  pluginId: string;
  version: number;
  entryPoint?: Record<string, unknown>;
  configSchema?: Record<string, unknown>;
  runtimeType: string;
  checksum?: string;
  status?: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

/** 插件分类（与后端 NodeCategory 对齐） */
export type NodeCategory = 'TRIGGER' | 'PROCESSOR' | 'CONNECTOR' | 'CONTROL';

/** 流程编排可用插件 VO（含 installStatus） */
export interface MarketListingVO {
  id: string;
  pluginId: string;
  pluginKey: string;
  pluginName: string;
  category: string;
  tags?: unknown;
  summary?: string;
  descriptionMd?: string;
  iconUrl?: string;
  screenshots?: unknown;
  publisher?: string;
  priceModel?: string;
  priceAmount?: number;
  installCount?: number;
  rating?: number;
  status?: string;
  isBuiltin?: boolean;
  installStatus?: string;
  latestVersion?: PluginVersion;
}
