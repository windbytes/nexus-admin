import { useMenuStore, usePreferencesStore } from '@/stores/store';
import type { RouteItem } from '@/types/route';
import { getIcon } from '@/utils/optimized-icons';
import { matchPathname, type MenuCaches } from '@/utils/utils';
import { Link, useRouterState } from '@tanstack/react-router';
import { Breadcrumb } from 'antd';
import { t } from 'i18next';
import type React from 'react';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import '../header.scss';

/**
 * 面包屑
 * @return JSX
 */
const BreadcrumbNav: React.FC = () => {
  // 获取路由的地址，地址变化的时候去获取对应的菜单项，以此来拼接面包屑
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // 从后台获取的路由菜单
  const { menus, caches } = useMenuStore(
    useShallow((state) => ({
      menus: state.menus,
      caches: state.caches,
    }))
  );
  const [items, setItems] = useState<Record<string, any>[]>([]);
  // 从全局状态中获取配置是否开启面包屑、图标
  const breadcrumb = usePreferencesStore((state) => state.preferences.breadcrumb);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const breadItems = patchBreadcrumb(menus, caches, pathname, breadcrumb.showIcon);
    if (breadItems.length > 0) {
      setItems(breadItems);
      return;
    }
    setItems([]);
  }, [pathname, menus, caches, breadcrumb, t, i18n.language]);

  // 组件的DOM内容
  return <Breadcrumb items={items} className="flex justify-between items-center nexus-breadcrumb" style={{ marginLeft: '16px' }} />;
};
export default memo(BreadcrumbNav);

/**
 * 根据路径生成面包屑的路径内容
 * @param routerList 菜单集合
 * @param pathname 路径
 * @param joinIcon 是否显示图标
 * @returns 面包屑内容集合
 */
function patchBreadcrumb(
  routerList: RouteItem[],
  caches: MenuCaches,
  pathname: string,
  joinIcon: boolean
): Record<string, any>[] {
  if (!routerList?.length || !caches?.pathMap?.size) {
    return [];
  }

  const { pathMap, ancestorsMap, routeToMenuPathMap } = caches;
  const breadcrumbItems: Record<string, any>[] = [];

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

  const visiblePath = routeToMenuPathMap.get(matchedPath) ?? matchedPath;
  const ancestorPaths = ancestorsMap.get(visiblePath) ?? [];
  const breadcrumbPaths = [...ancestorPaths, visiblePath];

  if (matchedPath !== visiblePath) {
    breadcrumbPaths.push(matchedPath);
  }

  breadcrumbPaths.forEach((path, index) => {
    const menu = pathMap.get(path);
    if (!menu) {
      return;
    }

    const isLast = index === breadcrumbPaths.length - 1;
    const iconNode = joinIcon && menu.meta?.icon ? getIcon(menu.meta.icon) : null;
    const titleContent = t(menu.meta?.title as string);
    const isNotRoute = menu.meta?.menuType !== 2;
    const title = (isLast || isNotRoute) ? (
      <>
        {iconNode}
        <span style={{ padding: '0 4px' }}>{titleContent}</span>
      </>
    ) : (
      <>
        {iconNode}
        <Link to={menu.path}>{titleContent}</Link>
      </>
    );

    breadcrumbItems.push({
      key: menu.path,
      title,
    });
  });

  return breadcrumbItems;
}
