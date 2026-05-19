/**
 * 路由模块导出
 * 基于 React Router 的动态路由系统
 */

export { Router } from './router';
export { createBaseRoutes } from './routes';
export { initializeRouteTree, routeTreeManager } from './routeTree';
export {
  flattenRoutes,
  generateDynamicRoutes,
  isValidRoute,
  lazyLoadComponent,
  normalizeRoutePath,
} from './routeUtils.tsx';
