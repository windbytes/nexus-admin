# 端点维护模块

## 📋 目录

- [概述](#概述)
- [功能特性](#功能特性)
- [技术架构](#技术架构)
- [数据库设计](#数据库设计)
- [使用说明](#使用说明)
- [组件说明](#组件说明)
- [API接口](#api接口)

## 概述

端点维护模块是一个基于配置驱动的动态表单系统，用于统一管理各种类型的端点配置，包括HTTP端点、数据库端点、WebService端点、文件端点、定时器端点和MQ端点等。

## 功能特性

### ✨ 核心功能

- **多端点类型支持**：HTTP、数据库、WebService、文件、定时器、MQ等6种端点类型
- **配置驱动架构**：基于Schema配置的动态表单，无需为每种类型单独编写表单组件
- **统一管理界面**：搜索、新增、编辑、删除、批量操作、导出等完整功能
- **实时验证**：表单字段实时验证，支持自定义验证规则
- **状态管理**：支持端点启用/禁用状态切换
- **测试功能**：支持端点配置测试（开发中）

### 🎨 用户体验

- **简洁界面**：上下布局，搜索区域+表格区域
- **最小化渲染**：组件细粒度拆分，React.memo优化性能
- **响应式设计**：基于Tailwind CSS的响应式布局
- **友好提示**：完整的成功/错误提示信息

## 技术架构

### 技术栈

- **前端框架**：React 19
- **UI组件库**：Ant Design 5.x
- **样式方案**：Tailwind CSS
- **状态管理**：React Hooks (useReducer, useState)
- **数据请求**：@tanstack/react-query
- **类型检查**：TypeScript

### 架构设计

```
端点维护模块
├── 数据层
│   ├── API服务 (endpointApi.ts)
│   └── Schema配置 (endpointConfigSchema.mock.ts)
├── 组件层
│   ├── 搜索表单 (EndpointSearchForm.tsx)
│   ├── 表格操作 (EndpointTableActions.tsx)
│   ├── 数据表格 (EndpointTable.tsx)
│   ├── 配置弹窗 (EndpointModal.tsx)
│   └── 动态表单 (DynamicForm/index.tsx)
└── 页面层
    └── 主页面 (index.tsx)
```

## 数据库设计

### 主表结构

#### tb_endpoint - 端点主表

```sql
CREATE TABLE tb_endpoint (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(100) NOT NULL,
    description TEXT,
    endpoint_type VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    status BOOLEAN DEFAULT TRUE NOT NULL,
    tags JSONB,
    remark TEXT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    create_by BIGINT,
    update_by BIGINT
);
```

### 配置表

- **tb_endpoint_http** - HTTP端点配置
- **tb_endpoint_database** - 数据库端点配置
- **tb_endpoint_webservice** - WebService端点配置
- **tb_endpoint_file** - 文件端点配置
- **tb_endpoint_timer** - 定时器端点配置
- **tb_endpoint_mq** - MQ端点配置
- **tb_endpoint_config_schema** - 端点配置Schema表

详细建表语句请查看：`/database/endpoint_tables.sql`

## 使用说明

### 1. 新增端点

1. 点击「新增端点」按钮
2. 填写基础信息（名称、编码、类型、分类等）
3. 选择端点类型后，系统自动加载对应的配置Schema
4. 填写配置信息（根据不同类型显示不同字段）
5. 可选填写标签和备注
6. 点击确定保存

### 2. 编辑端点

1. 在表格中点击「编辑」按钮
2. 修改相关信息（端点类型不可修改）
3. 点击确定保存

### 3. 查看端点

1. 在表格中点击「查看」按钮
2. 查看端点完整配置信息（只读模式）

### 4. 删除端点

- **单个删除**：点击表格中的「删除」按钮
- **批量删除**：选择多个端点后，点击「批量删除」按钮

### 5. 导出配置

- **单个导出**：点击表格中的「导出」按钮
- **批量导出**：选择多个端点后，点击「批量导出」按钮

### 6. 测试端点

点击表格中的「测试」按钮，测试端点连接（功能开发中）

## 组件说明

### EndpointSearchForm - 搜索表单

**功能**：提供端点搜索功能

**Props**：
- `onSearch`: 搜索回调函数
- `loading`: 加载状态

**搜索条件**：
- 端点名称（模糊搜索）
- 端点编码（模糊搜索）
- 端点类型
- 端点分类
- 状态

### EndpointTableActions - 表格操作按钮

**功能**：提供批量操作按钮

**Props**：
- `onAdd`: 新增回调
- `onBatchDelete`: 批量删除回调
- `onBatchExport`: 批量导出回调
- `onRefresh`: 刷新回调
- `selectedRowKeys`: 选中的行
- `loading`: 加载状态

### EndpointTable - 数据表格

**功能**：展示端点列表数据

**Props**：
- `data`: 数据源
- `loading`: 加载状态
- `selectedRowKeys`: 选中的行
- `onSelectionChange`: 选择变更回调
- `onView`: 查看回调
- `onEdit`: 编辑回调
- `onDelete`: 删除回调
- `onExport`: 导出回调
- `onTest`: 测试回调
- `onStatusChange`: 状态变更回调
- `pagination`: 分页配置

### EndpointModal - 配置弹窗

**功能**：新增/编辑/查看端点

**Props**：
- `open`: 是否显示
- `title`: 标题
- `loading`: 加载状态
- `initialValues`: 初始值
- `isViewMode`: 是否查看模式
- `onOk`: 确认回调
- `onCancel`: 取消回调

**特性**：
- 三个Tab页：基础信息、配置信息、其他信息
- 根据端点类型动态加载配置Schema
- 自动表单验证

### DynamicForm - 动态表单

**功能**：根据Schema配置动态渲染表单字段

**Props**：
- `schema`: 表单Schema配置
- `form`: 表单实例

**支持的组件类型**：
- Input - 输入框
- InputPassword - 密码输入框
- InputNumber - 数字输入框
- TextArea - 文本域
- Select - 下拉选择
- Radio - 单选按钮组
- Switch - 开关
- DatePicker - 日期选择器

## API接口

### 端点列表查询

```typescript
POST /integrated/endpoint/list
```

### 新增端点

```typescript
POST /integrated/endpoint/add
```

### 更新端点

```typescript
POST /integrated/endpoint/update
```

### 删除端点

```typescript
POST /integrated/endpoint/delete
```

### 批量删除端点

```typescript
POST /integrated/endpoint/batchDelete
```

### 获取端点详情

```typescript
GET /integrated/endpoint/detail/{id}
```

### 测试端点

```typescript
POST /integrated/endpoint/test
```

### 验证配置

```typescript
POST /integrated/endpoint/validateConfig
```

### 导出配置

```typescript
POST /integrated/endpoint/exportConfig/{id}
```

### 导入配置

```typescript
POST /integrated/endpoint/importConfig
```

### 获取配置Schema

```typescript
GET /integrated/endpoint/getConfigSchema?endpointType={type}
```

## 扩展指南

### 添加新的端点类型

1. **数据库层**：创建对应的配置表
   ```sql
   CREATE TABLE tb_endpoint_newtype (
       id BIGSERIAL PRIMARY KEY,
       endpoint_id BIGINT NOT NULL,
       -- 添加配置字段
       ...
   );
   ```

2. **API层**：在 `endpointApi.ts` 中添加类型定义
   ```typescript
   export interface NewTypeEndpointConfig {
       // 配置字段定义
   }
   ```

3. **Schema层**：在 `endpointConfigSchema.mock.ts` 中添加Schema配置
   ```typescript
   export const newtypeEndpointSchema: FormSchemaField[] = [
       // Schema配置
   ];
   ```

4. **更新映射**：在 `endpointSchemaMap` 中添加映射关系
   ```typescript
   export const endpointSchemaMap = {
       // ...
       newtype: newtypeEndpointSchema,
   };
   ```

### 添加自定义组件

1. 创建自定义组件
2. 在 `DynamicForm/index.tsx` 的 `componentMap` 中注册
3. 在Schema配置中使用

## 注意事项

1. **端点编码唯一性**：端点编码必须唯一，且只能包含字母、数字和下划线
2. **端点类型不可变**：端点创建后类型不可修改
3. **配置验证**：不同端点类型有不同的必填字段要求
4. **密码安全**：数据库密码等敏感信息需要加密存储
5. **模拟数据**：当前使用模拟的Schema配置，后续需要对接真实的后端接口

## 未来规划

- [ ] 完善端点测试功能
- [ ] 支持端点配置版本管理
- [ ] 支持端点配置克隆
- [ ] 增加端点使用统计
- [ ] 支持更多端点类型
- [ ] 配置可视化编辑器
- [ ] 端点调用链路追踪

