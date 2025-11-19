/**
 * 路由模块导出
 * 基于 TanStack Router 的动态路由系统
 */

export { Router } from './router';
export { initializeRouteTree, routeTreeManager } from './routeTree';
export {
  flattenRoutes,
  generateDynamicRoutes,
  isValidRoute,
  lazyLoadComponent,
  normalizeRoutePath,
} from './routeUtils.tsx';
