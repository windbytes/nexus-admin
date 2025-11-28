import SelectItem from '../SelectItem';
import SwitchItem from '../SwitchItem';

/**
 * 标签栏
 */
const TabBar: React.FC = () => {
  return (
    <>
      {/* 启用标签栏 */}
      <SwitchItem title="启用标签栏" category="tabbar" pKey="enable" disabled={false} />
      {/* 持久化标签 */}
      <SwitchItem title="持久化标签" category="tabbar" pKey="persistent" />
      {/* 启动拖拽排序 */}
      <SwitchItem title="启动拖拽排序" category="tabbar" pKey="draggable" />
      {/* 启用纵向滚轮响应 */}
      <SwitchItem title="启用纵向滚轮响应" category="tabbar" pKey="scrollable" />
      {/* 显示标签栏图标 */}
      <SwitchItem title="显示标签栏图标" category="tabbar" pKey="showIcon" />
      {/* 显示更多按钮 */}
      <SwitchItem title="显示更多按钮" category="tabbar" pKey="showMore" />
      {/* 显示最大化按钮 */}
      <SwitchItem title="显示最大化按钮" category="tabbar" pKey="showMaximize" />
      {/* 标签页风格 */}
      <SelectItem category="tabbar" pKey="styleType" title="标签页风格" />
    </>
  );
};
export default TabBar;
