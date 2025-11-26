import { useSize } from 'ahooks';
import { useRef } from 'react';

/**
 * 计算表格滚动配置项的hooks
 * @param scrollX 横向滚动宽度
 */
export default function useTableScroll(scrollX: string | number = 702) {
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  const size = useSize(tableWrapperRef);

  function getTableScrollY() {
    const height = size?.height;

    if (!height) return undefined;

    return height - 96;
  }

  const scrollConfig = {
    x: scrollX,
    y: getTableScrollY(),
  };

  return {
    scrollConfig,
    tableWrapperRef,
  };
}
