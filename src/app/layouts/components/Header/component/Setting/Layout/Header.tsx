import type { BasicOptions } from '@/types/global';
import SelectItem from '../SelectItem';
import SwitchItem from '../SwitchItem';

// 模式选择
const modeItems: BasicOptions[] = [
  {
    label: 'static',
    value: 'static',
  },
  {
    label: 'fixed',
    value: 'fixed',
  },
  {
    label: 'auto',
    value: 'auto',
  },
  {
    label: 'autoScroll',
    value: 'autoScroll',
  },
];

/**
 * 顶栏
 */
const Header = () => {
  return (
    <>
      {/* 显示顶栏 */}
      <SwitchItem disabled={false} title="显示顶栏" category="header" pKey="enable" />
      {/* 模式 */}
      <SelectItem category="header" pKey="mode" title="模式" items={modeItems} />
      {/* 菜单位置 */}
      <SelectItem category="header" pKey="menuAlign" title="菜单位置" />
    </>
  );
};
export default Header;
