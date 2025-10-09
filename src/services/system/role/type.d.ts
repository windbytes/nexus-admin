import type { MenuModel } from '@/services/system/menu/type';
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
}

/**
 * 角色查询参数
 */
export interface RoleSearchParams extends PageQueryParams{
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
  currentRow: any | null;
  // 当前选中的行数据
  selectedRows: any[];
  // 当前操作
  action: string;
}

/**
 * 查询返回的角色菜单权限
 */
export interface RoleMenu {
  // 菜单列表
  menuList: MenuModel[];
  // 选中的菜单列表
  menuIds: string[];
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
}
