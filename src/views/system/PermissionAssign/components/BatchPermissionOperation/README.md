# 批量权限操作组件

## 组件结构

本组件按照最小化渲染原则和避免重复渲染的原则进行了拆分，包含以下子组件：

### 1. OperationConfigBar (操作配置栏)
- **文件**: `OperationConfigBar.tsx`
- **职责**: 负责权限类型、操作类型选择和操作按钮
- **优化**: 独立的 memo 组件，只有相关 props 变化时才重渲染

### 2. RoleSelector (角色选择器)
- **文件**: `RoleSelector.tsx`
- **职责**: 负责角色选择和多选展示
- **优化**: 使用 useMemo 缓存列定义和选项数据，避免不必要的重渲染

### 3. PermissionSelector (权限选择器)
- **文件**: `PermissionSelector.tsx`
- **职责**: 负责权限选择和多选展示
- **优化**: 独立的 memo 组件，权限类型变化时自动清空选择

### 4. BatchOperationModal (批量操作确认弹窗)
- **文件**: `BatchOperationModal.tsx`
- **职责**: 负责显示批量操作的确认信息
- **优化**: 使用 useMemo 缓存计算数据，避免重复计算

### 5. BatchPermissionOperation (主组件)
- **文件**: `BatchPermissionOperation.tsx`
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
import BatchPermissionOperation from '@/views/system/PermissionAssign/BatchPermissionOperation';

// 直接使用
<BatchPermissionOperation />
```

## 文件结构

```
BatchPermissionOperation/
├── index.tsx                    # 组件导出文件
├── BatchPermissionOperation.tsx # 主组件
├── OperationConfigBar.tsx       # 操作配置栏
├── RoleSelector.tsx            # 角色选择器
├── PermissionSelector.tsx      # 权限选择器
├── BatchOperationModal.tsx     # 批量操作确认弹窗
└── README.md                   # 说明文档
```
