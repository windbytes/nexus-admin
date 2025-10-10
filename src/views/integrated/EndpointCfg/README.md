# 端点配置维护模块

## 📋 概述

端点配置维护模块用于管理各种端点类型的Schema配置，这些Schema配置定义了在端点维护模块中每种端点类型的表单字段。

## 🎯 功能特性

### 核心功能

- **端点类型管理**：新增、编辑、删除端点类型配置
- **Schema字段配置**：可视化编辑每个端点类型的表单字段定义
- **实时编辑**：可编辑表格，支持字段的增删改、排序
- **配置导入导出**：支持Schema配置的导入和导出
- **实时搜索**：快速搜索端点类型

### 用户体验

- **左右布局**：左侧列表，右侧详情，清晰明了
- **编辑模式切换**：查看/编辑模式无缝切换
- **智能提示**：切换时未保存提醒，防止数据丢失
- **字段排序**：支持上移/下移调整字段顺序

## 🏗️ 技术架构

### 技术栈

- **前端框架**：React 19
- **UI组件库**：Ant Design 5.x
- **样式方案**：Tailwind CSS
- **状态管理**：React Hooks (useState, useCallback)
- **数据请求**：@tanstack/react-query
- **类型检查**：TypeScript

### 组件结构

```
EndpointCfg (主页面)
├── EndpointTypeList (左侧：端点类型列表)
├── EndpointTypeForm (右上：基本信息表单)
└── SchemaFieldsTable (右下：Schema字段编辑表格)
```

## 📁 文件结构

```
src/views/integrated/EndpointCfg/
├── index.tsx                           # 主页面
├── components/
│   ├── EndpointTypeList.tsx           # 端点类型列表组件
│   ├── EndpointTypeForm.tsx           # 端点类型基本信息表单
│   └── SchemaFieldsTable.tsx          # Schema字段编辑表格
└── README.md                          # 本文档

src/services/integrated/endpointConfig/
└── endpointConfigApi.ts               # API服务和类型定义
```

## 🎨 页面布局

```
┌─────────────────────────────────────────────────────────┐
│                    端点配置维护                           │
├──────────┬──────────────────────────────────────────────┤
│          │  基础信息                                      │
│  端点    │  ┌────────────────────────────────────┐      │
│  类型    │  │ 类型名称、编码、图标、版本等        │      │
│  列表    │  └────────────────────────────────────┘      │
│          │                                               │
│  [搜索]  │  Schema字段配置                               │
│  [新增]  │  ┌────────────────────────────────────┐      │
│          │  │ 可编辑表格：字段配置列表            │      │
│  • HTTP  │  │ - 字段名、标签、组件类型            │      │
│  • DB    │  │ - 必填、默认值、说明                │      │
│  • WS    │  │ - 上移/下移/编辑/删除               │      │
│  • File  │  └────────────────────────────────────┘      │
│  • Timer │                                               │
│  • MQ    │  [编辑] [导出] [导入] [删除]                  │
│          │  或 [取消] [保存]                             │
└──────────┴──────────────────────────────────────────────┘
```

## 📝 使用指南

### 1. 新增端点类型

1. 点击左侧的「新增端点类型」按钮
2. 填写基本信息：
   - 类型名称：如「HTTP端点」
   - 类型编码：如「http」（只能字母开头，字母数字下划线）
   - 端点类型：标识符
   - 图标：图标类名
   - Schema版本：版本号
   - 描述：详细描述
3. 添加Schema字段：
   - 点击「添加字段」按钮
   - 填写字段信息（字段名、标签、组件类型等）
   - 可以继续添加多个字段
4. 点击「保存」按钮

### 2. 编辑端点类型

1. 在左侧列表中选择要编辑的端点类型
2. 系统自动加载详细信息到右侧
3. 点击「编辑」按钮进入编辑模式
4. 修改基本信息或Schema字段
5. 点击「保存」保存修改，或点击「取消」放弃修改

### 3. Schema字段编辑

在编辑模式下，可以对Schema字段进行以下操作：

- **添加字段**：点击「添加字段」按钮
- **编辑字段**：点击行操作中的「编辑」按钮，修改后点击「保存」
- **删除字段**：点击行操作中的「删除」按钮
- **调整顺序**：使用「上移」「下移」按钮调整字段显示顺序

### 4. 导出配置

1. 选择要导出的端点类型
2. 点击「导出」按钮
3. 系统将下载JSON格式的Schema配置文件

### 5. 删除端点类型

1. 选择要删除的端点类型
2. 点击「删除」按钮
3. 确认删除操作

## 🔧 Schema字段说明

每个Schema字段包含以下配置：

| 字段 | 说明 | 必填 |
|------|------|------|
| 字段名 | 表单字段的name属性，如：url | ✅ |
| 字段标签 | 显示的标签文本，如：URL地址 | ✅ |
| 组件类型 | 使用的表单组件，如：Input、Select | ✅ |
| 必填 | 是否必填字段 | ❌ |
| 默认值 | 字段的默认值 | ❌ |
| 说明 | 字段的说明信息 | ❌ |

### 支持的组件类型

- **Input**：输入框
- **InputPassword**：密码输入框
- **InputNumber**：数字输入框
- **TextArea**：文本域
- **Select**：下拉选择
- **Radio**：单选框
- **Switch**：开关
- **DatePicker**：日期选择器

## 📊 数据模型

### EndpointTypeConfig - 端点类型配置

```typescript
interface EndpointTypeConfig {
  id: string;                    // 配置ID
  endpointType: string;          // 端点类型标识
  typeName: string;              // 类型名称
  typeCode: string;              // 类型编码
  icon?: string;                 // 图标
  description?: string;          // 描述
  schemaVersion: string;         // Schema版本
  schemaFields: SchemaField[];   // Schema字段列表
  status: boolean;               // 状态
  createTime?: string;           // 创建时间
  updateTime?: string;           // 更新时间
}
```

### SchemaField - Schema字段

```typescript
interface SchemaField {
  id?: string;                   // 唯一标识
  field: string;                 // 字段名
  label: string;                 // 字段标签
  component: string;             // 组件类型
  required?: boolean;            // 是否必填
  defaultValue?: any;            // 默认值
  componentProps?: string;       // 组件属性(JSON)
  rules?: string;                // 验证规则(JSON)
  showCondition?: string;        // 显示条件(JS表达式)
  sortOrder?: number;            // 排序号
  description?: string;          // 说明
}
```

## 🔌 API接口

### 查询端点类型列表

```typescript
POST /integrated/endpointConfig/list
```

### 获取端点类型详情

```typescript
GET /integrated/endpointConfig/detail/{id}
```

### 新增端点类型

```typescript
POST /integrated/endpointConfig/add
```

### 更新端点类型

```typescript
POST /integrated/endpointConfig/update
```

### 删除端点类型

```typescript
POST /integrated/endpointConfig/delete
```

### 导出Schema配置

```typescript
POST /integrated/endpointConfig/exportSchema/{id}
```

### 导入Schema配置

```typescript
POST /integrated/endpointConfig/importSchema
```

## 🎯 组件说明

### EndpointTypeList - 端点类型列表

**位置**：左侧

**功能**：
- 显示所有端点类型
- 支持搜索过滤
- 支持选择端点类型
- 显示字段数量和状态

**Props**：
- `data`: 端点类型列表数据
- `loading`: 加载状态
- `selectedId`: 当前选中的ID
- `onSelect`: 选择回调
- `onAdd`: 新增回调
- `onSearch`: 搜索回调

### EndpointTypeForm - 端点类型基本信息表单

**位置**：右侧上部

**功能**：
- 显示/编辑端点类型基本信息
- 表单验证
- 支持禁用状态

**Props**：
- `form`: 表单实例
- `initialValues`: 初始值
- `disabled`: 是否禁用

### SchemaFieldsTable - Schema字段编辑表格

**位置**：右侧下部

**功能**：
- 显示Schema字段列表
- 可编辑表格（增删改）
- 支持字段排序（上移/下移）
- 行内编辑

**Props**：
- `fields`: 字段列表
- `disabled`: 是否禁用
- `onChange`: 数据变更回调

## 💡 最佳实践

1. **字段命名规范**：
   - 字段名使用小驼峰命名，如：`userName`
   - 字段标签使用中文，清晰描述，如：「用户名」

2. **组件选择**：
   - 短文本使用 Input
   - 长文本使用 TextArea
   - 选项使用 Select 或 Radio
   - 开关使用 Switch
   - 数字使用 InputNumber

3. **字段顺序**：
   - 重要字段放在前面
   - 相关字段放在一起
   - 使用上移/下移调整顺序

4. **版本管理**：
   - Schema有变更时更新版本号
   - 重大变更增加主版本号
   - 小变更增加次版本号

## ⚠️ 注意事项

1. **类型编码唯一性**：类型编码必须唯一，且创建后不可修改
2. **字段名规范**：字段名必须以字母开头，只能包含字母、数字和下划线
3. **编辑模式提醒**：切换端点类型时，如果正在编辑，系统会提示保存
4. **至少一个字段**：每个端点类型至少需要配置一个Schema字段
5. **配置验证**：保存前系统会验证配置的完整性

## 🔗 相关模块

- [端点维护模块](../Endpoint/README.md) - 使用这里配置的Schema
- [动态表单组件](../../../components/DynamicForm/README.md) - Schema驱动的表单渲染

## 📚 参考资料

- [Ant Design Form](https://ant.design/components/form-cn/)
- [Ant Design Table](https://ant.design/components/table-cn/)
- [TanStack Query](https://tanstack.com/query/latest)

