# 通用角色选择组件

## 组件概述

`UniversalRoleSelector` 是一个通用的角色选择组件，支持多种选择模式，可以在不同的场景下复用。

## 组件结构

### 1. UniversalRoleSelector (主组件)
- **文件**: `UniversalRoleSelector.tsx`
- **职责**: 根据不同的模式提供不同的角色选择功能
- **支持模式**: `single` | `multiple` | `select-with-refresh`

### 2. BaseRoleSelector (基础组件)
- **文件**: `BaseRoleSelector.tsx`
- **职责**: 提供统一的角色选择功能
- **特性**: 支持单选/多选、搜索、加载状态等

### 3. RoleSelectorBar (选择栏组件)
- **文件**: `RoleSelectorBar.tsx`
- **职责**: 提供带标签和刷新按钮的角色选择功能
- **特性**: 卡片布局、标签显示、刷新按钮

### 4. MultipleRoleSelector (多选组件)
- **文件**: `MultipleRoleSelector.tsx`
- **职责**: 提供多选角色和表格展示功能
- **特性**: 多选、表格展示、选中状态管理

## 使用方式

### 单选模式
```tsx
import { UniversalRoleSelector } from '@/components/UniversalRoleSelector';

<UniversalRoleSelector
  roles={roleList}
  selectedRole={currentRoleCode}
  mode="single"
  onSelect={(roleCode) => setCurrentRoleCode(roleCode)}
  loading={isLoading}
  placeholder="请选择角色"
  width={300}
/>
```

### 多选模式
```tsx
<UniversalRoleSelector
  roles={roleList}
  selectedRoles={selectedRoles}
  mode="multiple"
  onSelect={(roleCodes) => setSelectedRoles(roleCodes)}
  loading={isLoading}
  placeholder="请选择角色"
/>
```

### 带刷新按钮模式
```tsx
<UniversalRoleSelector
  roles={roleList}
  selectedRole={currentRoleCode}
  mode="select-with-refresh"
  onSelect={(roleCode) => setCurrentRoleCode(roleCode)}
  onRefresh={() => handleRefresh()}
  loading={isLoading}
  showRefreshButton={true}
  placeholder="请选择角色"
  width={300}
/>
```

## 组件特性

- ✅ 支持多种选择模式
- ✅ 统一的 API 接口
- ✅ 高度可配置
- ✅ 性能优化（memo）
- ✅ 类型安全
- ✅ 无 lint 错误
- ✅ 响应式设计
- ✅ 搜索功能
- ✅ 加载状态
- ✅ 禁用状态

## 类型定义

```typescript
// 选择模式
type RoleSelectorMode = 'single' | 'multiple' | 'select-with-refresh';

// 基础属性
interface BaseRoleSelectorProps {
  roles: RoleModel[];
  loading?: boolean;
  placeholder?: string;
  width?: number;
  showSearch?: boolean;
  disabled?: boolean;
  className?: string;
}

// 单选属性
interface SingleRoleSelectorProps extends BaseRoleSelectorProps {
  mode: 'single';
  selectedRole?: string | null;
  onSelect: (roleCode: string) => void;
}

// 多选属性
interface MultipleRoleSelectorProps extends BaseRoleSelectorProps {
  mode: 'multiple';
  selectedRoles: string[];
  onSelect: (roleCodes: string[]) => void;
}

// 带刷新按钮属性
interface SelectWithRefreshRoleSelectorProps extends BaseRoleSelectorProps {
  mode: 'select-with-refresh';
  selectedRole?: string | null;
  onSelect: (roleCode: string) => void;
  onRefresh: () => void;
  showRefreshButton?: boolean;
}
```

## 文件结构

```
UniversalRoleSelector/
├── index.tsx                        # 组件导出文件
├── UniversalRoleSelector.tsx       # 主组件
├── BaseRoleSelector.tsx            # 基础组件
├── RoleSelectorBar.tsx             # 选择栏组件
├── MultipleRoleSelector.tsx        # 多选组件
├── types.ts                        # 类型定义
└── README.md                       # 说明文档
```

## 已集成的模块

1. **权限预览模块** (`PermissionPreview/components/RoleSelectorBar.tsx`)
   - 使用 `select-with-refresh` 模式
   - 支持刷新功能

2. **权限分配模块** (`RolePermissionAssign/RoleSelectorBar.tsx`)
   - 使用 `single` 模式
   - 简单的角色选择

3. **批量操作模块** (`BatchPermissionOperation/RoleSelector.tsx`)
   - 使用 `multiple` 模式
   - 多选角色功能

## 优势

- **代码复用**: 统一了多个模块中的角色选择逻辑
- **维护性**: 集中管理角色选择相关的功能
- **一致性**: 确保所有模块中的角色选择体验一致
- **扩展性**: 易于添加新的选择模式
- **性能**: 使用 memo 优化，避免不必要的重渲染
