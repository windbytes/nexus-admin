/**
 * 滚动条使用示例
 */

import { OrionEditor } from '../index';

// 创建编辑器实例
const container = document.getElementById('editor-container') as HTMLDivElement;
const editor = new OrionEditor(container, {
  scale: 1.0,
  locale: 'zh-CN',
});

const orion = editor.orion;

// ========== 滚动示例 ==========

// 1. 监听鼠标滚轮事件
container.addEventListener('wheel', (e) => {
  e.preventDefault();

  // 垂直滚动
  if (!e.shiftKey && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    const currentScrollTop = 0; // TODO: 从编辑器状态获取
    const newScrollTop = Math.max(0, currentScrollTop + e.deltaY);
    orion.setScrollTop(newScrollTop);
  }

  // 水平滚动（按住 Shift 或横向滚动）
  if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
    const currentScrollLeft = 0; // TODO: 从编辑器状态获取
    const currentScrollTop = 0;
    const newScrollLeft = Math.max(0, currentScrollLeft + (e.shiftKey ? e.deltaY : e.deltaX));
    orion.setScrollTop(currentScrollTop, newScrollLeft);
  }
});

// 2. 监听触摸滑动（移动端）
let touchStartY = 0;
let touchStartX = 0;
let initialScrollTop = 0;
let initialScrollLeft = 0;

container.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    initialScrollTop = 0; // TODO: 从编辑器状态获取
    initialScrollLeft = 0;
  }
});

container.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (e.touches.length === 1) {
    const deltaY = touchStartY - e.touches[0].clientY;
    const deltaX = touchStartX - e.touches[0].clientX;
    const newScrollTop = Math.max(0, initialScrollTop + deltaY);
    const newScrollLeft = Math.max(0, initialScrollLeft + deltaX);
    orion.setScrollTop(newScrollTop, newScrollLeft);
  }
});

// 3. 键盘导航
document.addEventListener('keydown', (e) => {
  const currentScrollTop = 0; // TODO: 从编辑器状态获取
  const currentScrollLeft = 0;
  const step = 40; // 滚动步长

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      orion.setScrollTop(Math.max(0, currentScrollTop - step));
      break;
    case 'ArrowDown':
      e.preventDefault();
      orion.setScrollTop(currentScrollTop + step);
      break;
    case 'ArrowLeft':
      e.preventDefault();
      orion.setScrollTop(currentScrollTop, Math.max(0, currentScrollLeft - step));
      break;
    case 'ArrowRight':
      e.preventDefault();
      orion.setScrollTop(currentScrollTop, currentScrollLeft + step);
      break;
    case 'PageUp':
      e.preventDefault();
      orion.setScrollTop(Math.max(0, currentScrollTop - 500));
      break;
    case 'PageDown':
      e.preventDefault();
      orion.setScrollTop(currentScrollTop + 500);
      break;
    case 'Home':
      if (e.ctrlKey) {
        e.preventDefault();
        orion.setScrollTop(0, 0);
      }
      break;
    case 'End':
      if (e.ctrlKey) {
        e.preventDefault();
        orion.setScrollTop(Number.MAX_SAFE_INTEGER); // 滚动到底部
      }
      break;
  }
});

// ========== 滚动条交互示例（未来实现） ==========

/**
 * 未来可以添加的滚动条交互功能：
 * 
 * 1. 滑块拖拽：
 *    - 监听 mousedown 在滑块上
 *    - 监听 mousemove 计算新滚动位置
 *    - 监听 mouseup 结束拖拽
 * 
 * 2. 滑轨点击：
 *    - 监听 mousedown 在滑轨上
 *    - 计算点击位置对应的滚动位置
 *    - 调用 setScrollTop 跳转
 * 
 * 3. 滑块悬停效果：
 *    - 监听 mousemove 判断是否在滑块上
 *    - 改变滑块颜色
 *    - 重绘滚动条层
 * 
 * 4. 平滑滚动：
 *    - 使用 requestAnimationFrame 实现缓动
 *    - 从当前位置逐步滚动到目标位置
 */

// ========== 编程式滚动示例 ==========

// 滚动到指定位置
function scrollTo(scrollTop: number, scrollLeft: number = 0) {
  orion.setScrollTop(scrollTop, scrollLeft);
}

// 滚动到顶部
function scrollToTop() {
  scrollTo(0, 0);
}

// 滚动到底部（需要知道内容总高度）
function scrollToBottom(contentHeight: number) {
  scrollTo(contentHeight);
}

// 平滑滚动到指定位置
function smoothScrollTo(targetScrollTop: number, duration: number = 300) {
  const currentScrollTop = 0; // TODO: 从编辑器状态获取
  const startTime = performance.now();
  const distance = targetScrollTop - currentScrollTop;

  function animate(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = easeInOutCubic(progress);
    const newScrollTop = currentScrollTop + distance * easeProgress;

    orion.setScrollTop(newScrollTop);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

// 缓动函数
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export { scrollTo, scrollToTop, scrollToBottom, smoothScrollTo };
