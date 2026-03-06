/**
 * Engine 应用与标签模块类型定义
 * 与后端 entity/app 及 controller 对齐
 */

/** 集成引擎应用（t_engine_app） */
export interface EngineApp {
  id: string;
  name: string;
  type: number;
  icon?: string;
  iconBg?: string;
  status?: number;
  priority?: number;
  logLevel?: number;
  remark?: string;
  delFlag?: boolean;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
  tags?: Tag[];
}

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

/** 应用查询参数（与后端 AppQuery 对齐） */
export interface AppQuery {
  name?: string;
  type?: number;
  status?: number;
  tags?: string[];
  isMine?: boolean;
  pageNum?: number;
  pageSize?: number;
}
