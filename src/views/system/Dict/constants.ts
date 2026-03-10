/**
 * 字典类型选项（数据元类型）
 */
export const DICT_TYPE_OPTIONS = [
  { label: '手工维护', value: 'MANUAL' },
  { label: 'SQL', value: 'SQL' },
  { label: 'API', value: 'API' },
] as const;

/**
 * 数据库类型选项（SQL 数据源）
 */
export const DB_TYPE_OPTIONS = [
  { label: 'PostgreSQL', value: 'POSTGRESQL' },
  { label: 'MySQL', value: 'MYSQL' },
  { label: 'Oracle', value: 'ORACLE' },
  { label: 'SQL Server', value: 'SQL_SERVER' },
  { label: '达梦', value: 'DM' },
  { label: '人大金仓', value: 'KINGBASE' },
  { label: '其他', value: 'OTHER' },
] as const;

/**
 * 列数据类型选项
 */
export const COLUMN_DATA_TYPE_OPTIONS = [
  { label: '字符串', value: 'string' },
  { label: '数字', value: 'number' },
  { label: '布尔', value: 'boolean' },
] as const;

/**
 * 刷新方式选项
 */
export const REFRESH_MODE_OPTIONS = [
  { label: '自动', value: 'AUTO' },
  { label: '手动', value: 'MANUAL' },
] as const;
