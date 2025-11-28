import SelectItem from '../SelectItem';
import SwitchItem from '../SwitchItem';

/**
 * 导航菜单
 */
const Navigation: React.FC = () => {
  return (
    <>
      {/* 导航菜单风格 */}
      <SelectItem category="navigation" pKey="styleType" title="导航菜单风格" />
      {/* 导航菜单分离 */}
      <SwitchItem title="导航菜单分离" category="navigation" pKey="split" />
      {/* 侧边导航栏手风琴模式 */}
      <SwitchItem
        title="侧边导航栏手风琴模式"
        category="navigation"
        pKey="accordion"
        disabled={false}
      />
    </>
  );
};
export default Navigation;
