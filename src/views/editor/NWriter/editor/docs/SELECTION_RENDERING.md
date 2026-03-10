# 选区绘制优化：解决颜色深时文字不清晰的问题

## 问题描述

当选区层使用较深的颜色时（如 `rgba(173, 216, 230, 0.6)` 改为更深的蓝色），底下内容层的文字会被遮挡而看不清楚。这是因为选区层在内容层上方，使用不透明填充会直接遮挡文字。

---

## 解决方案对比

### 方案 1：使用混合模式（推荐 ⭐）

**原理：** 使用 Canvas 的 `globalCompositeOperation` 让选区颜色与下方文字混合，而不是简单叠加。

**代码：**
```typescript
selectionCtx.save();
selectionCtx.globalCompositeOperation = 'multiply'; // 正片叠底
selectionCtx.fillStyle = 'rgba(100, 180, 255, 0.8)'; // 可以使用更深、更饱和的颜色
selectionCtx.fillRect(textX, selectionY, line1Width, selectionHeight);
selectionCtx.restore();
```

**优点：**
- ✅ 文字始终清晰可见
- ✅ 可以使用更深、更鲜艳的选区颜色
- ✅ 视觉效果专业，类似真实文本选中效果
- ✅ 适用于各种背景和文字颜色

**缺点：**
- ⚠️ 在白色背景上，multiply 会使选区颜色变暗
- ⚠️ 需要根据背景调整混合模式

**推荐混合模式：**

| 混合模式 | 效果 | 适用场景 |
|---------|------|----------|
| `multiply` | 正片叠底，颜色变暗 | 白色/浅色背景，深色文字 |
| `screen` | 滤色，颜色变亮 | 深色背景，浅色文字 |
| `overlay` | 叠加，保留底层明暗 | 通用，效果柔和 |
| `darken` | 变暗，保留较暗部分 | 需要突出文字的场景 |
| `lighten` | 变亮，保留较亮部分 | 深色背景 |
| `color` | 保留底层亮度，改变色相 | 需要保持文字对比度 |

---

### 方案 2：只绘制边框

**原理：** 不填充选区，只绘制边框轮廓。

**代码：**
```typescript
selectionCtx.strokeStyle = 'rgba(0, 120, 215, 0.9)';
selectionCtx.lineWidth = 2;
selectionCtx.strokeRect(textX, selectionY, line1Width, selectionHeight);
```

**优点：**
- ✅ 文字完全清晰（无遮挡）
- ✅ 可以使用任意深度的颜色
- ✅ 简洁明了

**缺点：**
- ⚠️ 视觉效果不如填充明显
- ⚠️ 在复杂背景上可能不够突出

**适用场景：**
- 需要精确查看文字内容的场景
- 多个选区重叠时避免颜色混乱
- 低对比度设计风格

---

### 方案 3：双层绘制（浅色填充 + 深色边框）

**原理：** 先用极浅的颜色填充，再绘制深色边框。

**代码：**
```typescript
// 浅色填充
selectionCtx.fillStyle = 'rgba(173, 216, 230, 0.3)';
selectionCtx.fillRect(textX, selectionY, line1Width, selectionHeight);

// 深色边框
selectionCtx.strokeStyle = 'rgba(0, 120, 215, 0.8)';
selectionCtx.lineWidth = 1;
selectionCtx.strokeRect(textX, selectionY, line1Width, selectionHeight);
```

**优点：**
- ✅ 兼具填充的明显性和边框的清晰度
- ✅ 文字清晰可读
- ✅ 视觉层次丰富

**缺点：**
- ⚠️ 需要绘制两次，性能略低
- ⚠️ 浅色填充在浅色背景上不够明显

**适用场景：**
- 需要兼顾视觉效果和文字清晰度
- 多层次的设计风格

---

### 方案 4：调整层级顺序（需重构）

**原理：** 将选区层移到内容层下方（背景层和内容层之间）。

**实现：**
```typescript
// 在 parentElement setter 中调整 z-index
this._bgH5Canvas.style.zIndex = '1';      // 背景层
this._selectionH5Canvas.style.zIndex = '2'; // 选区层（移到内容层下方）
this._orionH5Canvas.style.zIndex = '3';    // 内容层
this._interactionH5Canvas.style.zIndex = '4';
this._caretH5Canvas.style.zIndex = '5';
this._scrollbarH5Canvas.style.zIndex = '999';
```

**优点：**
- ✅ 文字永远在选区上方，完全清晰
- ✅ 可以使用任意颜色和透明度
- ✅ 无需混合模式

**缺点：**
- ⚠️ 需要重新组织层级结构
- ⚠️ 选区会被内容遮挡（如图片、表格等）
- ⚠️ 不适合所有场景（如选中图片时需要选区在上方）

**适用场景：**
- 纯文本编辑器
- 不需要选中非文本元素的场景

---

## 推荐配置

### 场景 1：纯文本编辑器（如 Word、Notion）

**推荐：方案 1（multiply 混合模式）**

```typescript
selectionCtx.save();
selectionCtx.globalCompositeOperation = 'multiply';
selectionCtx.fillStyle = 'rgba(100, 150, 255, 0.9)'; // 深蓝色
selectionCtx.fillRect(textX, selectionY, line1Width, selectionHeight);
selectionCtx.restore();
```

### 场景 2：代码编辑器（如 VS Code）

**推荐：方案 2（边框 + 极浅填充）**

```typescript
// 极浅填充
selectionCtx.fillStyle = 'rgba(100, 150, 255, 0.15)';
selectionCtx.fillRect(textX, selectionY, line1Width, selectionHeight);

// 边框
selectionCtx.strokeStyle = 'rgba(0, 120, 215, 0.6)';
selectionCtx.lineWidth = 1;
selectionCtx.strokeRect(textX, selectionY, line1Width, selectionHeight);
```

### 场景 3：富文本编辑器（如印象笔记）

**推荐：方案 3（双层绘制）**

```typescript
selectionCtx.fillStyle = 'rgba(255, 235, 59, 0.4)'; // 高亮黄色
selectionCtx.fillRect(textX, selectionY, line1Width, selectionHeight);

selectionCtx.strokeStyle = 'rgba(251, 192, 45, 0.8)';
selectionCtx.lineWidth = 1;
selectionCtx.strokeRect(textX, selectionY, line1Width, selectionHeight);
```

---

## 颜色建议

### 浅色主题（白色背景）

| 颜色用途 | 颜色值 | 说明 |
|---------|--------|------|
| 默认选区（浅蓝） | `rgba(173, 216, 230, 0.3)` | 清淡，不干扰阅读 |
| 焦点选区（深蓝） | `rgba(0, 120, 215, 0.5)` + `multiply` | 突出当前操作 |
| 多选区 | `rgba(255, 235, 59, 0.3)` | 高亮黄色，易区分 |
| 查找结果 | `rgba(255, 152, 0, 0.3)` | 橙色，醒目 |

### 深色主题（黑色背景）

| 颜色用途 | 颜色值 | 说明 |
|---------|--------|------|
| 默认选区 | `rgba(100, 150, 255, 0.3)` | 蓝色，对比度适中 |
| 焦点选区 | `rgba(100, 150, 255, 0.5)` + `screen` | 更亮，更突出 |
| 多选区 | `rgba(255, 235, 100, 0.2)` | 浅黄色 |
| 查找结果 | `rgba(255, 180, 50, 0.3)` | 浅橙色 |

---

## 性能考虑

### 混合模式性能

- `multiply` / `screen` / `overlay` 等混合模式需要 GPU 计算
- 大量选区时可能影响性能（>100 个矩形）
- 建议：使用 `will-change: transform` 提示浏览器优化

### 优化建议

1. **合并选区**：连续的选区合并为一个大矩形
   ```typescript
   // Bad: 逐字绘制
   for (const char of selectedText) {
     selectionCtx.fillRect(charX, charY, charWidth, lineHeight);
   }
   
   // Good: 整行绘制
   selectionCtx.fillRect(lineStartX, lineY, lineWidth, lineHeight);
   ```

2. **离屏渲染**：预先在离屏 canvas 绘制选区，再 blit 到选区层
   ```typescript
   const offscreenCanvas = document.createElement('canvas');
   const offCtx = offscreenCanvas.getContext('2d');
   // 在 offCtx 上绘制所有选区
   selectionCtx.drawImage(offscreenCanvas, 0, 0);
   ```

3. **按需重绘**：只重绘变化的选区区域
   ```typescript
   // 只清空变化的区域
   selectionCtx.clearRect(changeRect.x, changeRect.y, changeRect.width, changeRect.height);
   ```

---

## 实现示例

### 完整的选区绘制方法

```typescript
private repaintSelection(): void {
  const selectionCtx = this._selectionH5Canvas?.getContext('2d');
  if (!selectionCtx) return;

  selectionCtx.clearRect(0, 0, this._width, this._height);

  // 获取当前所有选区
  const selections = this.getSelections(); // TODO: 实现 getSelections

  for (const selection of selections) {
    const { x, y, width, height, type } = selection;

    // 根据选区类型使用不同的绘制方式
    switch (type) {
      case 'primary': // 主选区
        selectionCtx.save();
        selectionCtx.globalCompositeOperation = 'multiply';
        selectionCtx.fillStyle = 'rgba(0, 120, 215, 0.8)';
        selectionCtx.fillRect(x, y, width, height);
        selectionCtx.restore();
        break;

      case 'secondary': // 次选区（多光标）
        selectionCtx.fillStyle = 'rgba(173, 216, 230, 0.3)';
        selectionCtx.fillRect(x, y, width, height);
        break;

      case 'find': // 查找结果
        selectionCtx.fillStyle = 'rgba(255, 152, 0, 0.3)';
        selectionCtx.fillRect(x, y, width, height);
        selectionCtx.strokeStyle = 'rgba(255, 152, 0, 0.8)';
        selectionCtx.lineWidth = 1;
        selectionCtx.strokeRect(x, y, width, height);
        break;
    }
  }
}
```

---

## 总结

**最佳实践：**
1. **首选混合模式**：`multiply` 适用于大多数场景
2. **提供主题切换**：浅色/深色主题使用不同的混合模式和颜色
3. **考虑性能**：大量选区时合并绘制或使用离屏渲染
4. **用户可配置**：允许用户自定义选区颜色和透明度

**当前实现：**
- ✅ 使用 `multiply` 混合模式
- ✅ 深色选区 `rgba(100, 180, 255, 0.8)` 文字清晰可见
- ✅ 提供多种备选方案供切换
