import type { PageQueryParams } from '@/types/global';

/**
 * 连接配置 JSON（建议后端单列 JSON，字段名保持稳定便于 ORM / 文档生成）。
 *
 * - endpoint：主机、端口、库名等通用连接信息；部分字段在不同库语义不同（见字段注释）。
 * - pool：连接池可选参数。
 * - extras：驱动或版本特有项（SSL、证书路径、字符集等），避免主结构无限膨胀。
 */
export interface DatabaseConnectionConfig {
  endpoint: DatabaseConnectionEndpoint;
  pool?: DatabaseConnectionPool;
  /** 驱动/版本扩展配置 */
  extras?: Record<string, object | undefined>;
}

/** 公共连接端点（各数据库复用；未使用字段可省略） */
export interface DatabaseConnectionEndpoint {
  host?: string;
  port?: number;
  /**
   * 库名 / 服务名等：MySQL/PG 为 database；Oracle 可为 serviceName 对应的全局 DB 名等，以后端约定为准。
   */
  database?: string;
  username?: string;
  /** 明文仅用于提交；列表/详情接口建议返回掩码或不返回 */
  password?: string;
  /** PostgreSQL 等 */
  schema?: string;
  /** Oracle 服务名 */
  serviceName?: string;
  /** Oracle SID */
  sid?: string;
}

export interface DatabaseConnectionPool {
  maxActive?: number;
  maxWaitMs?: number;
  initialSize?: number;
  minIdle?: number;
  testWhileIdle?: boolean;
  testOnBorrow?: boolean;
  testOnReturn?: boolean;
  validationQuery?: string;
  validationQueryTimeoutSec?: number;
  timeBetweenEvictionRunsMs?: number;
  minEvictableIdleTimeMs?: number;
}

/**
 * 数据库连接主实体（表行 + config JSON）。
 * 与字典 SQL 数据源「连接 code」对齐时可与 dbDatasourceName 共用。
 */
export interface DatabaseConnectionRecord {
  id: string;
  name: string;
  code: string;
  driverId: string;
  /** 与资源-驱动维护模块 databaseType 字符串一致（如 MySQL、PostgreSQL） */
  databaseType: string;
  driverClass?: string;
  enabled: boolean;
  remark?: string;
  config: DatabaseConnectionConfig;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

/** 分页列表查询（POST body） */
export interface ConnectionSearchParams extends PageQueryParams {
  name?: string;
  code?: string;
  databaseType?: string;
  enabled?: boolean;
}

/**
 * 弹窗表单值（Ant Design Form）。
 * config 与 {@link DatabaseConnectionConfig} 同形，提交时再裁剪默认值。
 */
export interface ConnectionFormValues {
  id?: string;
  name: string;
  code: string;
  driverId: string;
  databaseType: string;
  driverClass?: string;
  enabled: boolean;
  remark?: string;
  config: DatabaseConnectionConfig;
}

/**
 * 测试连接请求（不落库；字段与保存时连接参数一致，便于后端加载 JDBC 驱动并试连）
 */
export interface ConnectionTestPayload {
  /** 已落库时可选；未改密时后端可凭 id 取库中密码 */
  id?: string;
  driverId: string;
  databaseType: string;
  driverClass?: string;
  config: DatabaseConnectionConfig;
}

/** 试连结果；后端也可仅返回 boolean，由 API 封装层归一化为该结构 */
export interface ConnectionTestResult {
  success: boolean;
  message?: string;
  errorType?: string;
  elapsedMs?: number;
}

export interface ConnectionStatusPayload {
  id: string;
  enabled: boolean;
}

export interface ConnectionPoolStats {
  connectionId: string;
  enabled: boolean;
  poolInitialized: boolean;
  activeCount: number;
  poolingCount: number;
  waitThreadCount: number;
  maxActive: number;
}
