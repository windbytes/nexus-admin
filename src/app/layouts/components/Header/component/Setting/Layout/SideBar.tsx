import NumberItem from '../NumberItem';
import SwitchItem from '../SwitchItem';

/**
 * 侧边栏
 */
const SideBar: React.FC = () => {
  return (
    <>
      {/* 显示侧边栏 */}
      <SwitchItem title="显示侧边栏" category="sidebar" pKey="enable" />
      {/* 折叠菜单 */}
      <SwitchItem title="折叠菜单" category="sidebar" pKey="collapse" />
      {/* 鼠标悬停展开 */}
      <SwitchItem title="鼠标悬停展开" category="sidebar" pKey="expandOnHover" />
      {/* 自动激活子菜单 */}
      <SwitchItem title="自动激活子菜单" category="sidebar" pKey="autoActivateChild" />
      {/* 宽度 */}
      <NumberItem title="宽度" category="sidebar" pKey="width" />
    </>
  );
};
export default SideBar;
