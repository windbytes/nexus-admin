/**
 * 系统管理模块统一出口。
 *
 * 对外暴露 system 模块中可被 app 层 / 其它场景复用的 API 与类型。
 */

export { menuService } from './api/menu';
export type { MenuExportParams, MenuImportResult, MenuListQuery } from './api/menu';
export { roleService } from './api/role';
export { apiService } from './api/api';
export { permissionService } from './api/permission';
