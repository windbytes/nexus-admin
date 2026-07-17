import SwitchItem from '../SwitchItem';

/**
 * 颜色模式
 * @returns
 */
const ColorMode: React.FC = () => {
  return (
    <>
      <SwitchItem title="色弱模式" category="app" pKey="colorWeakMode" />
      <SwitchItem title="灰色模式" category="app" pKey="colorWeakMode" />
    </>
  );
};
export default ColorMode;
