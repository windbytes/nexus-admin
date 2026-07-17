import { Breadcrumb, type BreadcrumbProps } from 'antd';
import { t } from 'i18next';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from '@tanstack/react-router';
import { useShallow } from 'zustand/react/shallow';
import { useMenuStore, usePreferencesStore } from '@/shared/stores/preferences.store';
import type { RouteItem } from '@/types/route';
import { getIcon } from '@/shared/utils/optimized-icons';
import { getMenuKey, type MenuCaches, matchPathname } from '@/shared/utils/utils';
import '../header.css';

type BreadcrumbItem = NonNullable<BreadcrumbProps['items']>[number];

/**
 * 在菜单树中根据 menuKey 查找对应的路由项（与 resolveMenuSelection 使用的 key 一致）
 */
function findRouteByMenuKey(routes: RouteItem[] | undefined, menuKey: string): RouteItem | undefined {
  if (!routes?.length) {
    return undefined;
  }
  for (const route of routes) {
    if (getMenuKey(route) === menuKey) {
      return route;
    }
    const inChildren = findRouteByMenuKey(route.children, menuKey);
    if (inChildren) {
      return inChildren;
    }
    const inChildrenRoute = findRouteByMenuKey(route.childrenRoute as RouteItem[] | undefined, menuKey);
    if (inChildrenRoute) {
      return inChildrenRoute;
    }
  }
  return undefined;
}

/**
 * 面包屑
 * @return JSX
 */
const BreadcrumbNav: React.FC = () => {
  const { pathname } = useLocation();
  // 从后台获取的路由菜单
  const { menus, caches } = useMenuStore(
    useShallow((state) => ({
      menus: state.menus,
      caches: state.caches,
    }))
  );
  // 从全局状态中获取配置是否开启面包屑、图标
  const breadcrumb = usePreferencesStore((state) => state.preferences.breadcrumb);
  const { i18n } = useTranslation();
  const items = patchBreadcrumb(menus, caches, pathname, breadcrumb.showIcon, i18n.language);

  return <Breadcrumb items={items} className="flex justify-between items-center ml-[16px]! syndra-breadcrumb" />;
};
export default BreadcrumbNav;

/**
 * 根据当前打开的菜单生成完整的面包屑路径（与 resolveMenuSelection 逻辑一致：使用 menuKey 链）
 * @param routerList 菜单集合
 * @param caches 菜单缓存（pathMap / ancestorsMap / routeToMenuPathMap）
 * @param pathname 当前路径
 * @param joinIcon 是否显示图标
 * @returns 面包屑内容集合
 */
function patchBreadcrumb(
  routerList: RouteItem[],
  caches: MenuCaches,
  pathname: string,
  joinIcon: boolean,
  _language: string
): BreadcrumbItem[] {
  if (!routerList?.length || !caches?.pathMap?.size) {
    return [];
  }

  const { pathMap, ancestorsMap, routeToMenuPathMap } = caches;
  const breadcrumbItems: BreadcrumbItem[] = [];

  let matchedPath: string | null = null;
  let matchedEntity: RouteItem | undefined;

  if (pathMap.has(pathname)) {
    matchedPath = pathname;
    matchedEntity = pathMap.get(pathname);
  } else {
    for (const [path, entity] of pathMap.entries()) {
      if (matchPathname(path, pathname)) {
        matchedPath = path;
        matchedEntity = entity;
        break;
      }
    }
  }

  if (!matchedPath || !matchedEntity) {
    return [];
  }

  // 与 resolveMenuSelection 一致：当前选中项的 menuKey，以及需要展开的祖先 menuKey 链
  const menuKey = getMenuKey(matchedEntity);
  const isPureRoute = matchedEntity.meta?.menuType === 2 || matchedEntity.hidden;
  const visibleKey = isPureRoute ? (routeToMenuPathMap.get(matchedPath) ?? menuKey) : menuKey;
  const ancestorKeys = ancestorsMap.get(visibleKey) ?? [];
  const breadcrumbKeys: string[] = [...ancestorKeys, visibleKey];

  // 若当前页是纯路由（如详情页），面包屑末尾追加当前页
  if (isPureRoute) {
    breadcrumbKeys.push(matchedPath);
  }

  for (let i = 0; i < breadcrumbKeys.length; i++) {
    const key = breadcrumbKeys[i];
    if (key === undefined) {
      continue;
    }
    // menuKey 可能是 path 或 id，先查 pathMap，再在菜单树中按 getMenuKey 查找
    const menu = pathMap.get(key) ?? findRouteByMenuKey(routerList, key);
    if (!menu) {
      continue;
    }

    const iconName = menu.meta?.icon ?? '';
    const iconNode = joinIcon && iconName ? getIcon(iconName) : null;
    const titleContent = t(menu.meta?.title as string);
    const isRouteNode = menu.route;
    const hasPath = Boolean(menu.path?.trim());
    const toPath: string = menu.path ?? '/';
    const title =
      !isRouteNode || !hasPath ? (
        <>
          {iconNode}
          <span className="px-1">{titleContent}</span>
        </>
      ) : (
        <>
          {iconNode}
          <Link to={toPath}>
            <span className="px-1">{titleContent}</span>
          </Link>
        </>
      );

    const itemKey: string = menu.path?.trim() || getMenuKey(menu);
    breadcrumbItems.push({
      key: itemKey,
      title,
    });
  }

  return breadcrumbItems;
}
