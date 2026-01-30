# 权限点管理模块

## 模块说明

权限点管理模块用于维护系统的权限点信息，包括按钮权限、接口权限和其他类型权限的增删改查操作。

## 文件结构

```
Permission/
├── components/              # 组件目录
│   ├── PermissionInfoModal.tsx    # 权限点信息弹窗（新增/编辑/查看）
│   ├── SearchForm.tsx             # 搜索表单组件
│   └── TableActionButtons.tsx     # 表格操作按钮组件
├── hooks/                   # Hooks目录
│   ├── usePermissionActions.ts      # 权限点操作相关hook（增删改查）
│   ├── usePermissionModals.ts       # 弹窗状态管理hook
│   ├── usePermissionPermissions.ts  # 权限检查hook
│   └── usePermissionTableColumn.tsx # 表格列配置hook
├── constants.ts             # 常量定义（资源类型、状态选项等）
├── types.ts                 # 模块类型定义
├── index.tsx                # 主页面组件
└── README.md                # 模块说明文档
```

## 主要功能

### 1. 基础功能
- ✅ 权限点列表查询（分页）
- ✅ 新增权限点
- ✅ 编辑权限点
- ✅ 查看权限点详情
- ✅ 删除权限点
- ✅ 批量删除

### 2. 高级功能
- ✅ 搜索功能（支持权限编码、名称、资源类型、状态）
- ✅ 状态切换（启用/停用）
- ✅ 批量导入（Excel）
- ✅ 批量导出（CSV/Excel）
- ✅ 双击查看详情

### 3. 交互特性
- ✅ 使用DragModal可拖动弹窗
- ✅ 弹窗打开自动聚焦第一个输入框
- ✅ 表单验证错误自动滚动到错误字段
- ✅ 权限控制（所有操作基于权限点）

## 资源类型

| 值 | 类型 | 说明 |
|----|------|------|
| 1  | 按钮 | 页面按钮权限 |
| 2  | 接口 | API接口权限 |
| 4  | 其他 | 其他类型权限 |

## 权限点编码规范

建议使用 `模块:功能:操作` 的格式，例如：
- `sys:permission:add` - 新增权限点
- `sys:permission:edit` - 编辑权限点
- `sys:permission:delete` - 删除权限点
- `sys:permission:updateStatus` - 更新状态
- `sys:permission:import` - 导入权限点
- `sys:permission:export` - 导出权限点

## 技术栈

- React 19
- Ant Design 5
- TanStack Query (React Query)
- TypeScript
- Tailwind CSS

## 注意事项

1. 本模块采用编译器模式优化，未使用 `memo`、`useCallback` 等缓存方式
2. 组件拆分合理，hooks封装清晰
3. 所有操作都有完整的权限控制
4. 服务层采用与用户管理模块相同的结构（Action枚举 + Interface + 实现）
