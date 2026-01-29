import { useContext } from 'react';
import { IsSidebarContext } from '../context/sidebar-context';

/**
 * 判定是否为侧边栏的上下文
 * @returns
 */
export function useIsSidebar() {
  return useContext(IsSidebarContext);
}
