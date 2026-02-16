# Orion 编辑器更新管线说明

## 概述

Orion 编辑器采用**内容更新管线**与**视口更新管线**分离的架构，实现高效的增量渲染与视口重绘。

---

## 1. 内容更新管线（数据变化）

**触发场景：**
- 用户输入、删除
- 公式变化
- 批注变化
- 其他编辑操作

**流程：**
```
编辑操作
   ↓
invalidate(rect)  // 标记脏区域
   ↓
DirtyManager 合并
   ↓
requestAnimationFrame
   ↓
updateOffscreen(rect)  // 在离屏 canvas 绘制内容
   ↓
blitToContentLayer(rect)  // 拷贝到内容层
   ↓
repaintSelection()  // 局部刷新选区层
   ↓
repaintOverlay()  // 局部刷新交互层
```

**特点：**
- 只更新受影响的区域（增量更新）
- 不一定需要重绘整个视口
- 使用离屏 canvas 保存完整文档内容

**使用示例：**
```typescript
// 当用户输入一个字符后
const dirtyRect = Rect.createByBounds(cursorX, cursorY, charWidth, lineHeight);
orion.invalidate(dirtyRect);
```

---

## 2. 视口更新管线（视口变化）

**触发场景：**
- `scrollTop` 改变（滚动）
- `zoom` 改变（缩放）
- `resize`（窗口大小改变）
- 分页等全局重排

**流程：**
```
setScrollTop() / setScale() / resize()
   ↓
requestAnimationFrame
   ↓
repaintBackground()  // 重绘背景层（灰底 + A4）
   ↓
repaintContentFromOffscreen()  // 从离屏 canvas blit 可见区域
   ↓
repaintSelection()  // 重绘选区层
   ↓
repaintOverlay()  // 重绘交互层
   ↓
repaintCaret()  // 重绘光标层
```

**特点：**
- **不更新离屏 canvas**（数据未变）
- **不走 dirty 管理**
- **重绘整个 viewport**
- 从已有的离屏内容 blit 到内容层

**使用示例：**
```typescript
// 当用户滚动时
orion.setScrollTop(newScrollTop);

// 当用户缩放时
orion.setScale(1.5);

// 窗口 resize 会自动触发视口更新
```

---

## 3. 核心 API

### 3.1 内容更新

```typescript
/**
 * 标记区域为脏（触发内容更新管线）
 */
invalidate(rect: Rect): void

/**
 * 在离屏 canvas 上更新脏区域
 */
private updateOffscreen(rect: Rect): void

/**
 * 将离屏 canvas 的指定区域拷贝到内容层
 */
private blitToContentLayer(rect: Rect): void
```

### 3.2 视口更新

```typescript
/**
 * 设置滚动位置（触发视口更新管线）
 */
setScrollTop(scrollTop: number, scrollLeft?: number): void

/**
 * 设置缩放（触发视口更新管线）
 */
setScale(scale: number): void

/**
 * 从离屏 canvas 重绘内容层（整个视口）
 */
private repaintContentFromOffscreen(): void

/**
 * 重绘背景层
 */
private repaintBackground(): void

/**
 * 重绘选区层
 */
private repaintSelection(): void

/**
 * 重绘交互层（hover、高亮、辅助线等）
 */
private repaintOverlay(): void

/**
 * 重绘光标层
 */
private repaintCaret(): void
```

---

## 4. 分层架构

| 层级 | Canvas | 用途 | 更新方式 |
|------|--------|------|----------|
| 背景层 | `_bgH5Canvas` | 灰色背景、A4 白纸区域 | 视口更新时重绘 |
| 内容层 | `_orionH5Canvas` | 文本、表格、图片、公式等 | 从离屏 canvas blit |
| 选区层 | `_selectionH5Canvas` | 选区高亮 | 两条管线都会重绘 |
| 交互层 | `_interactionH5Canvas` | hover、辅助线、拖拽框 | 两条管线都会重绘 |
| 光标层 | `_caretH5Canvas` | 闪烁光标 | 独立 rAF 500ms 闪烁 |
| 离屏层 | `_offscreenH5Canvas` | 完整文档内容 | 仅内容更新管线写入 |

---

## 5. 优化要点

### 5.1 DirtyManager
- 自动合并多个脏区域为包围盒（避免频繁小区域更新）
- 可扩展为多矩形合并算法（减少重绘面积）

### 5.2 离屏 Canvas
- 保存完整文档渲染结果
- 滚动/缩放时无需重新绘制内容，直接 blit
- 内存占用：完整文档尺寸（需按需优化为分页离屏）

### 5.3 requestAnimationFrame 合并
- 内容更新管线通过 rAF 合并多次 `invalidate` 调用
- 视口更新管线通过 rAF 合并多次滚动/缩放事件

### 5.4 光标闪烁
- 独立 rAF 循环，500ms 切换显示/隐藏
- 仅重绘光标层（最小开销）

---

## 6. 后续优化方向

1. **分页离屏渲染**：超长文档只维护可见页的离屏 canvas
2. **Worker 离屏绘制**：将 `updateOffscreen` 移到 Worker 线程
3. **脏区域优化**：多矩形合并算法（减少不必要的重绘区域）
4. **虚拟滚动**：超长文档只渲染可见区域 + 上下缓冲区
5. **选区/交互层增量更新**：避免每次全量重绘
