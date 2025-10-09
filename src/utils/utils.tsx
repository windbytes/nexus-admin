import * as Icons from '@ant-design/icons';
import React from 'react';
import { MyIcon } from '@/components/MyIcon/index';
import { LazyLoad } from '@/router/lazyLoad';
import type { RouteItem, RouteObject } from '@/types/route';
import { isObject } from './is';

/**
 * @description 使用递归处理路由菜单，生成一维数组，做菜单权限判断
 * @param {Array} routerList 所有菜单列表
 * @param newArr
 * @return array
 */
export function handleRouter(routerList: RouteItem[], newArr: RouteObject[] = []) {
  if (!routerList) return newArr;
  for (const item of routerList) {
    const menu: RouteObject = {
      handle: {
        menuKey: item.id,
      },
    };
    if (typeof item === 'object' && item.path && item.route) {
      menu.path = item.path;
      menu.component = LazyLoad(item.component).type;
      // 这里要添加id
      newArr.push(menu);
    }
    if (item.children?.length) {
      menu.children = [];
      handleRouter(item.children, newArr);
    }
    if (item.childrenRoute?.length) {
      menu.children = [];
      handleRouter(item.childrenRoute, newArr);
    }
  }
  return newArr;
}

/**
 * Add the object as a parameter to the URL
 * @param baseUrl url
 * @param obj
 * @returns {string}
 * eg:
 *  let obj = {a: '3', b: '4'}
 *  setObjToUrlParams('www.baidu.com', obj)
 *  ==>www.baidu.com?a=3&b=4
 */
export function setObjToUrlParams(baseUrl: string, obj: any): string {
  let parameters = '';
  for (const key in obj) {
    parameters += `${key}=${encodeURIComponent(obj[key])}&`;
  }
  parameters = parameters.replace(/&$/, '');
  return /\?$/.test(baseUrl) ? baseUrl + parameters : baseUrl.replace(/\/?$/, '?') + parameters;
}

export function deepMerge<T = object>(src: Record<string, any> = {}, target: any = {}): T {
  let key: string;
  for (key in target) {
    if (isObject(src[key])) {
      src[key] = deepMerge(src[key], target[key]);
    } else {
      src[key] = target[key];
    }
  }
  return src as T;
}

/**
 * @description 递归查询对应的路由
 * @param path 当前访问地址
 * @param routes 路由列表
 * @returns array
 */
export const searchRoute = (path: string, routes: RouteItem[] = []): RouteItem | null => {
  for (const item of routes) {
    if (item.path === path) return item;
    if (item.children) {
      const res = searchRoute(path, item.children);
      if (res) {
        return res;
      }
    }
  }
  return null;
};

// 动态渲染 Icon 图标(目前使用antd的图标库和自定义的图标库-iconfont)
const customIcons: { [key: string]: any } = Icons;

/**
 * 图标库
 * @param name 图表名
 */
export const getIcon = (name: string | undefined | null) => {
  if (name && name.indexOf('nexus') > -1) {
    return <MyIcon type={`${name}`} />;
  }
  return addIcon(name);
};

/**
 * 使用antd的图标库
 * @param name 图标名
 * @returns
 */
export const addIcon = (name: string | undefined | null) => {
  if (!name || !customIcons[name]) {
    return null;
  }
  return React.createElement(customIcons[name]);
};

/**
 * @description 根据菜单结构获取需要展开的 subMenu
 * @param {String} path 当前访问地址
 * @param {Array} menus 菜单列表
 * @returns array
 */
export const getOpenKeys = (path: string, menus: RouteItem[] = []) => {
  const openKeys: string[] = [];
  
  /**
   * 递归查找路径对应的菜单项，并收集所有父级菜单的路径
   * @param menuList 菜单列表
   * @param targetPath 目标路径
   * @param parentPaths 父级路径数组
   * @returns 是否找到目标路径
   */
  const findMenuPath = (menuList: RouteItem[], targetPath: string, parentPaths: string[] = []): boolean => {
    for (const menu of menuList) {
      // 跳过隐藏的菜单项
      if (menu.hidden || menu.meta?.menuType === 2 || menu.meta?.menuType === 3) {
        continue;
      }
      
      // 如果找到目标路径
      if (menu.path === targetPath) {
        // 将当前路径的所有父级路径添加到 openKeys
        openKeys.push(...parentPaths);
        return true;
      }
      
      // 如果有子菜单，递归查找
      if (menu.children && menu.children.length > 0) {
        const currentParentPaths = [...parentPaths, menu.path];
        if (findMenuPath(menu.children, targetPath, currentParentPaths)) {
          return true;
        }
      }
      
      // 如果有子路由，也递归查找
      if (menu.childrenRoute && menu.childrenRoute.length > 0) {
        const currentParentPaths = [...parentPaths, menu.path];
        if (findMenuPath(menu.childrenRoute, targetPath, currentParentPaths)) {
          return true;
        }
      }
    }
    return false;
  };
  
  // 在菜单中查找目标路径
  findMenuPath(menus, path);
  
  return openKeys;
};

/**
 * 将后台拿到的数据映射成包含key的数据，用于react相关组件
 * @param data 数据
 * @param key 数据中的唯一字段
 * @returns 映射的数据
 */
export const addKeyToData = (data: any[], key: string) => {
  return data.map((item) => {
    const newItem = { ...item, key: item[key] };
    if (item.children) {
      newItem.children = addKeyToData(item.children, key);
    }
    return newItem;
  });
};

/**
 * 获取快捷键的标签
 * @param shortcut 快捷键字符串
 * @returns 格式化后的快捷键标签
 */
export function getShortcutLabel(shortcut: string): string {
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  return shortcut
    .replace('ctrl', isMac ? '⌘' : 'Ctrl')
    .replace('shift', isMac ? '⇧' : 'Shift')
    .replace('alt', isMac ? '⌥' : 'Alt')
    .replace('meta', isMac ? '⌘' : 'Meta'); // 可选;
}

/**
 * 转换树组件的数据
 * @param data 树组件的数据
 * @param expanded 展开的节点
 * @param t 国际化函数
 * @returns 转换后的数据
 */
export function transformData(data: any[], expanded: string[], t: (key: string) => string) {
  return data.map((item: any) => {
    const newItem = {
      ...item, // 先拷贝一份，避免修改原对象
      icon: item.icon ? getIcon(item.icon) : undefined,
      originalIcon: item.icon,
      name: t(item.name),
    };

    if (item.children?.length > 0) {
      expanded.push(item.id);
      newItem.children = transformData(item.children, expanded, t);
    }

    return newItem;
  });
}
