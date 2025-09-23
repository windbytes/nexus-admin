import React, { useMemo, type ReactNode } from "react";
import { Navigate, redirect, useLocation, useRoutes } from "react-router";
import { useMenuStore } from "@/stores/store";
import type { RouteObject } from "@/types/route";
import { handleRouter } from "@/utils/utils";
import { LazyLoad } from "./lazyLoad";
import { useUserStore } from "@/stores/userStore";

// 默认的错误路由
const errorRoutes: RouteObject[] = [
  {
    path: "/500",
    component: LazyLoad("error/500.tsx").type,
    handle: {
      menuKey: "500",
    },
  },
  {
    path: "/404",
    component: LazyLoad("error/404.tsx").type,
    handle: {
      menuKey: "404",
    },
  },
  {
    path: "/403",
    component: LazyLoad("error/403.tsx").type,
    handle: {
      menuKey: "403",
    },
  },
  {
    path: "*",
    component: () => <Navigate replace to="/404" />,
    handle: {
      menuKey: "404",
    },
  },
];

// 动态路由
export const dynamicRoutes: RouteObject[] = [
  {
    path: "/",
    component: React.lazy(
      () => import("@/layouts/index.tsx")
    ) as unknown as ReactNode,
    children: [],
    handle: {
      menuKey: "home",
    },
  },
  {
    path: "/login",
    component: LazyLoad("Login").type,
    handle: {
      menuKey: "login",
    },
  },
  {
    path: "/login2",
    component: LazyLoad("Login2").type,
    handle: {
      menuKey: "login2",
    },
  }
];

// 路由处理方式
const generateRouter = (routers: RouteObject[]) => {
  return routers.map((item: any) => {
    if (item.index) {
      return item;
    }
    item.element = <item.component />;
    item.loader = async () => {
      const { isLogin, homePath } = useUserStore();
      const location = useLocation();

      if (!isLogin) {
        // 未登录，允许访问登录页
        if (location.pathname !== "/login") {
          throw redirect("/login");
        }
      } else {
        // 已登录访问 "/"，自动跳转到首页
        if (location.pathname === "/") {
          throw redirect(homePath);
        }
      }
    };
    item.handle = {
      menuKey: item?.handle?.menuKey,
    };
    if (item.children) {
      item.children = generateRouter(item.children);
      if (item.children.length) {
        item.children.unshift({
          index: true,
          element: <Navigate to={item.children[0].path} replace />,
        });
      }
    }
    return item;
  });
};

/**
 * 路由部分
 */
export const Router = () => {
  // 从store中获取
  const { menus } = useMenuStore();

  // 使用 useMemo 来避免重复计算路由
  const routes = useMemo(() => {
    // 将动态路由和错误路由合并到一起
    const dynamicChildren = handleRouter(menus);
    if (dynamicRoutes && dynamicRoutes[0]) {
      dynamicRoutes[0].children = [...dynamicChildren, ...errorRoutes];
    }
    return generateRouter(dynamicRoutes); // 假设 generateRouter 是生成最终路由配置的函数
  }, [menus]); // 仅当 `menus` 变化时重新计算路由

  // 使用 useRoutes 来处理路由
  return useRoutes(routes);
};
