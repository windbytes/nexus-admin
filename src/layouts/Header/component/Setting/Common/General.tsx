import { SUPPORT_LANGUAGES } from '@/enums/constants';
import SelectItem from '../SelectItem';
import SwitchItem from '../SwitchItem';

/**
 * 通用
 * @returns
 */
const General: React.FC = () => {
  return (
    <>
      {/* 语言 */}
      <SelectItem title="语言" category="app" pKey="locale" items={SUPPORT_LANGUAGES} />
      {/* 动态标题 */}
      <SwitchItem title="动态标题" category="app" pKey="dynamicTitle" />
      {/* 水印 */}
      <SwitchItem title="水印" category="app" pKey="watermark" />
      {/* 定时检查更新 */}
      <SwitchItem title="定时检查更新" category="app" pKey="enableCheckUpdates" />
    </>
  );
};
export default General;
