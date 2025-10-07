# ActivityTabBar 组件

基于 React 19.2 Activity 组件实现的 TabBar 组件，提供类似 Vue keep-alive 的功能。

## 特性

- ✅ 基于 React 19.2 Activity 组件实现
- ✅ 支持 tab 的添加、删除、切换
- ✅ 支持右键菜单操作（关闭、固定、重新加载等）
- ✅ 支持 keep-alive 功能，保持组件状态
- ✅ 支持滚动位置记忆
- ✅ 智能缓存管理
- ✅ 支持批量操作（关闭左侧、右侧、其他、全部）

## 使用方法

### 基本用法

```tsx
import ActivityTabBar from '@/components/TabBar/ActivityTabBar';

function App() {
  return (
    <div className="app">
      <ActivityTabBar className="my-tab-bar">
        {/* 这里放置路由组件 */}
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          {/* 其他路由 */}
        </Routes>
      </ActivityTabBar>
    </div>
  );
}
```

### 配置 keep-alive

在路由配置中设置 `meta.keepAlive` 为 `true`：

```tsx
const routes = [
  {
    path: '/home',
    component: Home,
    meta: {
      title: '首页',
      icon: 'home',
      keepAlive: true, // 启用 keep-alive
    },
  },
  {
    path: '/about',
    component: About,
    meta: {
      title: '关于',
      icon: 'info',
      keepAlive: false, // 不启用 keep-alive
    },
  },
];
```

## 组件对比

### 原 TabBar 组件
- 基于自定义 KeepAlive 组件实现
- 使用 Map 缓存组件实例
- 手动管理组件生命周期

### 新 ActivityTabBar 组件
- 基于 React 19.2 Activity 组件实现
- 利用 React 原生 Activity 组件的 `visible`/`hidden` 模式
- 更简洁的实现方式
- 更好的性能优化

## Activity 组件优势

1. **原生支持**: React 19.2 原生提供，无需额外依赖
2. **性能优化**: 自动处理组件的显示/隐藏，暂停副作用
3. **状态保持**: 组件状态和 DOM 结构被保留
4. **简洁实现**: 相比自定义实现更简洁

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| className | string | - | 自定义样式类名 |
| children | ReactNode | - | 子组件内容 |

### 右键菜单操作

- **关闭**: 关闭当前 tab
- **固定/取消固定**: 固定 tab 使其不可关闭
- **重新加载**: 重新加载当前 tab
- **在新窗口打开**: 在新浏览器窗口中打开
- **关闭左侧**: 关闭当前 tab 左侧的所有 tab
- **关闭右侧**: 关闭当前 tab 右侧的所有 tab
- **关闭其他**: 关闭除当前 tab 外的所有 tab
- **关闭全部**: 关闭所有 tab（保留首页）

## 调试工具

组件提供了以下调试方法，可通过浏览器控制台调用：

```javascript
// 清除指定 tab 的缓存
window.__activityTabBarClearCache('tab-key');

// 清除所有缓存
window.__activityTabBarClearAllCache();

// 智能清理缓存
window.__activityTabBarSmartClearCache();
```

## 注意事项

1. 需要 React 19.2 或更高版本
2. 确保路由配置正确设置 `meta.keepAlive`
3. 组件会自动管理缓存，无需手动清理
4. 页面刷新时会自动恢复 tab 状态
5. 用户退出登录时会自动清理所有缓存

## 迁移指南

从原 TabBar 组件迁移到 ActivityTabBar：

1. 替换组件导入
2. 确保 React 版本 >= 19.2
3. 检查路由配置中的 `meta.keepAlive` 设置
4. 测试功能完整性

```tsx
// 原组件
import TabBar from '@/components/TabBar';

// 新组件
import ActivityTabBar from '@/components/TabBar/ActivityTabBar';
```