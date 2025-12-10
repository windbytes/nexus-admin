import type React from 'react';
import { useEffect } from 'react';

/**
 *
 * @returns 菜单
 */
const Menu: React.FC = () => {
  useEffect(() => {
    console.log('菜单模块加载');
  }, []);
  return <div className="flex gap-2 h-full w-full">菜单模块</div>;
};

export default Menu;
