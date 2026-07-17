import type { RouteItem } from '@/types/route';

/**
 * 内置演示菜单
 *
 * 用于本地开发 / 无后端环境：当 `getMenusByRole` 接口不可用时回退到该数据，
 * 以便登录后直接预览「菜单驱动动态路由 + 布局」的完整链路。
 * 接入真实后端后，接口返回的菜单将优先生效，此处仅作兜底。
 *
 * 约定：
 * - 叶子节点必须带 `component`（相对 modules 的逻辑路径），用于解析页面组件；
 * - 分组节点 `component` 留空，不会生成可访问路由，仅用于侧边栏分组展示。
 */
export const defaultMenus: RouteItem[] = [
  {
    id: 'dashboard',
    path: '/dashboard',
    component: 'dashboard',
    meta: { title: '仪表盘', icon: 'DashboardOutlined', requiresAuth: true, keepAlive: true },
  },
  {
    id: 'system',
    path: '/system',
    component: '',
    meta: { title: '系统管理', icon: 'SettingOutlined', requiresAuth: true },
    children: [
      {
        id: 'system-user',
        path: '/system/user',
        component: 'system/user',
        meta: { title: '用户管理', icon: 'UserOutlined', requiresAuth: true, keepAlive: true },
      },
      {
        id: 'system-role',
        path: '/system/role',
        component: 'system/role',
        meta: { title: '角色管理', icon: 'ApartmentOutlined', requiresAuth: true },
      },
      {
        id: 'system-menu',
        path: '/system/menu',
        component: 'system/menu',
        meta: { title: '菜单管理', icon: 'AppstoreOutlined', requiresAuth: true },
      },
      {
        id: 'system-button',
        path: '/system/button',
        component: 'system/button',
        meta: { title: '按钮管理', icon: 'AppstoreOutlined', requiresAuth: true },
      },
      {
        id: 'system-api',
        path: '/system/api',
        component: 'system/api',
        meta: { title: '接口管理', icon: 'ApiOutlined', requiresAuth: true },
      },
    ],
  },
  {
    id: 'monitor',
    path: '/monitor',
    component: '',
    meta: { title: '系统监控', icon: 'DashboardOutlined', requiresAuth: true },
    children: [
      {
        id: 'monitor-online',
        path: '/monitor/online',
        component: 'monitor/online',
        meta: { title: '在线用户', icon: 'ClusterOutlined', requiresAuth: true },
      },
      {
        id: 'monitor-server',
        path: '/monitor/server',
        component: 'monitor/server',
        meta: { title: '服务器监控', icon: 'DatabaseOutlined', requiresAuth: true },
      },
    ],
  },
  {
    id: 'message',
    path: '/message',
    component: 'message',
    meta: { title: '消息中心', icon: 'BellOutlined', requiresAuth: true },
  },
];
