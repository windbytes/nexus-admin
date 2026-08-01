import type { PageQueryParams } from '@/types/global';

/**
 * 接口注册表模型（对应 sys_api，运行时鉴权生效）。
 */
export interface ApiModel {
  /** 主键 */
  id: string;
  /** 接口名称 */
  apiName: string;
  /** 接口路径（Ant 风格模板路径） */
  path: string;
  /** 调用方法 GET/POST/PUT/DELETE/*（任意） */
  method: string;
  /** 绑定权限点ID；NULL=仅需认证 */
  permId?: string;
  /** 绑定权限点编码（展示用） */
  permCode?: string;
  /** 绑定权限点名称（展示用） */
  permName?: string;
  /** 是否公开 true-免认证白名单 false-需鉴权 */
  isPublic: boolean;
  /** 来源 1-手工登记 2-注解扫描同步 */
  source: 1 | 2;
  /** 状态 true 启用 false 停用（停用后按未注册处理） */
  status: boolean;
  /** 描述 */
  remark?: string;
  delFlag?: boolean;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

/** 新增/编辑接口注册项请求 */
export interface ApiSaveParams {
  id?: string;
  apiName: string;
  path: string;
  method: string;
  /** 绑定权限点ID；为空表示仅需认证 */
  permId?: string;
  isPublic?: boolean;
  status?: boolean;
  remark?: string;
}

/** 接口注册表查询参数 */
export interface ApiSearchParams extends PageQueryParams {
  /** 接口名称（模糊） */
  apiName?: string;
  /** 接口路径（模糊） */
  path?: string;
  /** 调用方法 GET/POST/PUT/DELETE/* */
  method?: string;
  /** 绑定权限点ID */
  permId?: string;
  /** 来源 1-手工登记 2-注解扫描同步 */
  source?: 1 | 2;
  /** 状态 true-启用 false-停用 */
  status?: boolean;
  /** 是否公开 true-白名单 false-需鉴权 */
  isPublic?: boolean;
}

/** 接口注册表扫描同步结果 */
export interface ApiScanResult {
  /** 扫描到的带权限注解端点数 */
  scannedEndpoints: number;
  /** 新登记条数 */
  inserted: number;
  /** 更新已有扫描条数 */
  updated: number;
  /** 跳过的手工登记条数 */
  skippedManual: number;
  /** 自动创建的权限点数 */
  autoCreatedPerms: number;
}
