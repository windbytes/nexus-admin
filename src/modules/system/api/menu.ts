/**
 * @file 菜单管理 API 服务
 * @description 对接后端 `/system/menu/**` 接口，供菜单管理页与其它系统模块复用。
 * 查询条件字段与后端 {@code SysMenuQueryDTO} 对齐（menuName / menuType / status）。
 */

import type { MenuDirectoryItem, MenuModel } from '@/shared/api/system/menu/type';
import { HttpRequest } from '@/shared/utils/request';

/**
 * 菜单导出请求参数。
 * 对应 `POST /system/menu/export`。
 */
export interface MenuExportParams {
  /**
   * 导出类型。
   * - `all`：按筛选条件导出
   * - `selected`：按 `menuIds` 导出选中项
   */
  type?: 'all' | 'selected';
  /** 菜单名称模糊筛选（仅 `type=all` 时生效） */
  menuName?: string;
  /** 菜单类型精确筛选：0 目录 / 1 子菜单 / 2 子路由 / 3 权限按钮（仅 `type=all`） */
  menuType?: number;
  /** 状态筛选：true 启用 / false 停用（仅 `type=all`）；不传表示不过滤 */
  status?: boolean;
  /** 选中的菜单 ID 列表（仅 `type=selected` 时生效） */
  menuIds?: string[];
}

/**
 * 单条导入明细（可选，后端可能返回）。
 */
export interface MenuImportDetail {
  /** CSV 行号（从数据行起算） */
  row: number;
  /** 菜单名称 */
  name: string;
  /** 该行结果 */
  status: 'success' | 'fail';
  /** 失败原因说明 */
  message?: string;
}

/**
 * 菜单 CSV 导入结果。
 * 对应 `POST /system/menu/import` 响应体。
 */
export interface MenuImportResult {
  /** 是否整体成功（无失败行时为 true） */
  success: boolean;
  /** 成功导入条数 */
  successCount?: number;
  /** 失败条数 */
  failCount?: number;
  /** 错误信息列表，形如「第 N 行：原因」 */
  errors?: string[];
  /** 逐行导入明细（若后端提供） */
  details?: MenuImportDetail[];
}

/**
 * 菜单列表查询参数。
 * 对应 `POST /system/menu/getAllMenus` 请求体，与后端 `SysMenuQueryDTO` 字段一致。
 */
export interface MenuListQuery {
  /** 菜单名称（模糊匹配） */
  menuName?: string;
  /** 菜单类型：0 目录 / 1 子菜单 / 2 子路由 / 3 权限按钮；不传时后端排除类型 3 */
  menuType?: number;
  /** 菜单状态：true 启用 / false 停用；不传表示不过滤 */
  status?: boolean;
}

/** 后端菜单相关接口路径常量 */
const MenuApi = {
  getMenuList: '/system/menu/getMenusByRole',
  getAllMenus: '/system/menu/getAllMenus',
  getDirectory: '/system/menu/getDirectory',
  addMenu: '/system/menu/addMenu',
  updateMenu: '/system/menu/updateMenu',
  deleteMenu: '/system/menu/deleteMenu',
  deleteMenuBatch: '/system/menu/deleteMenuBatch',
  toggleMenuStatus: '/system/menu/toggleMenuStatus',
  exportMenus: '/system/menu/export',
  importMenus: '/system/menu/import',
} as const;

/**
 * 菜单管理服务契约。
 */
interface IMenuService {
  /**
   * 按角色 ID 查询可访问菜单（动态路由用）。
   * @param roleId - 角色主键 ID
   * @returns 菜单路由信息列表
   */
  getMenuListByRoleId(roleId: string): Promise<Record<string, unknown>[]>;

  /**
   * 按条件查询全部菜单树。
   * @param params - 查询条件（menuName / menuType / status）
   * @returns 树形菜单列表；叶子节点的 `children` 为 `undefined`
   */
  getAllMenus(params: MenuListQuery): Promise<MenuModel[]>;

  /**
   * 查询上级菜单目录树（用于表单 TreeSelect）。
   * @returns 目录节点列表
   */
  getDirectory(): Promise<MenuDirectoryItem[]>;

  /**
   * 新增菜单。
   * @param params - 菜单字段（部分填充即可，必填项由后端校验）
   * @returns 是否成功
   */
  addMenu(params: Partial<MenuModel>): Promise<boolean>;

  /**
   * 更新菜单。
   * @param params - 必须包含 `id`，其余为待更新字段
   * @returns 是否成功
   */
  updateMenu(params: Partial<MenuModel>): Promise<boolean>;

  /**
   * 逻辑删除单条菜单。
   * @param menuId - 菜单主键 ID
   * @returns 是否成功
   */
  deleteMenu(menuId: string): Promise<boolean>;

  /**
   * 批量逻辑删除菜单。
   * @param menuIds - 菜单主键 ID 数组
   * @returns 是否成功
   */
  deleteMenuBatch(menuIds: string[]): Promise<boolean>;

  /**
   * 切换菜单启用/停用状态。
   * @param id - 菜单主键 ID
   * @param status - 目标状态：true 启用 / false 停用
   * @returns 是否成功
   */
  toggleMenuStatus(id: string, status: boolean): Promise<boolean>;

  /**
   * 导出菜单为 CSV 文件流。
   * @param params - 导出类型与筛选/选中条件
   * @returns CSV 文件 Blob，可供浏览器触发下载
   */
  exportMenus(params: MenuExportParams): Promise<Blob>;

  /**
   * 从 CSV 文件导入菜单。
   * @param file - 本地选择的 CSV 文件（表单字段名 `file`）
   * @returns 导入结果统计
   */
  importMenus(file: File): Promise<MenuImportResult>;
}

/**
 * 菜单管理服务实现。
 * @example
 * ```ts
 * const list = await menuService.getAllMenus({ menuName: '系统' });
 * ```
 */
export const menuService: IMenuService = {
  /**
   * @inheritdoc
   */
  getMenuListByRoleId(roleId: string) {
    return HttpRequest.get(
      {
        url: MenuApi.getMenuList,
        params: { roleId },
      },
      { successMessageMode: 'none' }
    );
  },

  /**
   * @inheritdoc
   */
  async getAllMenus(params: MenuListQuery) {
    const data = await HttpRequest.post(
      {
        url: MenuApi.getAllMenus,
        data: params,
      },
      { successMessageMode: 'none' }
    );
    return transformMenuData(data ?? []);
  },

  /**
   * @inheritdoc
   */
  getDirectory() {
    return HttpRequest.get(
      {
        url: MenuApi.getDirectory,
      },
      { successMessageMode: 'none' }
    );
  },

  /**
   * @inheritdoc
   */
  addMenu(params: Partial<MenuModel>) {
    return HttpRequest.post(
      {
        url: MenuApi.addMenu,
        data: params,
      },
      { errorMessageMode: 'none' }
    );
  },

  /**
   * @inheritdoc
   */
  updateMenu(params: Partial<MenuModel>) {
    return HttpRequest.post(
      {
        url: MenuApi.updateMenu,
        data: params,
      },
      { errorMessageMode: 'none' }
    );
  },

  /**
   * @inheritdoc
   */
  deleteMenu(menuId: string) {
    return HttpRequest.delete(
      {
        url: MenuApi.deleteMenu,
        params: { id: menuId },
      },
      { errorMessageMode: 'none', successMessageMode: 'none' }
    );
  },

  /**
   * @inheritdoc
   */
  deleteMenuBatch(menuIds: string[]) {
    return HttpRequest.delete({
      url: MenuApi.deleteMenuBatch,
      data: menuIds.map(Number),
    });
  },

  /**
   * @inheritdoc
   */
  toggleMenuStatus(id: string, status: boolean) {
    return HttpRequest.post({
      url: MenuApi.toggleMenuStatus,
      data: { id, status },
    });
  },

  /**
   * @inheritdoc
   */
  exportMenus(params: MenuExportParams) {
    return HttpRequest.post(
      {
        url: MenuApi.exportMenus,
        data: params,
        responseType: 'blob',
      },
      { successMessageMode: 'none', errorMessageMode: 'none' }
    );
  },

  /**
   * @inheritdoc
   */
  importMenus(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return HttpRequest.post(
      {
        url: MenuApi.importMenus,
        data: formData,
      },
      { successMessageMode: 'none', errorMessageMode: 'none' }
    );
  },
};

/**
 * 规范化菜单树：无子节点时将 `children` 置为 `undefined`，避免表格展开空数组。
 *
 * @param data - 后端返回的菜单树（或子树）
 * @returns 处理后的菜单树
 */
function transformMenuData(data: MenuModel[]): MenuModel[] {
  return data.map((item) => ({
    ...item,
    children: item.children?.length ? transformMenuData(item.children) : undefined,
  }));
}
