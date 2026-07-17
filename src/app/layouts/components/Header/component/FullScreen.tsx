import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { message, Tooltip } from 'antd';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 全屏展示组件
 * @returns 组件内容
 */
const FullScreen: React.FC = () => {
  const { t } = useTranslation();
  const [fullScreen, setFullScreen] = useState<boolean>(!!document.fullscreenElement);

  useEffect(() => {
    const onChange = () => setFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const handleFullScreen = () => {
    if (!document.fullscreenEnabled) {
      message.warning('当前您的浏览器不支持全屏');
      return;
    }
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <Tooltip title={t('layout.header.fullScreen')} placement="bottom">
      {fullScreen ? (
        <FullscreenExitOutlined className="text-[18px] cursor-pointer" onClick={handleFullScreen} />
      ) : (
        <FullscreenOutlined className="text-[18px] cursor-pointer" onClick={handleFullScreen} />
      )}
    </Tooltip>
  );
};
export default FullScreen;
