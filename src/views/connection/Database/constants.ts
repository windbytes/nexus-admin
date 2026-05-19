import type { DatabaseConnectionConfig } from '@/services/connection/database/type';

/** 与资源-驱动模块检索选项一致，便于筛选与展示统一 */
export const DATABASE_TYPE_FILTER_OPTIONS = [
  { value: 'MySQL', label: 'MySQL' },
  { value: 'PostgreSQL', label: 'PostgreSQL' },
  { value: 'Oracle', label: 'Oracle' },
  { value: 'SQLServer', label: 'SQL Server' },
  { value: 'DB2', label: 'DB2' },
  { value: 'SQLite', label: 'SQLite' },
  { value: 'MariaDB', label: 'MariaDB' },
  { value: 'DM', label: '达梦' },
  { value: 'KingBase', label: '人大金仓' },
  { value: 'GBase', label: '南大通用' },
  { value: 'Other', label: '其他' },
] as const;

export const CONNECTION_PAGINATION = {
  showQuickJumper: true,
  showSizeChanger: true,
  hideOnSinglePage: false,
  pageSizeOptions: ['10', '20', '50', '100'],
};

/** 编辑时密码未修改则不在提交体中带 password（与占位符比较） */
export const PASSWORD_NOT_CHANGED_PLACEHOLDER = '********';

/** 新建连接时的默认 config，避免 undefined 嵌套导致受控组件告警 */
export function emptyConnectionConfig(): DatabaseConnectionConfig {
  return {
    endpoint: {},
    pool: {},
    extras: {},
  };
}
