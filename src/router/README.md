# TanStack Router 实现说明

本文档说明如何使用基于 `@tanstack/react-router` 的新路由系统。

## 📁 文件结构

```
src/
├── router-new/              # 新的路由系统（TanStack Router）
│   ├── index.ts            # 路由模块导出
│   ├── router.tsx          # Router 组件
│   ├── routes.ts           # 静态路由配置
│   ├── routeTree.ts        # 动态路由树管理器
│   ├── routeUtils.ts       # 路由工具函数
│   └── README.md           # 本文档
├── routes-new/             # TanStack Router 文件路由（保留，用于参考）
│   ├── __root.tsx          # 根路由
│   ├── index.tsx           # 首页重定向
│   ├── login.tsx           # 登录页
│   ├── login2.tsx          # 登录页2
│   └── _authenticated/     # 认证布局
│       ├── 404.tsx
│       ├── 403.tsx
│       └── 500.tsx
├── App-new.tsx             # 新的应用主组件
├── main-new.tsx            # 新的入口文件
└── GlobalConfigProvider-new.tsx  # 新的全局配置组件
```

## 🚀 使用方法

### 1. 启用新路由系统

修改项目的入口文件，使用新的路由系统：

```bash
# 备份原文件
mv src/main.tsx src/main-old.tsx
mv src/App.tsx src/App-old.tsx
mv src/GlobalConfigProvider.tsx src/GlobalConfigProvider-old.tsx

# 使用新文件
mv src/main-new.tsx src/main.tsx
mv src/App-new.tsx src/App.tsx
mv src/GlobalConfigProvider-new.tsx src/GlobalConfigProvider.tsx
```

### 2. 核心概念

#### 2.1 路由结构

- **根路由 (rootRoute)**: 所有路由的根节点
- **认证布局 (authenticatedRoute)**: 需要登录才能访问的路由都在此布局下
- **静态路由 (baseRoutes)**: 登录、错误页等固定路由
- **动态路由**: 根据菜单数据动态生成的业务路由

#### 2.2 路由生成流程

```
用户登录
  ↓
获取角色菜单 (getMenuListByRoleId)
  ↓
存储菜单到 store (setMenus)
  ↓
Router 组件监听菜单变化
  ↓
调用 routeTreeManager.generateRoutes(menus)
  ↓
生成动态路由并创建路由树
  ↓
渲染 RouterProvider
```

#### 2.3 路由权限控制

使用 `beforeLoad` 钩子进行权限控制：

```typescript
// 认证检查
beforeLoad: async ({ location }) => {
  const { isLogin } = useUserStore.getState();
  
  if (!isLogin) {
    throw redirect({
      to: '/login',
      search: { redirect: location.href },
    });
  }
}
```

### 3. 添加新的静态路由

在 `router-new/routes.ts` 中添加：

```typescript
export const yourNewRoute = createRoute({
  getParentRoute: () => rootRoute, // 或 authenticatedRoute
  path: '/your-path',
  component: YourComponent,
  beforeLoad: async () => {
    // 权限检查逻辑
  },
});

// 添加到 baseRoutes
export const baseRoutes = [
  // ... 其他路由
  yourNewRoute,
];
```

### 4. 动态路由配置

动态路由基于菜单数据生成，菜单格式：

```typescript
interface RouteItem {
  id: string;           // 菜单ID
  path: string;         // 路径
  component: string;    // 组件路径（相对于 views 目录）
  route: boolean;       // 是否是路由
  hidden?: boolean;     // 是否隐藏
  meta?: {
    title: string;
    requiresAuth?: boolean;
    // ... 其他元数据
  };
  children?: RouteItem[];
  childrenRoute?: RouteItem[];
}
```

### 5. 组件懒加载

路由组件自动懒加载：

```typescript
// routeUtils.ts 中的 lazyLoadComponent 函数会自动处理
lazyLoadComponent('Home')  // → lazy(() => import('../views/Home'))
```

支持两种路径格式：
- `views/Home/index.tsx`
- `views/Home.tsx`

## 🔧 配置选项

### Router 配置

在 `router-new/router.tsx` 中配置：

```typescript
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',     // 预加载策略
  defaultPreloadDelay: 100,      // 预加载延迟
  defaultErrorComponent,         // 全局错误组件
  defaultNotFoundComponent,      // 404组件
});
```

## 📋 对比旧系统

| 特性 | 旧系统 (react-router) | 新系统 (TanStack Router) |
|------|---------------------|------------------------|
| 路由配置 | 配置对象 | 类型安全的 API |
| 类型安全 | ❌ 弱 | ✅ 强 |
| 预加载 | ❌ 无 | ✅ 支持 |
| 开发工具 | ❌ 无 | ✅ DevTools |
| 权限控制 | loader | beforeLoad |
| 布局嵌套 | children | getParentRoute |

## 🐛 调试

开发环境下会自动显示 TanStack Router DevTools，可以：
- 查看当前路由树
- 查看路由参数
- 查看路由状态
- 调试路由跳转

## ⚠️ 注意事项

1. **路径规范**: 所有路径必须以 `/` 开头
2. **组件路径**: 相对于 `src/views` 目录
3. **权限检查**: 在 `beforeLoad` 中进行
4. **菜单变化**: Router 会自动响应菜单变化重新生成路由
5. **懒加载**: 所有路由组件都会自动懒加载

## 🔄 迁移步骤

如果要将现有页面迁移到新系统：

1. ✅ 确保组件在 `views` 目录下
2. ✅ 菜单数据包含正确的 `component` 路径
3. ✅ 移除旧的路由配置
4. ✅ 使用新的入口文件
5. ✅ 测试所有路由和权限

## 📚 相关文档

- [TanStack Router 官方文档](https://tanstack.com/router)
- [TanStack Router API 参考](https://tanstack.com/router/latest/docs/framework/react/api)

