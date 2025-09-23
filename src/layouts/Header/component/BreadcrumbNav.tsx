import type React from "react";
import { memo, useEffect, useState } from "react";
import { Breadcrumb } from "antd";
import { Link, useLocation } from "react-router";
import type { RouteItem } from "@/types/route";
import { getIcon } from "@/utils/optimized-icons";
import { useMenuStore, usePreferencesStore } from "@/stores/store";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

/**
 * 面包屑
 * @return JSX
 */
const BreadcrumbNav: React.FC = () => {
  // 获取路由的地址，地址变化的时候去获取对应的菜单项，以此来拼接面包屑
  const location = useLocation();
  // 从后台获取的路由菜单
  const menuState = useMenuStore();
  const { menus } = menuState;
  const [items, setItems] = useState<Record<string, any>[]>([]);
  // 从全局状态中获取配置是否开启面包屑、图标
  const breadcrumb = usePreferencesStore(
    (state) => state.preferences.breadcrumb
  );
  const { t, i18n } = useTranslation();
  useEffect(() => {
    // 将menu里面的内容和path进行对照获取
    const breadItems = patchBreadcrumb(
      menus,
      location.pathname,
      breadcrumb.showIcon
    );
    if (breadItems.length > 0) {
      setItems(breadItems);
    }
    // 设置面包屑内容
  }, [location.pathname, menus, breadcrumb, t, i18n.language]);

  // 组件的DOM内容
  return (
    <Breadcrumb
        items={items}
        className="flex justify-between items-center"
        style={{ marginLeft: "10px" }}
      />
  );
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
  pathname: string,
  joinIcon: boolean
): Record<string, any>[] {
  const breadcrumbItems: Record<string, any>[] = [];
  
  /**
   * 递归查找路径对应的菜单项，并收集所有父级菜单的路径
   * @param menuList 菜单列表
   * @param targetPath 目标路径
   * @param parentItems 父级菜单项数组
   * @returns 是否找到目标路径
   */
  const findMenuBreadcrumb = (
    menuList: RouteItem[], 
    targetPath: string, 
    parentItems: Record<string, any>[] = []
  ): boolean => {
    for (const menu of menuList) {
      // 跳过隐藏的菜单项
      if (menu.hidden || menu.meta?.menuType === 2 || menu.meta?.menuType === 3) {
        continue;
      }
      
      // 创建当前菜单项的面包屑项
      const breadcrumbItem: Record<string, any> = {
        title: (
          <>
            {joinIcon && menu.meta?.icon && getIcon(menu.meta.icon)}
            <span style={{ padding: "0 4px" }}>
              {t(menu.meta?.title as string)}
            </span>
          </>
        ),
        key: menu.path,
      };
      
      // 如果是当前路径，添加链接
      if (menu.path === targetPath) {
        breadcrumbItem['title'] = (
          <>
            {joinIcon && menu.meta?.icon && getIcon(menu.meta.icon)}
            <Link to={menu.path}>{t(menu.meta?.title as string)}</Link>
          </>
        );
        // 将父级菜单项和当前菜单项都添加到结果中
        breadcrumbItems.push(...parentItems, breadcrumbItem);
        return true;
      }
      
      // 如果有子菜单，递归查找
      if (menu.children && menu.children.length > 0) {
        const currentParentItems = [...parentItems, breadcrumbItem];
        if (findMenuBreadcrumb(menu.children, targetPath, currentParentItems)) {
          return true;
        }
      }
      
      // 如果有子路由，也递归查找
      if (menu.childrenRoute && menu.childrenRoute.length > 0) {
        const currentParentItems = [...parentItems, breadcrumbItem];
        if (findMenuBreadcrumb(menu.childrenRoute, targetPath, currentParentItems)) {
          return true;
        }
      }
    }
    return false;
  };
  
  // 在菜单中查找目标路径
  findMenuBreadcrumb(routerList, pathname);
  
  return breadcrumbItems;
}
