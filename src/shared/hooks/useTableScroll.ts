import { type RefObject, useRef } from 'react';
import useSize from './useSize';

/**
 * 表格滚动配置。
 */
export interface TableScrollConfig {
  /** 横向滚动：数值像素或 `'max-content'` 等 CSS 值 */
  x: string | number;
  /** 纵向滚动高度（px）；容器高度未就绪时为 `undefined` */
  y: number | undefined;
}

/**
 * `useTableScroll` 的返回值。
 */
export interface UseTableScrollResult {
  /** 可直接传给 antd Table `scroll` 的配置 */
  scrollConfig: TableScrollConfig;
  /** 需要绑定到表格外层容器的 ref，用于测量可用高度 */
  tableWrapperRef: RefObject<HTMLDivElement | null>;
}

/**
 * 根据表格外层容器高度，计算 antd Table 的 `scroll` 配置。
 * <p>
 * 纵向高度 = 容器高度 - 分页器预留高度，使表格在 flex 布局中占满剩余空间。
 * </p>
 *
 * @param scrollX - 横向滚动配置，默认 `'max-content'`
 * @param paginationHeight - 分页器占用高度（px），默认 `56`；无分页时可传 `0`
 * @returns 滚动配置与容器 ref
 *
 * @example
 * ```tsx
 * const { scrollConfig, tableWrapperRef } = useTableScroll();
 * return (
 *   <div ref={tableWrapperRef}>
 *     <Table scroll={scrollConfig} pagination={false} />
 *   </div>
 * );
 * ```
 */
export default function useTableScroll(
  scrollX: string | number = 'max-content',
  paginationHeight: number = 56
): UseTableScrollResult {
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  const size = useSize(tableWrapperRef);

  /**
   * 计算表格 body 可用纵向高度。
   * @returns 可用高度（px）；容器高度未知时返回 `undefined`
   */
  function getTableScrollY(): number | undefined {
    const height = size?.height;

    if (!height) {
      return undefined;
    }

    return height - paginationHeight;
  }

  const scrollConfig: TableScrollConfig = {
    x: scrollX,
    y: getTableScrollY(),
  };

  return {
    scrollConfig,
    tableWrapperRef,
  };
}
