import { type AnyRoute, createRoute } from '@tanstack/react-router';
import { ensurePermission } from '@/app/guards/PermissionGuard';
import type { RouteItem, RouteMeta } from '@/types/route';
import { resolvePageComponent } from './menu';

interface FlatRoute {
  /** 相对父级（受保护布局）的路径，已去除前导斜杠 */
  path: string;
  /** 菜单 component 字段 */
  component: string;
  /** 菜单 id */
  menuKey: string;
  meta?: RouteMeta;
}

/**
 * 判断一个菜单项是否需要生成可访问的页面路由。
 */
function isValidRoute(item: RouteItem): boolean {
  return !!(item?.path && item.component && item.route !== false && !item.hidden);
}

/**
 * 归一化为 TanStack 子路由路径（相对受保护布局，去除前导/尾部斜杠）。
 */
function normalizeChildPath(path: string): string {
  let next = path.startsWith('/') ? path.slice(1) : path;
  if (next.length > 1 && next.endsWith('/')) {
    next = next.slice(0, -1);
  }
  return next;
}

/**
 * 将嵌套菜单树扁平化为路由列表（兼容 children 与 childrenRoute）。
 */
export function flattenRoutes(routes: RouteItem[]): FlatRoute[] {
  const result: FlatRoute[] = [];

  for (const route of routes) {
    if (isValidRoute(route)) {
      result.push({
        path: normalizeChildPath(route.path),
        component: route.component,
        menuKey: route.id,
        meta: route.meta,
      });
    }

    if (route.children?.length) {
      result.push(...flattenRoutes(route.children));
    }
    if (route.childrenRoute?.length) {
      result.push(...flattenRoutes(route.childrenRoute));
    }
  }

  return result;
}

/**
 * 基于菜单数据为受保护布局生成动态子路由。
 *
 * @param parentRoute 受保护布局路由（pathless layout route）
 * @param menus 后端菜单树
 */
export function createDynamicRoutes(parentRoute: AnyRoute, menus: RouteItem[]): AnyRoute[] {
  const seen = new Set<string>();
  const routes: AnyRoute[] = [];

  for (const flat of flattenRoutes(menus)) {
    if (!flat.path || seen.has(flat.path)) {
      continue;
    }
    seen.add(flat.path);

    const route = createRoute({
      getParentRoute: () => parentRoute,
      path: flat.path,
      component: resolvePageComponent(flat.component),
      beforeLoad: ({ location }: { location: { pathname: string } }) => ensurePermission(flat.meta, location.pathname),
    } as never);

    routes.push(route as AnyRoute);
  }

  return routes;
}
