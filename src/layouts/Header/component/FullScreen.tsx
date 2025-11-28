import type React from 'react';
import { useEffect, useState } from 'react';
import screenfull from 'screenfull';
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { Tooltip, message } from 'antd';
import { useTranslation } from 'react-i18next';

/**
 * 全屏展示组件
 * @returns 组件内容
 */
const FullScreen: React.FC = () => {
  const { t } = useTranslation();
  /**
   * 全屏展示
   */
  const [fullScreen, setFullScreen] = useState<boolean>(
    screenfull.isFullscreen,
  );
  useEffect(() => {
    screenfull.on('change', () => {
      if (screenfull.isFullscreen) setFullScreen(true);
      else setFullScreen(false);
      return () => screenfull.off('change', () => {});
    });
  }, []);

  const handleFullScreen = () => {
    if (!screenfull.isEnabled) message.warning('当前您的浏览器不支持全屏 ❌');
    screenfull.toggle();
  };

  return (
    <Tooltip title={t('layout.header.fullScreen')} placement="bottom">
        {fullScreen ? (
          <FullscreenExitOutlined
            className="text-[18px] cursor-pointer"
          onClick={handleFullScreen}
        />
      ) : (
        <FullscreenOutlined className="text-[18px] cursor-pointer" onClick={handleFullScreen} />
      )}
    </Tooltip>
  );
};
export default FullScreen;
