# 权限管理 Mock 数据说明

本目录包含了权限管理相关的Mock数据，用于前端开发和测试。

## 文件结构

```
mock/
├── login.mock.ts              # 登录相关Mock
├── permission.mock.ts         # 权限管理总入口
├── permissionButton.mock.ts   # 权限按钮Mock
├── permissionAssign.mock.ts   # 权限分配Mock
├── permissionAudit.mock.ts    # 权限审计Mock
└── README.md                  # 说明文档
```

## 数据说明

### 1. 权限按钮 (PermissionButton)

**数据表对应**: `t_sys_menu` (menu_type = 3, 按钮权限)

**主要字段**:
- `id`: 按钮ID
- `name`: 按钮名称
- `code`: 权限代码 (对应 perms 字段)
- `menuId`: 所属菜单ID (对应 parent_id 字段)
- `menuName`: 所属菜单名称
- `parentMenuId`: 父级菜单ID
- `parentMenuName`: 父级菜单名称
- `description`: 描述信息
- `status`: 状态 (对应 status 字段)
- `sortNo`: 排序号 (对应 sort_no 字段)

**Mock数据特点**:
- 包含15个权限按钮示例
- 涵盖用户管理、角色管理、菜单管理、应用中心等模块
- 每个按钮都有对应的接口权限关联

### 2. 权限分配 (PermissionAssign)

**数据表对应**: 权限分配关系表

**主要字段**:
- `id`: 分配记录ID
- `roleId`: 角色ID
- `roleName`: 角色名称
- `permissionType`: 权限类型 (menu/button/interface)
- `permissionId`: 权限ID
- `permissionName`: 权限名称
- `permissionCode`: 权限代码
- `assignTime`: 分配时间
- `assignBy`: 分配人

**Mock数据特点**:
- 包含3个角色：系统管理员、普通用户、操作员
- 涵盖菜单权限、按钮权限、接口权限的分配关系
- 提供角色权限详情查询

### 3. 权限审计 (PermissionAudit)

**数据表对应**: 权限审计相关表

**主要功能**:
- 权限使用统计
- 权限变更日志
- 异常权限检测

**Mock数据特点**:
- 提供完整的统计数据
- 包含8条变更日志记录
- 包含8条异常检测结果

## 使用方式

### 启用Mock数据

在对应的Mock文件中，将 `enabled: false` 改为 `enabled: true` 即可启用Mock数据。

### API接口

所有Mock接口都遵循以下URL格式：
- 权限按钮: `/api/system/permission/button/*`
- 权限分配: `/api/system/permission/assign/*`
- 权限审计: `/api/system/permission/audit/*`

### 响应格式

所有Mock接口都返回统一的响应格式：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {} // 具体数据
}
```

## 数据库表结构对应

### t_sys_menu 表字段映射

| Mock字段 | 数据库字段 | 说明 |
|---------|-----------|------|
| id | id | 主键ID |
| name | name | 菜单/按钮名称 |
| code | perms | 权限代码 |
| menuId | parent_id | 父级菜单ID |
| description | description | 描述信息 |
| status | status | 状态 |
| sortNo | sort_no | 排序号 |
| createTime | create_time | 创建时间 |
| updateTime | update_time | 更新时间 |
| createBy | create_by | 创建人 |
| updateBy | update_by | 更新人 |

### 菜单类型说明

- `menu_type = 0`: 一级菜单
- `menu_type = 1`: 子菜单
- `menu_type = 2`: 子路由
- `menu_type = 3`: 按钮权限

## 注意事项

1. Mock数据仅用于前端开发和测试，生产环境请使用真实API
2. 数据中的ID和时间戳都是模拟数据，实际使用时需要根据后端接口调整
3. 权限代码命名规范：`模块:功能:操作`，如 `system:user:add`
4. 接口权限代码格式：`/api/模块/功能/操作`，如 `/api/system/user/add`

## 扩展说明

如需添加新的Mock数据：

1. 在对应的Mock文件中添加新的数据项
2. 确保数据格式与API接口定义一致
3. 更新此README文档
4. 测试Mock数据的正确性
