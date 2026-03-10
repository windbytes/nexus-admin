# 滚动条实现说明

## 概述

Orion 编辑器在独立的滚动条层绘制垂直和水平滚动条，滚动条始终显示，宽度为 20px。滚动时，背景、纸张、内容等所有层的位置都会根据滚动偏移自动调整。

---

## 1. 滚动条层架构

### 1.1 Canvas 层级

```
┌─────────────────────────────────┐
│  _scrollbarH5Canvas (z-index: 999)  │  滚动条层（最顶层）
│  _caretH5Canvas (z-index: 5)       │  光标层
│  _interactionH5Canvas (z-index: 4)  │  交互层
│  _selectionH5Canvas (z-index: 3)   │  选区层
│  _orionH5Canvas (z-index: 2)       │  内容层
│  _bgH5Canvas (z-index: 1)          │  背景层
└─────────────────────────────────┘
```

### 1.2 Scrollbar 类

位置：`controls/Scrollbar.ts`

**主要属性：**
- `WIDTH = 20`：滚动条宽度
- `TRACK_COLOR`：滑轨颜色（浅灰）
- `THUMB_COLOR`：滑块颜色（中灰）
- `THUMB_MIN_SIZE = 40`：滑块最小尺寸

**主要方法：**
- `setDimensions()`：设置视口与内容尺寸
- `setScroll()`：设置滚动位置
- `draw()`：绘制滚动条
- `getAvailableWidth/Height()`：获取可用内容区域（扣除滚动条占用）

---

## 2. 滚动条绘制

### 2.1 垂直滚动条

**位置：**
- X：`viewportWidth - 20`（右侧）
- Y：`0`（顶部开始）
- 宽度：`20px`
- 高度：`viewportHeight - (水平滚动条存在 ? 20 : 0)`

**滑块计算：**
```typescript
const trackHeight = viewportHeight - 20;
const thumbHeight = Math.max(40, (trackHeight / contentHeight) * trackHeight);
const thumbTop = (scrollTop / maxScrollTop) * (trackHeight - thumbHeight);
```

### 2.2 水平滚动条

**位置：**
- X：`0`（左侧开始）
- Y：`viewportHeight - 20`（底部）
- 宽度：`viewportWidth - (垂直滚动条存在 ? 20 : 0)`
- 高度：`20px`

**滑块计算：**
```typescript
const trackWidth = viewportWidth - 20;
const thumbWidth = Math.max(40, (trackWidth / contentWidth) * trackWidth);
const thumbLeft = (scrollLeft / maxScrollLeft) * (trackWidth - thumbWidth);
```

### 2.3 右下角填充块

当垂直和水平滚动条都存在时，在 `(width-20, height-20)` 处绘制 `20×20` 的填充块。

---

## 3. 内容区域调整

### 3.1 可用空间计算

```typescript
const availableWidth = scrollbar.getAvailableWidth();
const availableHeight = scrollbar.getAvailableHeight();
```

- **扣除垂直滚动条**：`availableWidth = viewportWidth - 20`
- **扣除水平滚动条**：`availableHeight = viewportHeight - 20`

### 3.2 背景层调整

```typescript
// A4 纸张在可用宽度内居中
const a4Left = (availableWidth - a4Width) / 2;
// 纸张位置考虑垂直滚动偏移
const a4Top = topMargin - scrollTop;
```

### 3.3 内容层调整

```typescript
// 文本位置同样考虑滚动偏移和可用宽度
const textX = a4Left + 40;
const textY = a4Top + 40;
```

### 3.4 选区层调整

选区绘制位置跟随内容层，同样考虑 `scrollTop` 和 `availableWidth`。

---

## 4. 滚动交互

### 4.1 设置滚动位置

```typescript
// 垂直滚动
orion.setScrollTop(newScrollTop);

// 水平 + 垂直滚动
orion.setScrollTop(newScrollTop, newScrollLeft);
```

**触发流程：**
```
setScrollTop()
   ↓
requestViewportUpdate()
   ↓
requestAnimationFrame
   ↓
updateViewportPipeline()
   ↓
repaintBackground()      // 更新 A4 纸张位置
repaintContent()         // 更新内容位置
repaintSelection()       // 更新选区位置
repaintOverlay()         // 更新交互层
repaintCaret()           // 更新光标位置
repaintScrollbar()       // 更新滚动条滑块位置
```

### 4.2 鼠标滚轮

```typescript
container.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY;
  orion.setScrollTop(currentScrollTop + delta);
});
```

### 4.3 触摸滑动

```typescript
container.addEventListener('touchmove', (e) => {
  const deltaY = touchStartY - e.touches[0].clientY;
  orion.setScrollTop(initialScrollTop + deltaY);
});
```

### 4.4 键盘导航

```typescript
switch (e.key) {
  case 'ArrowUp':
    orion.setScrollTop(currentScrollTop - 40);
    break;
  case 'ArrowDown':
    orion.setScrollTop(currentScrollTop + 40);
    break;
  case 'PageUp':
    orion.setScrollTop(currentScrollTop - 500);
    break;
  case 'PageDown':
    orion.setScrollTop(currentScrollTop + 500);
    break;
}
```

---

## 5. 未来优化方向

### 5.1 滚动条交互

1. **滑块拖拽**
   - 监听 `mousedown` 在滑块上
   - 监听 `mousemove` 计算新滚动位置
   - 监听 `mouseup` 结束拖拽

2. **滑轨点击**
   - 点击滑轨跳转到对应位置
   - 计算点击位置占滑轨的比例
   - 映射到内容滚动位置

3. **滑块悬停**
   - 监听 `mousemove` 判断是否在滑块上
   - 改变滑块颜色（`THUMB_HOVER_COLOR`）
   - 重绘滚动条层

### 5.2 性能优化

1. **滚动防抖**
   ```typescript
   let scrollThrottle = null;
   function onScroll(delta) {
     if (scrollThrottle) return;
     scrollThrottle = setTimeout(() => {
       orion.setScrollTop(currentScrollTop + delta);
       scrollThrottle = null;
     }, 16); // ~60fps
   }
   ```

2. **滚动条自动隐藏**
   - 无操作 1 秒后淡出滚动条
   - 滚动或悬停时重新显示
   - 使用 `globalAlpha` 实现透明度动画

3. **虚拟滚动**
   - 超长文档只渲染可见区域 + 上下缓冲区
   - 根据 `scrollTop` 计算可见页范围
   - 动态加载/卸载内容

### 5.3 平滑滚动

```typescript
function smoothScrollTo(target, duration = 300) {
  const start = currentScrollTop;
  const distance = target - start;
  const startTime = performance.now();

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = easeInOutCubic(progress);
    orion.setScrollTop(start + distance * easeProgress);
    if (progress < 1) requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
```

### 5.4 滚动条样式自定义

```typescript
class Scrollbar {
  // 允许外部自定义颜色
  static trackColor = '#f0f0f0';
  static thumbColor = '#c0c0c0';
  static thumbHoverColor = '#a0a0a0';
  
  // 允许自定义宽度
  static width = 20;
  
  // 允许自定义圆角
  static borderRadius = 4;
}
```

---

## 6. 调试技巧

### 6.1 查看滚动状态

```typescript
console.log('ScrollTop:', orion._scrollTop);
console.log('ScrollLeft:', orion._scrollLeft);
console.log('Available Width:', scrollbar.getAvailableWidth());
console.log('Available Height:', scrollbar.getAvailableHeight());
```

### 6.2 高亮滚动区域

在 `repaintScrollbar` 中临时添加：
```typescript
// 高亮可用内容区域（调试用）
ctx.strokeStyle = 'red';
ctx.lineWidth = 2;
ctx.strokeRect(0, 0, scrollbar.getAvailableWidth(), scrollbar.getAvailableHeight());
```

### 6.3 日志滚动事件

```typescript
orion.setScrollTop = ((originalSetScrollTop) => {
  return function(scrollTop, scrollLeft = this._scrollLeft) {
    console.log(`Scroll: (${scrollLeft}, ${scrollTop})`);
    return originalSetScrollTop.call(this, scrollTop, scrollLeft);
  };
})(orion.setScrollTop);
```

---

## 7. API 参考

### 7.1 Orion 类

```typescript
class Orion {
  // 设置滚动位置
  setScrollTop(scrollTop: number, scrollLeft?: number): void;
  
  // 设置缩放（会触发视口更新）
  setScale(scale: number): void;
}
```

### 7.2 Scrollbar 类

```typescript
class Scrollbar {
  // 常量
  static readonly WIDTH = 20;
  static readonly TRACK_COLOR = '#f0f0f0';
  static readonly THUMB_COLOR = '#c0c0c0';
  static readonly THUMB_MIN_SIZE = 40;
  
  // 设置尺寸
  setDimensions(viewportWidth: number, viewportHeight: number, 
                contentWidth: number, contentHeight: number): void;
  
  // 设置滚动位置
  setScroll(scrollLeft: number, scrollTop: number): void;
  
  // 绘制滚动条
  draw(ctx: CanvasRenderingContext2D, 
       viewportWidth: number, viewportHeight: number): void;
  
  // 获取可用空间
  getAvailableWidth(): number;
  getAvailableHeight(): number;
  
  // 检查是否需要滚动条
  hasVerticalScrollbar(): boolean;
  hasHorizontalScrollbar(): boolean;
  
  // 获取滑块位置与尺寸
  getVerticalThumb(): { top: number; height: number };
  getHorizontalThumb(): { left: number; width: number };
}
```
