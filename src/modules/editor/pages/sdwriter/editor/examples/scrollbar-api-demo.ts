// @ts-nocheck
/**
 * Scrollbar API 使用示例：演示如何通过 scrollbar 访问滚动状态
 */

import { OrionEditor } from '../index';

// 创建编辑器实例
const container = document.getElementById('editor-container') as HTMLDivElement;
const editor = new OrionEditor(container);
const orion = editor.orion;

// ========== 通过 Scrollbar 访问滚动状态 ==========

// 1. 获取当前滚动位置
function getCurrentScroll() {
  // scrollTop 和 scrollLeft 现在由 Scrollbar 管理
  // 可以通过 orion._scrollbar 访问（需要 Orion 暴露 scrollbar 的 getter）
  console.log('Current ScrollTop:', orion._scrollbar.scrollTop);
  console.log('Current ScrollLeft:', orion._scrollbar.scrollLeft);
}

// 2. 设置滚动位置（推荐方式：通过 Orion 的 setScrollTop）
function setScroll(scrollTop: number, scrollLeft: number = 0) {
  // 内部会调用 scrollbar.scrollTop = scrollTop 和 scrollbar.scrollLeft = scrollLeft
  orion.setScrollTop(scrollTop, scrollLeft);
}

// 3. 直接通过 scrollbar 设置（如果 Orion 暴露了 scrollbar）
function setScrollDirect(scrollTop: number, scrollLeft: number = 0) {
  // 直接设置 scrollbar 的属性
  orion._scrollbar.scrollTop = scrollTop;
  orion._scrollbar.scrollLeft = scrollLeft;
  // 需要手动触发视口更新
  // orion.requestViewportUpdate(); // 需要 Orion 暴露此方法
}

// 4. 获取滚动范围
function getScrollRange() {
  const maxScrollTop = orion._scrollbar.getMaxScrollTop();
  const maxScrollLeft = orion._scrollbar.getMaxScrollLeft();
  console.log('Max ScrollTop:', maxScrollTop);
  console.log('Max ScrollLeft:', maxScrollLeft);
}

// 5. 检查是否有滚动条
function checkScrollbars() {
  const hasVertical = orion._scrollbar.hasVerticalScrollbar();
  const hasHorizontal = orion._scrollbar.hasHorizontalScrollbar();
  console.log('Has Vertical Scrollbar:', hasVertical);
  console.log('Has Horizontal Scrollbar:', hasHorizontal);
}

// 6. 获取可用内容区域
function getAvailableArea() {
  const availableWidth = orion._scrollbar.getAvailableWidth();
  const availableHeight = orion._scrollbar.getAvailableHeight();
  console.log('Available Width:', availableWidth);
  console.log('Available Height:', availableHeight);
}

// ========== 滚动事件处理 ==========

// 鼠标滚轮滚动
container.addEventListener('wheel', (e) => {
  e.preventDefault();

  // 获取当前滚动位置
  const currentScrollTop = orion._scrollbar.scrollTop;
  const currentScrollLeft = orion._scrollbar.scrollLeft;

  // 计算新的滚动位置
  const newScrollTop = currentScrollTop + e.deltaY;
  const newScrollLeft = currentScrollLeft + e.deltaX;

  // 设置滚动位置（setter 会自动 clamp 到有效范围）
  orion.setScrollTop(newScrollTop, newScrollLeft);
});

// 键盘导航
document.addEventListener('keydown', (e) => {
  const currentScrollTop = orion._scrollbar.scrollTop;
  const step = 40;

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      orion.setScrollTop(currentScrollTop - step);
      break;
    case 'ArrowDown':
      e.preventDefault();
      orion.setScrollTop(currentScrollTop + step);
      break;
    case 'PageUp':
      e.preventDefault();
      orion.setScrollTop(currentScrollTop - 500);
      break;
    case 'PageDown':
      e.preventDefault();
      orion.setScrollTop(currentScrollTop + 500);
      break;
  }
});

// ========== 编程式滚动 ==========

// 滚动到顶部
function scrollToTop() {
  orion.setScrollTop(0, 0);
}

// 滚动到底部
function scrollToBottom() {
  const maxScrollTop = orion._scrollbar.getMaxScrollTop();
  orion.setScrollTop(maxScrollTop);
}

// 滚动到指定位置
function scrollToPosition(scrollTop: number, scrollLeft: number = 0) {
  orion.setScrollTop(scrollTop, scrollLeft);
}

// 相对滚动
function scrollBy(deltaY: number, deltaX: number = 0) {
  const currentScrollTop = orion._scrollbar.scrollTop;
  const currentScrollLeft = orion._scrollbar.scrollLeft;
  orion.setScrollTop(currentScrollTop + deltaY, currentScrollLeft + deltaX);
}

// ========== 滚动状态监听 ==========

// 可以通过轮询或事件系统监听滚动状态变化
let lastScrollTop = 0;
let lastScrollLeft = 0;

function checkScrollChange() {
  const currentScrollTop = orion._scrollbar.scrollTop;
  const currentScrollLeft = orion._scrollbar.scrollLeft;

  if (currentScrollTop !== lastScrollTop || currentScrollLeft !== lastScrollLeft) {
    console.log('Scroll changed:', {
      scrollTop: currentScrollTop,
      scrollLeft: currentScrollLeft,
      deltaY: currentScrollTop - lastScrollTop,
      deltaX: currentScrollLeft - lastScrollLeft,
    });

    lastScrollTop = currentScrollTop;
    lastScrollLeft = currentScrollLeft;

    // 触发自定义滚动事件
    container.dispatchEvent(
      new CustomEvent('editorScroll', {
        detail: {
          scrollTop: currentScrollTop,
          scrollLeft: currentScrollLeft,
        },
      })
    );
  }

  requestAnimationFrame(checkScrollChange);
}

// 启动滚动监听
checkScrollChange();

// ========== 优化建议 ==========

/**
 * 未来可以在 Orion 中添加以下公共 API：
 *
 * 1. 暴露 scrollbar 的 getter
 *    get scrollbar(): Scrollbar {
 *      return this._scrollbar;
 *    }
 *
 * 2. 添加滚动事件回调
 *    onScroll(callback: (scrollTop: number, scrollLeft: number) => void): void
 *
 * 3. 添加便捷方法
 *    scrollTo(scrollTop: number, scrollLeft?: number): void
 *    scrollBy(deltaY: number, deltaX?: number): void
 *    scrollToTop(): void
 *    scrollToBottom(): void
 *
 * 4. 获取滚动信息
 *    getScrollInfo(): {
 *      scrollTop: number;
 *      scrollLeft: number;
 *      maxScrollTop: number;
 *      maxScrollLeft: number;
 *      hasVerticalScrollbar: boolean;
 *      hasHorizontalScrollbar: boolean;
 *    }
 */

export {
  checkScrollbars,
  getAvailableArea,
  getCurrentScroll,
  getScrollRange,
  scrollBy,
  scrollToBottom,
  scrollToPosition,
  scrollToTop,
  setScroll,
};
