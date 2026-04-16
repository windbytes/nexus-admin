/**
 * 数据库连接维护 HTTP 封装。
 * 路径需与 syndra 后端 Controller 对齐；联调时仅改 ConnectionAction 枚举常量。
 */
import type { PageResult } from '@/types/global';
import { HttpRequest } from '@/utils/request';
import type {
  ConnectionFormValues,
  ConnectionPoolStats,
  ConnectionSearchParams,
  ConnectionStatusPayload,
  ConnectionTestPayload,
  ConnectionTestResult,
  DatabaseConnectionRecord,
} from './type';

export enum ConnectionAction {
  page = '/connection/database/page',
  add = '/connection/database/add',
  update = '/connection/database/update',
  delete = '/connection/database/delete',
  batchDelete = '/connection/database/batchDelete',
  detail = '/connection/database/detail',
  /** 校验当前驱动与配置能否连通数据库 */
  test = '/connection/database/test',
  status = '/connection/database/status',
  enable = '/connection/database/enable',
  disable = '/connection/database/disable',
  poolStats = '/connection/database/poolStats',
}

export const connectionService = {
  async page(params: ConnectionSearchParams): Promise<PageResult<DatabaseConnectionRecord>> {
    return HttpRequest.post<PageResult<DatabaseConnectionRecord>>(
      { url: ConnectionAction.page, data: params },
      { successMessageMode: 'none' }
    );
  },

  async add(data: Omit<ConnectionFormValues, 'id'>): Promise<boolean> {
    return HttpRequest.post<boolean>({ url: ConnectionAction.add, data });
  },

  async update(data: ConnectionFormValues): Promise<boolean> {
    return HttpRequest.post<boolean>({ url: ConnectionAction.update, data });
  },

  async delete(id: string): Promise<boolean> {
    return HttpRequest.post<boolean>({ url: ConnectionAction.delete, data: { id } });
  },

  async batchDelete(ids: string[]): Promise<boolean> {
    return HttpRequest.post<boolean>({ url: ConnectionAction.batchDelete, data: { ids } });
  },

  async detail(id: string): Promise<DatabaseConnectionRecord> {
    return HttpRequest.get<DatabaseConnectionRecord>({ url: `${ConnectionAction.detail}/${id}` });
  },

  /**
   * 测试连接是否可用（不写入业务表）
   * @param payload 与表单相同的驱动与 config；后端试连后返回成功或失败原因
   */
  async testConnection(payload: ConnectionTestPayload): Promise<ConnectionTestResult> {
    const raw = await HttpRequest.post<boolean | ConnectionTestResult>(
      { url: ConnectionAction.test, data: payload },
      { successMessageMode: 'none' }
    );
    if (typeof raw === 'boolean') {
      return { success: raw };
    }
    return {
      success: raw.success,
      message: raw.message,
      errorType: raw.errorType,
      elapsedMs: raw.elapsedMs,
    };
  },

  async changeStatus(payload: ConnectionStatusPayload): Promise<boolean> {
    return HttpRequest.post<boolean>({ url: ConnectionAction.status, data: payload });
  },

  async enable(id: string): Promise<boolean> {
    return HttpRequest.post<boolean>({ url: ConnectionAction.enable, data: { id } });
  },

  async disable(id: string): Promise<boolean> {
    return HttpRequest.post<boolean>({ url: ConnectionAction.disable, data: { id } });
  },

  async poolStats(id: string): Promise<ConnectionPoolStats> {
    return HttpRequest.get<ConnectionPoolStats>({ url: `${ConnectionAction.poolStats}/${id}` });
  },
};
