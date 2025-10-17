# 端点配置API优化说明

## 新增合并查询接口

为了减少网络请求次数和提升页面加载性能，新增了一个合并查询接口，一次性获取列表和所有详情数据。

### 接口路径
```
POST /integrated/endpointConfig/listWithDetails
```

### 请求参数
```typescript
interface EndpointTypeSearchParams {
  pageNum: number;
  pageSize: number;
  typeName?: string;    // 可选的搜索关键词
  typeCode?: string;    // 可选的编码搜索
  status?: boolean;     // 可选的状态筛选
}
```

### 响应数据结构
```typescript
interface PageResult<EndpointTypeConfig> {
  records: EndpointTypeConfig[];  // 完整的配置数据（包含详情和字段）
  total: number;                  // 总记录数
  pageNum: number;                // 当前页码
  pageSize: number;               // 每页大小
}
```

### 后端实现建议

1. **直接查询完整数据**：一次性查询包含所有字段的完整 `EndpointTypeConfig` 数据
2. **分页处理**：按照分页参数返回对应的记录
3. **简化响应**：直接返回 `PageResult<EndpointTypeConfig>` 格式

### 性能优势

- **减少网络请求**：从 N+1 次请求（1次列表 + N次详情）减少到 1 次请求
- **简化数据结构**：直接返回完整的 `EndpointTypeConfig`，包含所有字段和详情
- **去除中间类型**：不再需要 `EndpointTypeListItem`，统一使用 `EndpointTypeConfig`
- **提升用户体验**：页面加载更快，切换记录无延迟
- **减少服务器压力**：减少数据库连接和查询次数
- **缓存友好**：客户端可以缓存所有数据，避免重复请求
- **类型安全**：统一的数据类型，减少类型转换错误
- **代码简洁**：减少数据转换逻辑，提高代码可维护性

### 兼容性说明

原有的分离查询接口仍然保留，确保向后兼容：
- `GET /integrated/endpointConfig/list` - 查询列表
- `GET /integrated/endpointConfig/detail/{id}` - 查询详情

新接口作为性能优化方案，建议逐步迁移使用。
