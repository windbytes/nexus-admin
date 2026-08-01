import type { PageQueryParams } from '@/types/global';

/**
 * 系统角色
 */
export interface RoleModel {
  /**
   * 角色ID
   */
  id: string;

  /**
   * 角色编码
   */
  roleCode: string;

  /**
   * 角色名称
   */
  roleName: string;

  /**
   * 角色类型
   */
  roleType: string;

  /**
   * 角色状态
   */
  status: boolean;

  /**
   * 角色描述
   */
  remark?: string;

  /**
   * 角色等级
   */
  roleLevel?: number;

  /**
   * 是否内置角色
   */
  isBuiltin?: boolean;
}

/**
 * 角色查询参数
 */
export interface RoleSearchParams extends PageQueryParams {
  /**
   * 角色编码
   */
  roleCode?: string;
  /**
   * 角色名称
   */
  roleName?: string;
  /**
   * 角色状态
   */
  status?: string;
}

// 定义 state 的类型
export interface RoleState {
  // 编辑窗口的打开状态
  openEditModal: boolean;
  // 角色用户分配窗口的打开状态
  openRoleUserModal: boolean;
  // 角色菜单分配窗口的打开状态
  openRoleMenuModal: boolean;
  // 当前编辑的行数据
  currentRow: RoleModel | null;
  // 当前选中的行数据
  selectedRows: any[];
  // 当前操作
  action: string;
  // 表格数据总数
  total: number;
}

/**
 * 角色统一授权树节点类型：root-虚拟根，menu-菜单，button-按钮权限点，apiGroup-接口权限分组，api-接口权限点。
 */
export type RoleGrantNodeType = 'root' | 'menu' | 'button' | 'apiGroup' | 'api';

/**
 * 角色统一授权树节点（菜单/按钮/接口合并树）。
 * key 规则：菜单为 `menu:{id}`，权限点为 `perm:{id}`，虚拟根为 `root:page` / `root:api`。
 */
export interface RoleGrantTreeNode {
  /** 节点 key：menu:{id} / perm:{id} / root:page / root:api */
  key: string;
  /** 节点标题 */
  title: string;
  /** 节点类型 */
  type: RoleGrantNodeType;
  /** 图标 */
  icon?: string;
  /** 子节点 */
  children?: RoleGrantTreeNode[];
}

/**
 * 角色统一授权树响应：合并树 + 角色已勾选 keys。
 */
export interface RoleGrantTreeResponse {
  /** 授权树（页面与按钮 / 接口权限 两棵虚拟根） */
  tree: RoleGrantTreeNode[];
  /** 角色已授权节点 key 列表（menu:{id} / perm:{id}） */
  checkedKeys: string[];
}

/**
 * 分配用户抽屉模块查询参数
 */
export interface UserSearchParams {
  username?: string;
  realName?: string;
  status?: 0 | 1;
  pageNum: number;
  pageSize: number;
  /** 数据总数（首页传 0，翻页时传首页返回的 totalRow） */
  total?: number;
}
