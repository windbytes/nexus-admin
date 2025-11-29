import SelectItem from '../SelectItem';
import SwitchItem from '../SwitchItem';

/**
 * 面包屑
 */
const Breadcrumb: React.FC = () => {
  // 从全局状态获取面包屑配置
  return (
    <>
      {/* 开启面包屑导航 */}
      <SwitchItem title="开启面包屑导航" category="breadcrumb" pKey="enable" />
      {/* 仅有一个时隐藏 */}
      <SwitchItem
        title="仅有一个时隐藏"
        category="breadcrumb"
        pKey="hideOnlyOne"
      />
      {/* 显示面包屑图标 */}
      <SwitchItem title="显示面包屑图标" category="breadcrumb" pKey="showIcon" />
      {/* 显示首页按钮 */}
      <SwitchItem title="显示首页按钮" category="breadcrumb" pKey="showHome" />
      {/* 面包屑风格 */}
      <SelectItem category="breadcrumb" pKey="styleType" title="面包屑风格" />
    </>
  );
};
export default Breadcrumb;
