import SwitchItem from '../SwitchItem';

const Animation: React.FC = () => {
  return (
    <>
      {/* 页面切换进度条 */}
      <SwitchItem title="页面切换进度条" category="animation" pKey="enable" />
      {/* 页面切换loading */}
      <SwitchItem title="页面切换loading" category="animation" pKey="loading" />
      {/* 页面切换动画 */}
      <SwitchItem title="页面切换动画" category="animation" pKey="progress" />
    </>
  );
};
export default Animation;
