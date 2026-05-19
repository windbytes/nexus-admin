import type { DbType } from '@/services/system/dict/type.d';
import { HttpRequest } from '@/utils/request';

/**
 * 数据库连接摘要（用于字典 SQL 数据源等下拉）
 * 与后端 GET 列表接口对齐，联调时以 Controller 返回字段为准。
 */
export interface DatabaseConnectionBrief {
  id: string;
  /** 展示用 */
  name: string;
  /**
   * 唯一业务键，写入字典数据源 {@link DictSourceRecord.dbDatasourceName}
   * （若后端以 id 标识连接，可与 id 相同）
   */
  code: string;
  dbType: DbType;
}

const DatasourceAction = {
  /**
   * 列出可选数据库连接（供字典 SQL、其它模块下拉）
   * 后端路径待对齐，当前约定：GET /resource/datasource/list
   */
  list: '/resource/datasource/list',
} as const;

export const datasourceService = {
  /** 获取连接列表，用于字典 SQL「数据源」下拉 */
  async listBrief(): Promise<DatabaseConnectionBrief[]> {
    const res = await HttpRequest.get<DatabaseConnectionBrief[]>(
      { url: DatasourceAction.list },
      { successMessageMode: 'none', errorMessageMode: 'none' }
    );
    return Array.isArray(res) ? res : [];
  },
};
