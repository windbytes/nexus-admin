import { Button, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import IconMinimap from '../assets/icon-minimap';

/**
 * 切换缩略图是否可见
 * @returns
 */
const MinimapSwitch: React.FC<MinimapSwitchProps> = ({ minimapVisible, setMinimapVisible }) => {
  const { t } = useTranslation();

  return (
    <Tooltip title={t('workflow.tools.minimapWitch')}>
      <Button
        type="text"
        icon={<IconMinimap style={{ color: minimapVisible ? undefined : '#060709cc' }} />}
        onClick={() => setMinimapVisible(!minimapVisible)}
      />
    </Tooltip>
  );
};
export default MinimapSwitch;

type MinimapSwitchProps = {
  minimapVisible: boolean;
  setMinimapVisible: (minimapVisible: boolean) => void;
};
