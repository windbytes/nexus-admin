# Canvas 像素对齐问题与解决方案

## 1. 问题描述

在 Canvas 中绘制 1px 线条时，经常会发现线条看起来**模糊不清**，而不是锐利的。

### 1.1 为什么会模糊？

Canvas 的坐标系统是**浮点数**，当你在整数像素坐标（如 `100`, `200`）上绘制 1px 线条时：

```
像素网格:  99    100    101    102
           |      |      |      |
线条中心:        100 (整数坐标)
实际渲染:   [0.5]  [0.5]        (分布在两个像素上)
```

线条会**跨越两个像素**，浏览器使用抗锯齿来渲染，导致线条看起来是灰色且模糊的。

### 1.2 视觉对比

```typescript
// ❌ 模糊的线条
ctx.strokeStyle = '#000';
ctx.lineWidth = 1;
ctx.moveTo(100, 50);
ctx.lineTo(100, 150);
ctx.stroke();
// 结果：灰色、模糊

// ✅ 清晰的线条
ctx.strokeStyle = '#000';
ctx.lineWidth = 1;
ctx.moveTo(100.5, 50.5);
ctx.lineTo(100.5, 150.5);
ctx.stroke();
// 结果：黑色、锐利
```

## 2. 解决方案

### 2.1 基本方法：加 0.5 偏移

对于**奇数宽度的线条**（1px, 3px, 5px），将坐标调整到半像素位置：

```typescript
const x = Math.floor(originalX) + 0.5;
const y = Math.floor(originalY) + 0.5;
```

```
像素网格:  99    100    101    102
           |      |      |      |
线条中心:       100.5 (半像素坐标)
实际渲染:         [1]            (完整落在一个像素上)
```

### 2.2 考虑 DPR（设备像素比）

在高 DPI 屏幕（Retina, 4K）上，`devicePixelRatio` 可能是 2、3 或更高：

```typescript
const dpr = window.devicePixelRatio; // 例如 2

// 错误做法（仍然模糊）
const x = Math.floor(logicalX) + 0.5;

// 正确做法：考虑 DPR
const snap = (value: number) => {
  return Math.floor(value * dpr) / dpr + 0.5 / dpr;
};

const x = snap(logicalX);
const y = snap(logicalY);
```

**工作原理：**

| DPR | 逻辑坐标 | 物理像素 | 对齐后（逻辑） | 效果 |
|-----|---------|---------|--------------|------|
| 1   | 100     | 100     | 100.5        | ✅ 清晰 |
| 2   | 100     | 200     | 100.25       | ✅ 清晰 |
| 3   | 100     | 300     | 100.167      | ✅ 清晰 |

### 2.3 在 Orion 编辑器中的应用

```typescript
// 在 drawPaperMarginCorners 方法中
private drawPaperMarginCorners(ctx: CanvasRenderingContext2D, ...): void {
  // ... 计算边距位置 ...

  // 像素对齐函数
  const snap = (value: number) => {
    return Math.floor(value * this._dpr) / this._dpr + 0.5 / this._dpr;
  };

  // 对齐所有坐标
  const leftX = snap(leftMarginX);
  const rightX = snap(rightMarginX);
  const topY = snap(topMarginY);
  const bottomY = snap(bottomMarginY);

  // 使用对齐后的坐标绘制
  ctx.moveTo(leftX, topY);
  ctx.lineTo(leftX + lineLen, topY);
  // ...
}
```

## 3. 不同线宽的处理

### 3.1 奇数宽度线条（1px, 3px, 5px）

需要 **+0.5 偏移**：

```typescript
ctx.lineWidth = 1;
ctx.moveTo(100.5, 50.5);
ctx.lineTo(100.5, 150.5);
```

### 3.2 偶数宽度线条（2px, 4px, 6px）

使用**整数坐标**即可：

```typescript
ctx.lineWidth = 2;
ctx.moveTo(100, 50);
ctx.lineTo(100, 150);
```

### 3.3 规则总结

```typescript
function alignCoordinate(coord: number, lineWidth: number, dpr: number): number {
  if (lineWidth % 2 === 1) {
    // 奇数宽度：半像素对齐
    return Math.floor(coord * dpr) / dpr + 0.5 / dpr;
  }
  // 偶数宽度：整数对齐
  return Math.round(coord * dpr) / dpr;
}
```

## 4. 常见场景

### 4.1 绘制边框

```typescript
// ❌ 模糊
ctx.strokeRect(10, 10, 100, 100);

// ✅ 清晰
ctx.strokeRect(10.5, 10.5, 100, 100);
```

### 4.2 绘制网格线

```typescript
// ❌ 模糊
for (let x = 0; x < width; x += 20) {
  ctx.moveTo(x, 0);
  ctx.lineTo(x, height);
}

// ✅ 清晰
for (let x = 0; x < width; x += 20) {
  const snappedX = Math.floor(x) + 0.5;
  ctx.moveTo(snappedX, 0);
  ctx.lineTo(snappedX, height);
}
```

### 4.3 绘制分隔线

```typescript
// ❌ 模糊
ctx.moveTo(0, 50);
ctx.lineTo(300, 50);

// ✅ 清晰
const y = Math.floor(50) + 0.5;
ctx.moveTo(0, y);
ctx.lineTo(300, y);
```

## 5. 调试技巧

### 5.1 视觉检查

放大 Canvas 到 200%-400%，检查线条是否：
- ✅ 单个像素，颜色饱满
- ❌ 跨越多个像素，半透明

### 5.2 添加辅助函数

```typescript
// 在开发时添加调试辅助
function drawDebugGrid(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
  ctx.lineWidth = 1;
  
  // 绘制像素网格
  for (let x = 0.5; x < width; x += 10) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = 0.5; y < height; y += 10) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();
}
```

### 5.3 检查 DPR

```typescript
console.log('Device Pixel Ratio:', window.devicePixelRatio);
console.log('Canvas width:', canvas.width);
console.log('Canvas style width:', canvas.style.width);
// 正确的比例：canvas.width = styleWidth * devicePixelRatio
```

## 6. 相关资源

- [MDN: Applying styles and colors](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors)
- [HTML5 Canvas: Drawing 1-pixel lines](https://stackoverflow.com/questions/195262/can-i-turn-off-antialiasing-on-an-html-canvas-element)
- [Pixel-perfect rendering](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas#turn_off_transparency)

## 7. 总结

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 1px 线条模糊 | 坐标在整数像素上 | 加 0.5 偏移 |
| 高 DPI 屏幕仍模糊 | 未考虑 DPR | `Math.floor(x * dpr) / dpr + 0.5 / dpr` |
| 2px 线条模糊 | 使用了半像素坐标 | 使用整数坐标 |

**核心原则：**
- **奇数宽度线条** → 半像素坐标（x.5, y.5）
- **偶数宽度线条** → 整数坐标（x, y）
- **始终考虑 DPR** → 在物理像素层面对齐
