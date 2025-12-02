import { Link } from '@tanstack/react-router';
import { Image } from 'antd';
import logo from '@/assets/images/icon-192.png';
import { usePreferencesStore } from '@/stores/store';

/**
 * 系统logo - 协调系统主题的卡片风格
 * @returns
 */
const SystemLogo = () => {
  const colorPrimary = usePreferencesStore((state) => state.preferences.theme.colorPrimary);
  return (
    <div className="flex justify-between items-center toolbox">
      <Link to="/" style={{ width: '100%' }}>
        <section className="system-logo-card">
          <div className="logo-card-content">
            <div className="logo-container">
              <div className="logo-background">
                <Image width={32} height={32} className="logo-image" src={logo} preview={false} />
              </div>
            </div>
            <span className="system-name" style={{ color: colorPrimary }}>
              Nexus
            </span>
          </div>
        </section>
      </Link>
    </div>
  );
};

export default SystemLogo;
