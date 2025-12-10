import type React from 'react';
import { useEffect } from 'react';

/**
 *
 * @returns 菜单
 */
const Role: React.FC = () => {
  useEffect(() => {
    console.log('角色模块加载');
  }, []);
  return <div className="flex gap-2 h-full w-full">角色模块</div>;
};

export default Role;
