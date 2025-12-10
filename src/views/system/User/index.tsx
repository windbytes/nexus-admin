import type React from 'react';
import { useEffect } from 'react';

/**
 *
 * @returns 用户模块
 */
const User: React.FC = () => {
  useEffect(() => {
    console.log('用户模块加载');
  }, []);
  return <div className="flex gap-2 h-full w-full">用户模块</div>;
};

export default User;
