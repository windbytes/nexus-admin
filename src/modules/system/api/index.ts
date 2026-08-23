/**
 * 系统管理模块 API 统一出口。
 *
 * 聚合导出 menu / role / api / permission 等子服务。
 */

export { apiService } from './api';
export type { MenuExportParams, MenuImportResult, MenuListQuery } from './menu';
export { menuService } from './menu';
export { permissionService } from './permission';
export { roleService } from './role';
export { userService } from './user';
