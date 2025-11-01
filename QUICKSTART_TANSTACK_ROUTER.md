# TanStack Router 快速开始

本文档提供快速迁移和使用 TanStack Router 的指南。

## 🎯 快速迁移（推荐）

### 使用自动化脚本

```bash
# 1. 进入项目根目录
cd /Users/yeconglin/myProject/nexus-admin

# 2. 运行迁移脚本
bash scripts/migrate-to-tanstack-router.sh

# 3. 启动开发服务器
npm run dev
# 或
bun dev
```

### 如果需要回滚

```bash
bash scripts/rollback-tanstack-router.sh
```

## 📦 手动迁移

如果你想手动迁移，按照以下步骤：

### 1. 备份当前文件

```bash
mv src/router src/router-old
mv src/App.tsx src/App-old.tsx
mv src/main.tsx src/main-old.tsx
mv src/GlobalConfigProvider.tsx src/GlobalConfigProvider-old.tsx
mv src/layouts/Content/index.tsx src/layouts/Content/index-old.tsx
```

### 2. 启用新文件

```bash
mv src/router-new src/router
mv src/App-new.tsx src/App.tsx
mv src/main-new.tsx src/main.tsx
mv src/GlobalConfigProvider-new.tsx src/GlobalConfigProvider.tsx
mv src/layouts/Content/index-new.tsx src/layouts/Content/index.tsx
```

### 3. 启动开发服务器

```bash
npm run dev
```

## 🧪 测试清单

迁移后请测试以下功能：

### ✅ 基础功能
- [ ] 访问 `/login` 显示登录页面
- [ ] 登录成功后跳转到首页
- [ ] 刷新页面保持登录状态
- [ ] 退出登录后返回登录页

### ✅ 路由功能
- [ ] 左侧菜单显示正常
- [ ] 点击菜单项能正常跳转
- [ ] 浏览器前进/后退按钮正常工作
- [ ] 刷新页面保持在当前路由

### ✅ 权限控制
- [ ] 未登录时访问受保护页面自动跳转登录页
- [ ] 登录后能访问所有授权的菜单
- [ ] 访问无权限页面显示 403
- [ ] 访问不存在的路由显示 404

### ✅ 动态路由
- [ ] 切换角色后菜单正确更新
- [ ] 新增菜单后路由正确生成
- [ ] 路由懒加载正常工作

### ✅ 性能
- [ ] 页面切换流畅无卡顿
- [ ] 路由预加载正常工作
- [ ] 没有控制台错误

## 🔍 DevTools 使用

TanStack Router 提供了强大的开发工具：

### 打开 DevTools

开发模式下，页面右下角会显示 TanStack Router 的图标，点击即可打开。

### 主要功能

1. **路由树查看**: 查看当前的完整路由树
2. **当前路由**: 查看当前激活的路由及其参数
3. **路由历史**: 查看路由跳转历史
4. **性能分析**: 查看路由加载时间

### 常用调试技巧

```typescript
// 在组件中获取路由状态
import { useRouterState } from '@tanstack/react-router';

function MyComponent() {
  const routerState = useRouterState();
  
  console.log('当前路径:', routerState.location.pathname);
  console.log('路由参数:', routerState.location.search);
  console.log('路由状态:', routerState.status);
  
  return <div>...</div>;
}
```

## 📁 项目结构

```
src/
├── router/                    # 路由系统（TanStack Router）
│   ├── index.ts              # 模块导出
│   ├── router.tsx            # Router 组件
│   ├── routes.ts             # 静态路由配置
│   ├── routeTree.ts          # 动态路由树管理
│   ├── routeUtils.ts         # 路由工具函数
│   └── README.md             # 详细文档
│
├── routes-new/               # 文件路由示例（可选）
│   ├── __root.tsx
│   ├── login.tsx
│   └── _authenticated/
│
├── App.tsx                   # 主应用
├── main.tsx                  # 入口文件
├── GlobalConfigProvider.tsx  # 全局配置
│
└── layouts/
    └── Content/
        └── index.tsx         # 内容布局（TanStack Router 版本）
```

## 🚀 核心概念

### 1. 路由定义

```typescript
// 创建路由
const myRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/my-page',
  component: MyPageComponent,
  beforeLoad: async () => {
    // 权限检查、数据加载等
  },
});
```

### 2. 动态路由

动态路由基于菜单数据自动生成：

```typescript
// 菜单数据格式
{
  id: 'home',
  path: '/home',
  component: 'Home',  // 相对于 src/views
  route: true,
  meta: {
    title: '首页',
  }
}
```

### 3. 路由跳转

```typescript
import { useNavigate } from '@tanstack/react-router';

const navigate = useNavigate();

// 简单跳转
navigate({ to: '/home' });

// 带参数跳转
navigate({
  to: '/user/$id',
  params: { id: '123' },
  search: { tab: 'profile' },
});
```

### 4. 路由参数

```typescript
import { useParams, useSearch } from '@tanstack/react-router';

// 路径参数
const { id } = useParams({ from: '/user/$id' });

// 查询参数
const search = useSearch({ from: '/user/$id' });
console.log(search.tab); // 'profile'
```

## 🎨 新特性

### 1. 类型安全

```typescript
// 完整的类型推断
navigate({
  to: '/user/$id',
  params: { id: '123' }, // 类型检查
  search: { tab: 'profile' }, // 类型检查
});
```

### 2. 路由预加载

```typescript
// 鼠标悬停时自动预加载
<Link to="/about" preload="intent">
  关于我们
</Link>

// 手动预加载
router.preloadRoute({ to: '/about' });
```

### 3. 数据加载

```typescript
const route = createRoute({
  path: '/users',
  component: UsersComponent,
  beforeLoad: async () => {
    // 在路由加载前获取数据
    const users = await fetchUsers();
    return { users };
  },
});
```

## 📊 性能优化

### 1. 路由懒加载

所有路由组件都会自动懒加载，无需手动处理。

### 2. 预加载策略

```typescript
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',     // 悬停时预加载
  defaultPreloadDelay: 100,      // 预加载延迟
});
```

### 3. 组件缓存

使用 `ActivityKeepAlive` 保持组件状态：

```typescript
<ActivityKeepAlive>
  <YourComponent />
</ActivityKeepAlive>
```

## ⚠️ 注意事项

### 1. 导入路径

```typescript
// ✅ 正确
import { useNavigate } from '@tanstack/react-router';

// ❌ 错误
import { useNavigate } from 'react-router';
```

### 2. 路由配置

- 所有路径必须以 `/` 开头
- 组件路径相对于 `src/views`
- 动态路由参数使用 `$` 前缀

### 3. 权限检查

权限检查在 `beforeLoad` 中进行：

```typescript
beforeLoad: async ({ location }) => {
  const { isLogin } = useUserStore.getState();
  
  if (!isLogin) {
    throw redirect({ to: '/login' });
  }
}
```

## 📚 更多资源

- 📖 [详细迁移指南](./MIGRATION_TANSTACK_ROUTER.md)
- 📖 [路由系统文档](./src/router/README.md)
- 🌐 [TanStack Router 官方文档](https://tanstack.com/router)
- 💬 [GitHub Issues](https://github.com/TanStack/router/issues)

## 🆘 遇到问题？

1. 查看控制台错误信息
2. 使用 TanStack Router DevTools 调试
3. 查看 `MIGRATION_TANSTACK_ROUTER.md` 的常见问题部分
4. 运行回滚脚本恢复旧系统

## ✨ 开始使用

现在你已经准备好使用 TanStack Router 了！运行以下命令开始：

```bash
# 使用自动化脚本迁移
bash scripts/migrate-to-tanstack-router.sh

# 或手动迁移后
npm run dev
```

祝你使用愉快！🎉

