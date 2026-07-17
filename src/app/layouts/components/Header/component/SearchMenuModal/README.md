# 搜索菜单组件 (SearchMenuModal)

## 功能特性

### 🔍 智能搜索
- **模糊搜索**: 支持不完整关键词的模糊匹配
- **多字段搜索**: 同时搜索菜单名称和路径
- **智能排序**: 根据匹配度自动排序搜索结果
- **实时搜索**: 输入时实时显示搜索结果

### 🎯 命中高亮
- **关键词高亮**: 搜索结果中的匹配关键词会以黄色背景高亮显示
- **多字段高亮**: 菜单名称和路径中的匹配部分都会被高亮
- **视觉反馈**: 清晰的高亮效果帮助用户快速定位

### ⌨️ 快捷键操作
- **Ctrl+K / Cmd+K**: 打开搜索菜单
- **↑/↓ 箭头键**: 在搜索结果中导航
- **Enter**: 选择当前项并跳转
- **Esc**: 关闭搜索菜单
- **Backspace**: 清空搜索输入

### 🚀 快速跳转
- **一键跳转**: 选中菜单项后按Enter或点击直接跳转
- **路径显示**: 显示菜单的完整路径信息
- **图标支持**: 显示菜单对应的图标

### 📚 搜索历史
- **自动记录**: 自动记录用户访问过的菜单
- **历史管理**: 支持删除单个历史记录或清空所有历史
- **时间显示**: 显示历史记录的时间信息
- **持久化存储**: 使用localStorage持久化存储历史记录

## 使用方法

### 基本使用
```tsx
import SearchMenuModal from '@/app/layouts/components/Header/component/SearchMenuModal';

// 在组件中使用
<SearchMenuModal />
```

### 快捷键绑定
组件会自动绑定以下快捷键：
- **Windows/Linux**: `Ctrl + K`
- **macOS**: `Cmd + K`

### 搜索功能
1. 点击搜索框或使用快捷键打开搜索菜单
2. 输入关键词进行搜索
3. 使用箭头键导航搜索结果
4. 按Enter或点击选择菜单项跳转

## 技术实现

### 搜索算法
- **精确匹配**: 完全匹配关键词 (100分)
- **开头匹配**: 以关键词开头 (90分)
- **包含匹配**: 包含关键词 (70分)
- **模糊匹配**: 字符顺序匹配 (按匹配度计分)

### 数据结构
```typescript
interface SearchResultItem {
  id: string;
  name: string;
  path: string;
  icon?: string;
  parentPath?: string;
  keyword: string;
  score?: number;
}

interface SearchHistoryItem {
  id: string;
  name: string;
  path: string;
  timestamp: number;
}
```

### 样式定制
组件使用CSS Modules进行样式管理，主要样式类：
- `.searchMenuModal`: 主容器样式
- `.searchResults`: 搜索结果列表样式
- `.searchHistory`: 搜索历史列表样式
- `.highlightText`: 高亮文本样式
- `.selected`: 选中项样式

## 配置选项

### 搜索历史配置
- **最大历史记录数**: 默认10条
- **存储方式**: localStorage
- **过期时间**: 无限制

### 搜索配置
- **最小匹配分数**: 0分（显示所有结果）
- **排序方式**: 按匹配度降序排列
- **搜索范围**: 菜单名称和路径

## 注意事项

1. **菜单数据**: 组件依赖`useMenuStore`中的菜单数据
2. **路由跳转**: 使用`useNavigate`进行路由跳转
3. **图标支持**: 支持Ant Design图标和自定义图标
4. **国际化**: 支持多语言显示
5. **响应式**: 适配不同屏幕尺寸

## 更新日志

### v1.0.0
- ✅ 基础搜索功能
- ✅ 命中高亮
- ✅ 快捷键操作
- ✅ 搜索历史
- ✅ 智能排序
- ✅ 图标支持
