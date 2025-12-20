import type React from 'react';
import { ArrowDown, ArrowUp, Backspace, Enter, KeyboardEsc } from '@/components/icons';

/**
 * 搜索菜单模态框底部组件
 * @returns 搜索菜单模态框底部组件
 */
const Footer: React.FC = () => {
  return (
    <div className="flex gap-x-2 flex-row items-center justify-end">
      <div className="flex w-full justify-start text-xs">
        <div className="mr-2 flex items-center">
          <Enter className="text-xl" />
          <span className="ml-1">选择并跳转</span>
        </div>
        <div className="mr-2 flex items-center">
          <ArrowUp className="text-xl" />
          <ArrowDown className="text-xl" />
          <span className="ml-1">导航选择</span>
        </div>
        <div className="mr-2 flex items-center">
          <KeyboardEsc className="text-xl" />
          <span className="ml-1">关闭</span>
        </div>
        <div className="flex items-center">
          <Backspace className="text-xl" />
          <span className="ml-1">清空输入</span>
        </div>
      </div>
    </div>
  );
};
export default Footer;
