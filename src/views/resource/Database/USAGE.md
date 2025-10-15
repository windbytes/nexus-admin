# 数据库驱动维护模块 - 使用示例

## 快速开始

### 1. 基本使用

模块已经完全配置好，直接访问路由即可使用。

### 2. 代码示例

#### 新增驱动示例

```typescript
// 在主页面中点击"新增"按钮，填写表单
const driverData = {
  name: 'MySQL 8.0 驱动',
  databaseType: 'MySQL',
  driverClass: 'com.mysql.cj.jdbc.Driver',
  driverVersion: '8.0.33',
  status: true,
  remark: 'MySQL 8.0 官方 JDBC 驱动',
  // 文件通过上传组件自动处理
};
```

#### 编辑驱动示例

```typescript
// 点击表格中的"编辑"按钮，修改表单
const updateData = {
  id: 'driver-id-123',
  name: 'MySQL 8.0.33 驱动（更新版）',
  driverClass: 'com.mysql.cj.jdbc.Driver',
  driverVersion: '8.0.33',
  status: true,
};
```

#### 批量操作示例

```typescript
// 1. 选中多行数据
// 2. 点击"批量删除"或"批量下载"按钮
// 3. 系统会自动处理选中的所有驱动
```

## 常见数据库驱动配置

### MySQL

```
驱动名称：MySQL 8.0 JDBC Driver
数据库类型：MySQL
驱动类：com.mysql.cj.jdbc.Driver
驱动版本：8.0.33
文件名：mysql-connector-java-8.0.33.jar
```

### PostgreSQL

```
驱动名称：PostgreSQL JDBC Driver
数据库类型：PostgreSQL
驱动类：org.postgresql.Driver
驱动版本：42.6.0
文件名：postgresql-42.6.0.jar
```

### Oracle

```
驱动名称：Oracle JDBC Driver
数据库类型：Oracle
驱动类：oracle.jdbc.driver.OracleDriver
驱动版本：21.9.0.0
文件名：ojdbc11-21.9.0.0.jar
```

### SQL Server

```
驱动名称：SQL Server JDBC Driver
数据库类型：SQLServer
驱动类：com.microsoft.sqlserver.jdbc.SQLServerDriver
驱动版本：12.2.0
文件名：mssql-jdbc-12.2.0.jre11.jar
```

### 达梦数据库

```
驱动名称：达梦数据库 JDBC Driver
数据库类型：DM
驱动类：dm.jdbc.driver.DmDriver
驱动版本：8.1
文件名：DmJdbcDriver18.jar
```

### 人大金仓

```
驱动名称：人大金仓 JDBC Driver
数据库类型：KingBase
驱动类：com.kingbase8.Driver
驱动版本：8.6
文件名：kingbase8-8.6.0.jar
```

## 文件上传功能详解

### 分片上传机制

```typescript
// 自动分片配置
const chunkSize = 2 * 1024 * 1024; // 2MB per chunk
const maxSize = 500; // 最大文件 500MB

// 上传流程
1. 选择文件或拖拽文件
2. 计算文件 MD5 哈希（用于断点续传）
3. 将文件切分为多个 2MB 的分片
4. 逐个上传分片，显示进度
5. 上传完成后，服务器合并分片
6. 返回文件路径
```

### 断点续传机制

```typescript
// 断点续传流程
1. 上传前检查每个分片是否已上传
2. 跳过已上传的分片
3. 只上传未完成的分片
4. 从上次中断的地方继续上传
```

### 进度计算

```typescript
// 总进度 = (已上传分片数 + 当前分片进度) / 总分片数
const totalProgress = Math.round(
  ((uploadedChunks + currentChunkProgress / 100) / totalChunks) * 100
);
```

## 组件复用

### ChunkedUpload 组件

如果你需要在其他地方使用文件分片上传组件：

```tsx
import ChunkedUpload from '@/components/FileUpload/ChunkedUpload';

function MyComponent() {
  const handleUploadSuccess = (filePath: string, fileName: string) => {
    console.log('上传成功:', filePath, fileName);
  };

  const handleUploadError = (error: Error) => {
    console.error('上传失败:', error);
  };

  return (
    <ChunkedUpload
      onUploadSuccess={handleUploadSuccess}
      onUploadError={handleUploadError}
      accept=".jar"           // 文件类型
      maxSize={500}           // 最大文件大小（MB）
      chunkSize={2}           // 分片大小（MB）
    />
  );
}
```

### DriverTable 组件

如果你需要在其他地方使用驱动表格组件：

```tsx
import DriverTable from '@/views/resource/Database/components/DriverTable';

function MyComponent() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  return (
    <DriverTable
      data={driverList}
      loading={isLoading}
      selectedRowKeys={selectedRowKeys}
      onSelectionChange={(keys, rows) => {
        setSelectedRowKeys(keys);
      }}
      onEdit={(record) => console.log('编辑', record)}
      onDelete={(record) => console.log('删除', record)}
      onDownload={(record) => console.log('下载', record)}
      onStatusChange={(record, checked) => {
        console.log('状态变更', record, checked);
      }}
      pagination={{
        current: 1,
        pageSize: 20,
        total: 100,
      }}
    />
  );
}
```

## API 调用示例

### 直接使用 API 服务

```typescript
import { driverService } from '@/services/resource/driverApi';

// 获取驱动列表
const result = await driverService.getDriverList({
  name: 'MySQL',
  databaseType: 'MySQL',
  status: true,
  pageNum: 1,
  pageSize: 20,
});

// 新增驱动
const newDriver = await driverService.addDriver({
  name: 'MySQL Driver',
  driverClass: 'com.mysql.cj.jdbc.Driver',
  databaseType: 'MySQL',
  filePath: '/path/to/driver.jar',
  status: true,
});

// 下载驱动
await driverService.downloadDriver('driver-id', 'mysql-connector.jar');

// 批量下载
await driverService.batchDownloadDriver(['id1', 'id2', 'id3']);
```

## 性能优化建议

### 1. 组件优化

- 所有子组件都使用 `React.memo` 避免不必要的重渲染
- 使用 `useCallback` 缓存回调函数
- 使用 `useMemo` 缓存计算结果

### 2. 数据缓存

- React Query 自动缓存查询结果
- 相同的查询不会重复请求服务器
- 可配置缓存时间和刷新策略

### 3. 分页加载

- 支持自定义每页数量
- 大数据量时建议使用较小的页面大小
- 虚拟滚动可进一步提升性能（可扩展）

## 自定义配置

### 修改分片大小

```tsx
// 在 ChunkedUpload 组件中修改
<ChunkedUpload
  chunkSize={5}  // 改为 5MB 分片
  maxSize={1000} // 改为最大 1GB
/>
```

### 修改数据库类型选项

```tsx
// 在 DriverSearchForm.tsx 中修改
const DATABASE_TYPE_OPTIONS = [
  { value: 'MySQL', label: 'MySQL' },
  { value: 'PostgreSQL', label: 'PostgreSQL' },
  // 添加更多选项...
];
```

### 修改分页配置

```tsx
// 在 index.tsx 中修改
const PAGINATION_CONFIG = {
  showQuickJumper: true,
  showSizeChanger: true,
  hideOnSinglePage: false,
  pageSizeOptions: ['20', '50', '100', '200'], // 自定义选项
};
```

## 故障排查

### 文件上传失败

1. 检查文件大小是否超过限制
2. 检查文件格式是否为 .jar
3. 检查网络连接是否正常
4. 查看浏览器控制台错误信息

### 断点续传不生效

1. 确保文件哈希计算正确
2. 检查服务器是否支持分片检查接口
3. 清除浏览器缓存重试

### 表格数据不刷新

1. 检查 React Query 的缓存配置
2. 手动调用 refetch 方法
3. 检查查询 key 是否正确

## 扩展功能建议

### 1. 版本管理
- 支持同一驱动的多个版本
- 版本对比和切换功能

### 2. 驱动测试
- 在上传后自动测试驱动是否可用
- 显示驱动支持的 JDBC 版本

### 3. 驱动仓库
- 集成常用数据库驱动仓库
- 一键下载常用驱动

### 4. 权限控制
- 根据用户角色控制操作权限
- 使用 usePermission hook 进行权限判断

### 5. 操作日志
- 记录驱动的上传、修改、删除操作
- 支持查看操作历史

