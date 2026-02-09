import type { PageQueryParams } from '@/types/global';

/** 字典类型：MANUAL-手工维护，SQL-来自SQL，API-来自接口 */
export type DictType = 'MANUAL' | 'SQL' | 'API';

/** 数据源类型 */
export type SourceType = 'MANUAL' | 'SQL' | 'API';

/** 数据库类型（SQL 数据源） */
export type DbType = 'POSTGRESQL' | 'MYSQL' | 'ORACLE' | 'SQL_SERVER' | 'DM' | 'KINGBASE' | 'OTHER';

/**
 * 数据字典定义模型（与后端 t_sys_dict 对应）
 */
export interface DictModel {
  id: string;
  dictCode: string;
  dictName: string;
  dictType: DictType;
  description?: string;
  enabled: boolean;
  cacheEnabled: boolean;
  cacheTtlSec?: number;
  version: number;
  delFlag: boolean;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
}

/**
 * 字典数据源配置模型（与后端 t_sys_dict_source 对应）
 */
export interface DictSourceModel {
  id: string;
  dictId: string;
  sourceType: SourceType;
  sqlText?: string;
  dbType?: DbType;
  dbDatasourceName?: string;
  apiUrl?: string;
  httpMethod?: string;
  headers?: Record<string, unknown>;
  queryParams?: Record<string, unknown>;
  bodyTemplate?: Record<string, unknown>;
  refreshMode?: string;
  refreshIntervalSec?: number;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
}

/**
 * 字典列映射模型（与后端 t_sys_dict_column 对应）
 */
export interface DictColumnModel {
  id: string;
  dictId: string;
  columnKey: string;
  columnName?: string;
  dataType: string;
  sourceField?: string;
  isPrimary: boolean;
  isLabel: boolean;
  sortable: boolean;
  searchable: boolean;
  orderIndex: number;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
}

/**
 * 手工维护字典数据项模型（与后端 t_sys_dict_data_manual 对应）
 */
export interface DictDataManualModel {
  id: string;
  dictId: string;
  data: Record<string, unknown>;
  orderIndex: number;
  enabled: boolean;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
}

/** 字典分页查询参数 */
export interface DictSearchParams extends PageQueryParams {
  dictCode?: string;
  dictName?: string;
  dictType?: DictType;
  enabled?: boolean;
}

/** 字典保存参数（新增/编辑） */
export interface DictRecord {
  id?: string;
  dictCode: string;
  dictName: string;
  dictType: DictType;
  description?: string;
  enabled: boolean;
  cacheEnabled: boolean;
  cacheTtlSec?: number;
  version?: number;
}

/** 数据源保存参数 */
export interface DictSourceRecord {
  id?: string;
  dictId: string;
  sourceType: SourceType;
  sqlText?: string;
  dbType?: DbType;
  dbDatasourceName?: string;
  apiUrl?: string;
  httpMethod?: string;
  headers?: Record<string, unknown>;
  queryParams?: Record<string, unknown>;
  bodyTemplate?: Record<string, unknown>;
  refreshMode?: string;
  refreshIntervalSec?: number;
}

/** 列映射保存参数 */
export interface DictColumnRecord {
  id?: string;
  dictId: string;
  columnKey: string;
  columnName?: string;
  dataType: string;
  sourceField?: string;
  isPrimary?: boolean;
  isLabel?: boolean;
  sortable?: boolean;
  searchable?: boolean;
  orderIndex?: number;
}

/** 手工数据项保存参数 */
export interface DictDataManualRecord {
  id?: string;
  dictId: string;
  data: Record<string, unknown>;
  orderIndex?: number;
  enabled?: boolean;
}

/** 手工数据分页查询参数 */
export interface DictDataManualQueryParams extends PageQueryParams {
  dictId: string;
}

/**
 * 数据字典一次提交保存请求（与后端 SysDictSaveFullRequest 对应）
 * 编辑时前端将当前配置整体提交，后端在一个事务内更新字典及关联表。
 */
export interface DictSaveFullRequest {
  basic: DictRecord;
  source?: DictSourceRecord;
  columns?: DictColumnRecord[];
  manualData?: DictDataManualRecord[];
}
