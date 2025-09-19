# TableSelect 表格选择器组件

一个基于 Antd + React 19 + Tailwind CSS 的通用下拉表格选择器组件，支持搜索过滤、键盘导航、自定义样式等功能。

## 功能特性

- ✅ 下拉表格展示数据
- ✅ 输入框直接作为搜索和显示
- ✅ 键盘导航（上下移动、回车选择、ESC关闭）
- ✅ 可自定义下拉层大小和样式
- ✅ 组件内部数据加载
- ✅ 主题适配（支持暗色模式）
- ✅ 响应式设计
- ✅ TypeScript 支持

## 安装和使用

### 直接使用组件

```tsx
import { TableSelect } from '@/components/select/TableSelect';

function UserSelector() {
  const [selectedUser, setSelectedUser] = useState(null);

  // 数据获取函数
  const fetchUserData = async (id) => {
    const response = await fetch(`/api/users/${id}`);
    const data = await response.json();
    
    return {
      columns: [
        {
          title: '用户名',
          dataIndex: 'username',
          searchable: true,
          displayable: true,
        },
        {
          title: '邮箱',
          dataIndex: 'email',
          searchable: true,
        },
        {
          title: '角色',
          dataIndex: 'role',
        },
      ],
      data: data.users,
    };
  };

  return (
    <TableSelect
      id="user-selector"
      placeholder="请选择用户"
      value={selectedUser}
      onChange={setSelectedUser}
      displayField="username"
      keyField="id"
      dataSource={fetchUserData}
      dropdownWidth={500}
      dropdownHeight={400}
      onSelect={(user, selectedRows, info) => {
        console.log('选中的用户:', user);
        console.log('选择方式:', info.type); // 'click' 或 'keyboard'
      }}
    />
  );
}
```

## API 文档

### TableSelectProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | string | - | 组件唯一ID |
| placeholder | string | - | 输入框占位符 |
| disabled | boolean | false | 是否禁用 |
| allowClear | boolean | true | 是否允许清空 |
| styles | StyleConfig | - | 样式配置对象 |
| classNames | ClassNameConfig | - | 类名配置对象 |
| dropdownWidth | number \| string | 400 | 下拉层宽度 |
| dropdownHeight | number \| string | 300 | 下拉层高度 |
| showHeader | boolean | true | 是否显示表格头部 |
| pagination | false \| PaginationProps | false | 表格分页配置 |
| displayField | string | - | 显示字段（用于在输入框中显示选中项的值） |
| keyField | string | - | 唯一标识字段 |
| dataSource | (id: string) => Promise<{ columns: TableColumnConfig<T>[]; data: T[] }> | - | 数据获取函数 |
| value | T | - | 选中值 |
| onChange | (value: T \| undefined) => void | - | 值变化回调 |
| onSelect | (record: T, selectedRows: T[], info: { type: 'click' \| 'keyboard' }) => void | - | 选中行变化回调 |
| onSearch | (value: string) => void | - | 搜索变化回调 |
| renderDisplayValue | (record: T) => React.ReactNode | - | 自定义渲染选中项显示内容 |
| customFilter | (record: T, searchValue: string) => boolean | - | 自定义过滤器 |

### StyleConfig

| 属性 | 类型 | 说明 |
|------|------|------|
| input | CSSProperties | 输入框样式 |
| dropdown | CSSProperties | 下拉层样式 |
| table | CSSProperties | 表格样式 |

### ClassNameConfig

| 属性 | 类型 | 说明 |
|------|------|------|
| input | string | 输入框类名 |
| dropdown | string | 下拉层类名 |
| table | string | 表格类名 |

### TableColumnConfig

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 列标题 |
| dataIndex | string | - | 数据字段名 |
| searchable | boolean | true | 是否用于搜索匹配 |
| displayable | boolean | false | 是否用于显示在输入框中 |
| width | number | 120 | 列宽度 |
| ... | - | - | 继承 Antd Table Column 的其他属性 |

## 键盘快捷键

- `↓` / `↑`: 上下移动选中行
- `Enter`: 选择当前行
- `Esc`: 关闭下拉层
- `Enter` (当输入框未聚焦时): 打开下拉层

## 样式定制

组件使用 CSS Modules 和 Antd 设计令牌，支持主题切换：

```scss
// 自定义样式
.custom-table-select {
  :global(.ant-table-tbody > tr:hover) {
    background-color: #f0f9ff !important;
  }
}
```

## 高级用法

### 自定义过滤器

```tsx
<TableSelect
  id="user-selector"
  customFilter={(user, searchValue) => {
    // 自定义搜索逻辑
    return user.username.includes(searchValue) || 
           user.email.includes(searchValue) ||
           user.role.includes(searchValue);
  }}
/>
```

### 自定义显示内容

```tsx
<TableSelect
  id="user-selector"
  renderDisplayValue={(user) => (
    <span>
      {user.username} ({user.email})
    </span>
  )}
/>
```

### 分页表格

```tsx
<TableSelect
  id="user-selector"
  pagination={{ pageSize: 10 }}
  dropdownHeight={500}
/>
```

## 样式定制

组件使用 CSS Modules 和 Antd 设计令牌，支持主题切换：

```tsx
<TableSelect
  styles={{
    input: { width: 300 },
    dropdown: { backgroundColor: '#f5f5f5' },
    table: { fontSize: '14px' }
  }}
  classNames={{
    input: 'custom-input',
    dropdown: 'custom-dropdown',
    table: 'custom-table'
  }}
/>
```

## 注意事项

1. `dataSource` 函数应该返回包含 `columns` 和 `data` 的对象
2. `displayField` 和 `keyField` 必须与数据结构中的字段匹配
3. 组件会自动处理键盘导航和焦点管理
4. 支持响应式设计，在移动端会自动调整下拉层宽度
5. 输入框直接作为搜索和显示，无需额外的搜索框

## 示例项目

查看 `examples/` 目录下的示例代码，了解更多的使用场景。
