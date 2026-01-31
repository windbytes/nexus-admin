import SwitchItem from '../SwitchItem';

/**
 * 底部
 * @returns
 */
const Footer: React.FC = () => {
  return (
    <>
      {/* 显示底栏 */}
      <SwitchItem title="显示底栏" category="footer" pKey="enable" disabled={false} />
      {/* 固定在底部 */}
      <SwitchItem title="固定在底部" category="footer" pKey="fixed" />
    </>
  );
};
export default Footer;
