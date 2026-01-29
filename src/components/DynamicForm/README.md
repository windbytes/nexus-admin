# 动态表单组件 (DynamicForm)

## 概述

`DynamicForm` 是一个基于配置驱动的动态表单渲染组件，可以根据 JSON Schema 配置自动生成表单字段，无需为每种表单单独编写组件代码。

## 特性

- ✅ **配置驱动**：通过 JSON Schema 配置自动渲染表单
- ✅ **类型安全**：完整的 TypeScript 类型支持
- ✅ **动态显示**：支持字段动态显示/隐藏
- ✅ **动态验证**：支持字段动态必填验证
- ✅ **自动验证**：集成 Ant Design Form 验证机制
- ✅ **性能优化**：使用 React.memo 避免不必要的重渲染

## 使用方式

### 基础用法

```tsx
import { Form } from 'antd';
import DynamicForm from '@/components/DynamicForm';
import type { FormSchemaField } from '@/services/integrated/endpoint/endpointApi';

const MyComponent = () => {
  const [form] = Form.useForm();

  const schema: FormSchemaField[] = [
    {
      field: 'name',
      label: '姓名',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '请输入姓名',
      },
    },
    {
      field: 'age',
      label: '年龄',
      component: 'InputNumber',
      componentProps: {
        min: 0,
        max: 150,
      },
    },
  ];

  return (
    <Form form={form}>
      <DynamicForm schema={schema} form={form} />
    </Form>
  );
};
```

### 动态显示/隐藏

```tsx
const schema: FormSchemaField[] = [
  {
    field: 'hasChildren',
    label: '是否有子女',
    component: 'Switch',
  },
  {
    field: 'childrenCount',
    label: '子女数量',
    component: 'InputNumber',
    // 只有当 hasChildren 为 true 时才显示
    show: (values) => values.hasChildren === true,
  },
];
```

### 动态必填验证

```tsx
const schema: FormSchemaField[] = [
  {
    field: 'type',
    label: '类型',
    component: 'Select',
    componentProps: {
      options: [
        { label: '个人', value: 'person' },
        { label: '企业', value: 'company' },
      ],
    },
  },
  {
    field: 'companyName',
    label: '企业名称',
    component: 'Input',
    // 当类型为企业时必填
    required: (values) => values.type === 'company',
  },
];
```

### 动态属性

```tsx
const schema: FormSchemaField[] = [
  {
    field: 'databaseType',
    label: '数据库类型',
    component: 'Select',
    componentProps: {
      options: [
        { label: 'MySQL', value: 'mysql' },
        { label: 'PostgreSQL', value: 'postgresql' },
      ],
    },
  },
  {
    field: 'port',
    label: '端口',
    component: 'InputNumber',
    // 根据数据库类型动态设置默认值
    defaultValue: (values) => {
      return values.databaseType === 'mysql' ? 3306 : 5432;
    },
  },
];
```

## Schema 配置说明

### FormSchemaField 类型定义

```typescript
interface FormSchemaField {
  /** 字段名 */
  field: string;
  
  /** 字段标签 */
  label: string;
  
  /** 组件类型 */
  component: string;
  
  /** 是否必填（支持函数动态判断） */
  required?: boolean | ((values: any) => boolean);
  
  /** 默认值（支持函数动态计算） */
  defaultValue?: any | ((values: any) => any);
  
  /** 组件属性 */
  componentProps?: any;
  
  /** 验证规则 */
  rules?: any[];
  
  /** 是否显示（函数返回 true 显示，false 隐藏） */
  show?: (values: any) => boolean;
  
  /** Form.Item 属性 */
  formItemProps?: any;
}
```

### 支持的组件类型

| 组件类型 | 对应的 Ant Design 组件 | 说明 |
|---------|----------------------|------|
| Input | Input | 输入框 |
| InputPassword | Input.Password | 密码输入框 |
| InputNumber | InputNumber | 数字输入框 |
| TextArea | Input.TextArea | 文本域 |
| Select | Select | 下拉选择 |
| Radio | Radio.Group | 单选按钮组 |
| Switch | Switch | 开关 |
| DatePicker | DatePicker | 日期选择器 |

### 扩展自定义组件

在 `DynamicForm/index.tsx` 中添加组件映射：

```tsx
const componentMap: Record<string, React.ComponentType<any>> = useMemo(
  () => ({
    Input,
    InputPassword: Password,
    InputNumber,
    TextArea,
    Select,
    Radio: Radio.Group,
    Switch,
    DatePicker,
    // 添加自定义组件
    MyCustomComponent: MyCustomComponent,
  }),
  []
);
```

## 完整示例

```tsx
import React from 'react';
import { Form, Button } from 'antd';
import DynamicForm from '@/components/DynamicForm';
import type { FormSchemaField } from '@/services/integrated/endpoint/endpointApi';

const UserForm: React.FC = () => {
  const [form] = Form.useForm();

  const schema: FormSchemaField[] = [
    {
      field: 'username',
      label: '用户名',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '请输入用户名',
      },
      rules: [
        { required: true, message: '请输入用户名' },
        { min: 3, max: 20, message: '用户名长度为3-20个字符' },
      ],
    },
    {
      field: 'userType',
      label: '用户类型',
      component: 'Select',
      required: true,
      componentProps: {
        options: [
          { label: '管理员', value: 'admin' },
          { label: '普通用户', value: 'user' },
        ],
      },
    },
    {
      field: 'adminLevel',
      label: '管理员级别',
      component: 'Select',
      show: (values) => values.userType === 'admin',
      required: (values) => values.userType === 'admin',
      componentProps: {
        options: [
          { label: '超级管理员', value: 1 },
          { label: '普通管理员', value: 2 },
        ],
      },
    },
    {
      field: 'email',
      label: '邮箱',
      component: 'Input',
      componentProps: {
        placeholder: '请输入邮箱',
      },
      rules: [
        { type: 'email', message: '请输入有效的邮箱地址' },
      ],
    },
    {
      field: 'status',
      label: '状态',
      component: 'Switch',
      defaultValue: true,
    },
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('表单值:', values);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  return (
    <Form form={form} layout="vertical">
      <DynamicForm schema={schema} form={form} />
      <Form.Item>
        <Button type="primary" onClick={handleSubmit}>
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UserForm;
```

## Props

| 属性 | 说明 | 类型 | 必填 |
|-----|------|------|------|
| schema | 表单配置 Schema | FormSchemaField[] | 是 |
| form | Ant Design Form 实例 | FormInstance | 是 |

## 注意事项

1. **表单实例**：必须传入 Ant Design 的 Form 实例，用于字段值监听和验证
2. **字段唯一性**：每个字段的 `field` 必须唯一
3. **组件注册**：使用自定义组件前需要在 `componentMap` 中注册
4. **性能优化**：组件使用 `React.memo` 优化，但大量字段时仍需注意性能
5. **类型安全**：建议使用 TypeScript 定义 Schema 配置，确保类型安全

## 最佳实践

1. **拆分 Schema**：将复杂的 Schema 配置拆分到单独的文件中
2. **复用 Schema**：相同的字段配置可以抽取为常量复用
3. **验证规则**：充分利用 Ant Design Form 的验证规则
4. **动态字段**：合理使用 `show` 和 `required` 函数实现动态表单
5. **性能优化**：避免在 Schema 中使用复杂的计算逻辑

## 相关链接

- [Ant Design Form 文档](https://ant.design/components/form-cn/)
- [端点维护模块示例](../views/integrated/Endpoint/README.md)

