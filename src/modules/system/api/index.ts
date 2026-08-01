/**
 * 系统管理模块 API 统一出口。
 *
 * 聚合导出 menu / role / api / permission 等子服务。
 */

export { menuService } from './menu';
export type { MenuExportParams, MenuImportResult, MenuListQuery } from './menu';
export { roleService } from './role';
export { apiService } from './api';
export { permissionService } from './permission';
