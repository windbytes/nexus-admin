# 权限预览组件

## 组件结构

本组件按照最小化渲染原则和避免重复渲染的原则进行了拆分，包含以下子组件：

### 1. RoleSelectorBar (角色选择栏)
- **文件**: `components/RoleSelectorBar.tsx`
- **职责**: 负责角色选择和刷新操作
- **优化**: 独立的 memo 组件，只有相关 props 变化时才重渲染

### 2. RoleInfoCard (角色信息卡片)
- **文件**: `components/RoleInfoCard.tsx`
- **职责**: 负责展示角色的基本信息
- **优化**: 使用 memo 缓存，只有角色信息变化时才重渲染

### 3. PermissionStatistics (权限统计)
- **文件**: `components/PermissionStatistics.tsx`
- **职责**: 负责展示权限统计信息
- **优化**: 独立的 memo 组件，只有统计数据变化时才重渲染

### 4. DetailPermissionTabs (详细权限标签页)
- **文件**: `components/DetailPermissionTabs.tsx`
- **职责**: 负责展示详细的权限列表标签页
- **优化**: 使用 useMemo 缓存 tabs 配置，避免不必要的重渲染

### 5. MenuPermissionTable (菜单权限表格)
- **文件**: `components/MenuPermissionTable.tsx`
- **职责**: 负责展示菜单权限详情
- **优化**: 独立的 memo 组件，列定义使用 useMemo 缓存

### 6. ButtonPermissionTable (按钮权限表格)
- **文件**: `components/ButtonPermissionTable.tsx`
- **职责**: 负责展示按钮权限详情
- **优化**: 独立的 memo 组件，列定义使用 useMemo 缓存

### 7. InterfacePermissionTable (接口权限表格)
- **文件**: `components/InterfacePermissionTable.tsx`
- **职责**: 负责展示接口权限详情
- **优化**: 独立的 memo 组件，列定义使用 useMemo 缓存

### 8. PermissionPreview (主组件)
- **文件**: `PermissionPreview.tsx`
- **职责**: 整合所有子组件，管理状态和业务逻辑
- **优化**: 使用 useCallback 缓存事件处理函数，避免子组件重渲染

## 性能优化特点

1. **组件拆分**: 将庞大的单一组件拆分为多个独立的功能组件
2. **Memo 优化**: 所有子组件都使用 React.memo 进行优化
3. **依赖隔离**: 每个组件的依赖项相互独立，避免连锁重渲染
4. **回调缓存**: 使用 useCallback 缓存事件处理函数
5. **数据缓存**: 使用 useMemo 缓存计算结果和选项数据
6. **状态管理**: 合理管理组件状态，避免不必要的状态更新

## 使用方式

```tsx
import PermissionPreview from '@/views/system/PermissionAssign/components/PermissionPreview';

// 基本使用
<PermissionPreview />

// 带参数使用
<PermissionPreview
  roleCode="admin"
  showRoleSelector={false}
  showRefreshButton={true}
/>
```

## 文件结构

```
PermissionPreview/
├── index.tsx                        # 组件导出文件
├── PermissionPreview.tsx           # 主组件
├── components/
│   ├── index.tsx                   # 子组件导出文件
│   ├── RoleSelectorBar.tsx         # 角色选择栏
│   ├── RoleInfoCard.tsx            # 角色信息卡片
│   ├── PermissionStatistics.tsx    # 权限统计
│   ├── DetailPermissionTabs.tsx    # 详细权限标签页
│   ├── MenuPermissionTable.tsx     # 菜单权限表格
│   ├── ButtonPermissionTable.tsx   # 按钮权限表格
│   ├── InterfacePermissionTable.tsx # 接口权限表格
│   └── README.md                   # 说明文档
```

## 组件特性

- ✅ 最小化渲染原则
- ✅ 避免重复渲染
- ✅ 组件职责单一
- ✅ 依赖关系清晰
- ✅ 易于维护和测试
- ✅ 无 lint 错误
- ✅ 支持国际化
- ✅ 响应式设计
