/**
 * Engine 插件市场模块类型定义
 * 与后端 entity/market、dto/market 及 controller 对齐
 */

/** 市场上架信息（t_market_plugin_listing） */
export interface MarketPluginListing {
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
  publisher: string;
  priceModel?: string;
  priceAmount?: number;
  latestVersionId?: string;
  installCount?: number;
  rating?: number;
  status?: string;
  isBuiltin?: boolean;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

/** 租户安装记录（t_market_plugin_installation） */
export interface MarketPluginInstallation {
  id: string;
  tenantId: string;
  listingId: string;
  pluginId: string;
  pluginVersionId: string;
  status: string;
  installedBy: string;
  installedTime?: string;
  disabledTime?: string;
  uninstalledTime?: string;
}

/** 用户评价（t_market_plugin_review） */
export interface MarketPluginReview {
  id: string;
  listingId: string;
  tenantId: string;
  userId: string;
  rating: number;
  content?: string;
  createTime?: string;
  updateTime?: string;
}

/** 市场展示 VO */
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
  latestVersion?: unknown;
}

/** 市场搜索参数 */
export interface MarketSearchParams {
  keyword?: string;
  category?: string;
  isBuiltin?: boolean;
  page?: number;
  size?: number;
}

/** 安装请求 */
export interface MarketInstallRequest {
  listingId: string;
  pluginVersionId?: string;
}
