# 预览功能组件说明

## 组件列表

### 1. PreviewModal.tsx
**主预览弹窗组件**

负责整体布局、交互和状态管理，是预览功能的入口。

**主要功能**：
- 展示端点配置的基本信息
- 支持表单视图和 JSON 视图切换
- 处理表单验证和数据展示
- 多模式 Tab 切换（IN、OUT、IN_OUT、OUT_IN）

**使用示例**：
```tsx
<PreviewModal
  visible={previewVisible}
  config={endpointConfig}
  onClose={() => setPreviewVisible(false)}
/>
```

---

### 2. PreviewFormRenderer.tsx
**动态表单渲染组件**

根据字段配置动态生成完整的表单，支持模式过滤和排序。

**主要功能**：
- 根据模式过滤字段
- 按排序号排序字段
- 响应式布局（2列/1列自适应）
- 监听表单值变化

**特点**：
- 使用 `memo` 优化性能
- 自动处理空状态
- TextArea 和 JSON 编辑器占满一行

---

### 3. PreviewFormField.tsx
**单个字段渲染组件**

最小粒度的组件，负责渲染单个表单字段。

**主要功能**：
- 根据 component 类型选择渲染的表单控件
- 应用字段属性（properties）
- 解析验证规则（rules）
- 支持条件显示（showCondition）

**支持的组件类型**：
- Input、InputPassword、InputNumber
- TextArea、JSON 编辑器
- Select、Radio、Checkbox
- Switch、DatePicker

---

## 数据流

```
index.tsx (主页面)
    ↓
    点击「预览」按钮
    ↓
    获取配置数据 (getPreviewConfig)
    ↓
PreviewModal (预览弹窗)
    ↓
    根据支持模式生成 Tab
    ↓
PreviewFormRenderer (表单渲染器)
    ↓
    过滤 + 排序字段
    ↓
PreviewFormField × N (字段渲染)
    ↓
    渲染最终表单
```

---

## 性能优化

1. **组件 Memo 化**
   - 所有组件都使用 `React.memo` 包裹
   - 避免不必要的重渲染

2. **计算缓存**
   - 使用 `useMemo` 缓存字段过滤和排序结果
   - 使用 `useCallback` 缓存回调函数

3. **按需渲染**
   - 条件显示字段不渲染 DOM
   - 空状态直接返回提示组件

---

## 样式设计

**使用技术栈**：
- Tailwind CSS - 实用类快速构建
- Ant Design - 组件库默认样式
- 内联样式 - 动画和特殊效果

**设计特点**：
- 渐变背景突出关键信息
- 卡片阴影增强层次感
- fadeIn 动画提升体验
- 响应式布局适配各种屏幕

---

## 代码风格

✅ **TypeScript 严格模式**
- 所有 props 都有明确的类型定义
- 使用 interface 定义复杂类型

✅ **注释完善**
- 每个函数都有说明注释
- 关键逻辑有行内注释

✅ **职责单一**
- 每个组件只负责一件事
- 组件间解耦，便于维护

✅ **可读性优先**
- 变量命名语义化
- 代码结构清晰
- 适当的空行分隔

---

## 扩展指南

### 添加新的组件类型

在 `PreviewFormField.tsx` 的 `renderFormControl` 方法中添加新的 case：

```tsx
case 'YourComponent':
  return (
    <YourComponent
      placeholder={properties.placeholder}
      {...properties}
    />
  );
```

### 修改布局

在 `PreviewFormRenderer.tsx` 的 `getFieldColSpan` 方法中调整：

```tsx
const getFieldColSpan = (component: string) => {
  if (component === 'YourComponent') {
    return { xs: 24, sm: 24, md: 12 };
  }
  // ...
};
```

### 添加新的验证规则

在字段配置的 `rules` 中添加 JSON 格式的规则：

```json
{
  "rules": "[
    {\"required\": true, \"message\": \"必填\"},
    {\"pattern\": \"^[0-9]+$\", \"message\": \"只能输入数字\"}
  ]"
}
```

---

## 常见问题

### Q1: 条件显示不生效？
**A**: 检查 `showCondition` 表达式是否正确，确保使用 `formValues.fieldName` 访问表单值。

### Q2: 组件属性不生效？
**A**: 确保 `properties` 是有效的 JSON 对象，并且属性名与组件支持的 props 一致。

### Q3: 表单验证失败？
**A**: 检查 `rules` 字段是否是有效的 JSON 字符串格式。

### Q4: 预览数据不正确？
**A**: 确保在编辑模式下填写了完整的基础信息，并添加了至少一个字段。

---

## 维护建议

1. **定期更新**：随着 Ant Design 版本升级，同步更新组件 API
2. **性能监控**：使用 React DevTools 检查组件渲染次数
3. **用户反馈**：收集用户使用体验，持续优化
4. **测试覆盖**：为关键功能添加单元测试

---

**创建时间**: 2025-10-15  
**技术栈**: React 19 + Ant Design 5 + TypeScript + Tailwind CSS

