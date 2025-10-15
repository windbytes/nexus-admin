# showCondition 使用示例

## 📋 概述

`showCondition` 支持两种形式来控制字段的显示/隐藏：

1. **JS 表达式**：简单直接，适合简单条件判断
2. **函数字符串**：灵活强大，适合复杂逻辑

## 🎯 方式一：JS 表达式

### 基本用法

最简单直接的方式，直接写判断表达式：

```json
{
  "field": "password",
  "label": "密码",
  "component": "InputPassword",
  "showCondition": "formValues.needAuth === true"
}
```

### 示例 1：单个条件判断

```json
{
  "showCondition": "formValues.authType === 'password'"
}
```

### 示例 2：多个条件（AND）

```json
{
  "showCondition": "formValues.needAuth === true && formValues.authType === 'password'"
}
```

### 示例 3：多个条件（OR）

```json
{
  "showCondition": "formValues.type === 'http' || formValues.type === 'https'"
}
```

### 示例 4：检查字段是否存在

```json
{
  "showCondition": "formValues.url !== undefined && formValues.url !== ''"
}
```

### 示例 5：数值比较

```json
{
  "showCondition": "formValues.port > 0 && formValues.port <= 65535"
}
```

### 示例 6：数组包含判断

```json
{
  "showCondition": "['http', 'https', 'ws'].includes(formValues.protocol)"
}
```

### 示例 7：正则匹配

```json
{
  "showCondition": "/^https/.test(formValues.url)"
}
```

---

## 🚀 方式二：函数字符串

### 基本用法

写一个完整的函数，可以包含复杂的逻辑：

```json
{
  "field": "advancedOptions",
  "label": "高级选项",
  "component": "JSON",
  "showCondition": "function(formValues) { return formValues.mode === 'advanced'; }"
}
```

### 示例 1：标准函数形式

```json
{
  "showCondition": "function(formValues) { return formValues.needAuth === true; }"
}
```

### 示例 2：箭头函数形式（推荐）

```json
{
  "showCondition": "(formValues) => formValues.needAuth === true"
}
```

### 示例 3：多行复杂逻辑

```json
{
  "showCondition": "(formValues) => { const needAuth = formValues.needAuth; const authType = formValues.authType; return needAuth && authType === 'password'; }"
}
```

### 示例 4：包含条件判断

```json
{
  "showCondition": "function(formValues) { if (formValues.type === 'http') { return formValues.port === 80; } else if (formValues.type === 'https') { return formValues.port === 443; } return false; }"
}
```

### 示例 5：数组处理

```json
{
  "showCondition": "(formValues) => { const types = formValues.supportedTypes || []; return types.length > 0 && types.includes('advanced'); }"
}
```

### 示例 6：对象属性检查

```json
{
  "showCondition": "function(formValues) { const config = formValues.config || {}; return config.enableSSL === true && config.port !== undefined; }"
}
```

### 示例 7：Try-Catch 容错处理

```json
{
  "showCondition": "(formValues) => { try { const data = JSON.parse(formValues.jsonConfig || '{}'); return data.advanced === true; } catch (e) { return false; } }"
}
```

---

## 🎨 实际应用场景

### 场景 1：根据端点类型显示不同配置

```json
[
  {
    "field": "endpointType",
    "label": "端点类型",
    "component": "Select",
    "properties": {
      "options": [
        { "label": "HTTP", "value": "http" },
        { "label": "数据库", "value": "database" },
        { "label": "消息队列", "value": "mq" }
      ]
    }
  },
  {
    "field": "url",
    "label": "URL地址",
    "component": "Input",
    "showCondition": "formValues.endpointType === 'http'"
  },
  {
    "field": "connectionString",
    "label": "连接字符串",
    "component": "Input",
    "showCondition": "formValues.endpointType === 'database'"
  },
  {
    "field": "queueName",
    "label": "队列名称",
    "component": "Input",
    "showCondition": "formValues.endpointType === 'mq'"
  }
]
```

### 场景 2：启用认证后显示认证相关字段

```json
[
  {
    "field": "needAuth",
    "label": "需要认证",
    "component": "Switch"
  },
  {
    "field": "authType",
    "label": "认证类型",
    "component": "Select",
    "showCondition": "formValues.needAuth === true",
    "properties": {
      "options": [
        { "label": "Basic", "value": "basic" },
        { "label": "Bearer Token", "value": "bearer" },
        { "label": "API Key", "value": "apikey" }
      ]
    }
  },
  {
    "field": "username",
    "label": "用户名",
    "component": "Input",
    "showCondition": "formValues.needAuth && formValues.authType === 'basic'"
  },
  {
    "field": "password",
    "label": "密码",
    "component": "InputPassword",
    "showCondition": "formValues.needAuth && formValues.authType === 'basic'"
  },
  {
    "field": "token",
    "label": "Token",
    "component": "Input",
    "showCondition": "formValues.needAuth && formValues.authType === 'bearer'"
  },
  {
    "field": "apiKey",
    "label": "API Key",
    "component": "Input",
    "showCondition": "formValues.needAuth && formValues.authType === 'apikey'"
  }
]
```

### 场景 3：高级模式显示更多配置

```json
[
  {
    "field": "mode",
    "label": "配置模式",
    "component": "Radio",
    "properties": {
      "options": [
        { "label": "简单模式", "value": "simple" },
        { "label": "高级模式", "value": "advanced" }
      ]
    }
  },
  {
    "field": "timeout",
    "label": "超时时间（秒）",
    "component": "InputNumber",
    "showCondition": "formValues.mode === 'advanced'",
    "properties": {
      "min": 1,
      "max": 300
    }
  },
  {
    "field": "retryTimes",
    "label": "重试次数",
    "component": "InputNumber",
    "showCondition": "formValues.mode === 'advanced'",
    "properties": {
      "min": 0,
      "max": 10
    }
  },
  {
    "field": "advancedConfig",
    "label": "高级配置",
    "component": "JSON",
    "showCondition": "formValues.mode === 'advanced'"
  }
]
```

### 场景 4：复杂的依赖关系（使用函数）

```json
{
  "field": "sslConfig",
  "label": "SSL配置",
  "component": "JSON",
  "showCondition": "(formValues) => { const protocol = formValues.protocol; const port = formValues.port; const needSSL = formValues.enableSSL; return needSSL && (protocol === 'https' || port === 443); }"
}
```

---

## 💡 最佳实践

### ✅ 推荐做法

1. **简单条件用表达式**
   ```json
   "showCondition": "formValues.needAuth === true"
   ```

2. **复杂逻辑用箭头函数**
   ```json
   "showCondition": "(formValues) => { /* 复杂逻辑 */ }"
   ```

3. **使用严格相等**
   ```json
   "showCondition": "formValues.type === 'http'"  ✅
   "showCondition": "formValues.type == 'http'"   ❌
   ```

4. **防止 undefined 报错**
   ```json
   "showCondition": "formValues.config?.enableSSL === true"
   ```

### ❌ 避免的做法

1. **不要使用 this**
   ```json
   "showCondition": "this.formValues.xxx"  ❌
   ```

2. **不要访问 DOM**
   ```json
   "showCondition": "document.xxx"  ❌
   ```

3. **不要使用全局变量**
   ```json
   "showCondition": "window.xxx"  ❌
   ```

4. **不要有副作用**
   ```json
   "showCondition": "(formValues) => { console.log(formValues); return true; }"  ❌
   ```

---

## 🔍 调试技巧

### 1. 查看控制台警告

如果条件执行失败，控制台会输出警告信息：
```
字段 xxx 的显示条件执行失败: Error message
showCondition: your condition here
```

### 2. 使用简单表达式测试

先用简单的条件测试：
```json
"showCondition": "true"  // 总是显示
"showCondition": "false" // 总是隐藏
```

### 3. 检查字段名

确保字段名正确：
```json
"showCondition": "formValues.needAuth"  // 正确
"showCondition": "formValues.need_auth" // 如果字段名不对则无效
```

### 4. 打印调试（仅测试用）

```json
"showCondition": "(formValues) => { console.log('formValues:', formValues); return formValues.needAuth; }"
```

---

## 🎯 总结

| 特性 | JS 表达式 | 函数字符串 |
|-----|---------|----------|
| 简洁性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 灵活性 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 可读性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 复杂逻辑 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 适用场景 | 简单条件判断 | 复杂逻辑处理 |

**建议**：
- 简单条件（90%的场景）→ 使用 **JS 表达式**
- 复杂逻辑（10%的场景）→ 使用 **函数字符串**

---

**更新时间**: 2025-10-15  
**版本**: 1.0.0

