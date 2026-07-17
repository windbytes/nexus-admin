import SwitchItem from '../SwitchItem';

/**
 * 版权
 * @returns
 */
const CopyRight: React.FC = () => {
  return (
    <>
      {/* 启用版权 */}
      <SwitchItem title="启用版权" category="copyright" pKey="enable" />
    </>
  );
};
export default CopyRight;
