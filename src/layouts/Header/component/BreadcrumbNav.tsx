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
    <>
      <Breadcrumb
        items={items}
        className="flex justify-between items-center"
        style={{ marginLeft: "10px" }}
      />
    </>
  );
};
export default memo(BreadcrumbNav);

/**
 * 根据路径生成面包屑的路径内容
 * @param routerList 菜单集合
 * @param pathname 路径
 * @returns 面包屑内容集合
 */
function patchBreadcrumb(
  routerList: RouteItem[],
  pathname: string,
  joinIcon: boolean
): Record<string, any>[] {
  const result: Record<string, any>[] = [];
  if (routerList) {
    for (let i = 0; i < routerList.length; i++) {
      const item = routerList[i];
      if (
        pathname === item.path ||
        (pathname.includes(item.path) &&
          pathname.length > item.path.length &&
          pathname.substring(item.path.length, item.path.length + 1) === "/")
      ) {
        const pth: Record<string, any> = {};
        pth.title = (
          <>
            {joinIcon && item.meta?.icon && getIcon(item.meta.icon)}
            <span style={{ padding: "0 4px" }}>
              {t(item.meta?.title as string)}
            </span>
          </>
        );
        pth.key = item.path;
        if (pathname === item.path) {
          pth.title = (
            <>
              {joinIcon && item.meta?.icon && getIcon(item.meta.icon)}
              <Link to={item.path}>{t(item.meta?.title as string)}</Link>
            </>
          );
        }
        result.push(pth);
      }
      if (item.children && item.children.length > 0) {
        const rst = patchBreadcrumb(item.children, pathname, joinIcon);
        if (rst.length > 0) {
          return [...result, ...rst];
        }
      }
    }
  }
  return result;
}
