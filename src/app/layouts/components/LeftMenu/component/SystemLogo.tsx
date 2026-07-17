import { Image } from 'antd';
import { Link } from '@tanstack/react-router';
import logo from '@/assets/icon/web/icon-192.png';
import { usePreferencesStore } from '@/shared/stores/preferences.store';

export type SystemLogoVariant = 'full' | 'iconOnly' | 'nameOnly';

interface SystemLogoProps {
  /** full: 图标+系统名；iconOnly: 仅图标（用于双列左侧）；nameOnly: 仅系统名（用于双列右侧列头） */
  variant?: SystemLogoVariant;
}

/**
 * 系统logo - 协调系统主题的卡片风格
 */
const SystemLogo = ({ variant = 'full' }: SystemLogoProps) => {
  const colorPrimary = usePreferencesStore((state) => state.preferences.theme.colorPrimary);

  if (variant === 'nameOnly') {
    return (
      <div className="system-logo-name-only flex items-center toolbox">
        <span className="system-name" style={{ color: colorPrimary }}>
          Syndra
        </span>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center toolbox">
      <Link to="/" style={{ width: '100%' }}>
        <section className={`system-logo-card ${variant === 'iconOnly' ? 'system-logo-card-icon-only' : ''}`}>
          <div className="logo-card-content">
            <div className="logo-container">
              <div className="logo-background">
                <Image width={32} height={32} className="logo-image" src={logo} preview={false} />
              </div>
            </div>
            {variant !== 'iconOnly' && (
              <span className="system-name" style={{ color: colorPrimary }}>
                Syndra
              </span>
            )}
          </div>
        </section>
      </Link>
    </div>
  );
};

export default SystemLogo;
