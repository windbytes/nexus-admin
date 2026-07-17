import { Tooltip } from 'antd';
import { t } from 'i18next';
import FullContent from '../icons/FullContent';
import HeaderMixedNav from '../icons/HeaderMixedNav';
import HeaderNav from '../icons/HeaderNav';
import HeaderSidebarNav from '../icons/HeaderSidebarNav';
import MixedNav from '../icons/MixedNav';
import SidebarMixedNav from '../icons/SidebarMixedNav';
import SidebarNav from '../icons/SidebarNav';
import '../Theme/theme.css';
import './layout.css';
import { QuestionCircleOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import { useShallow } from 'zustand/shallow';
import { usePreferencesStore } from '@/shared/stores/preferences.store';

// 定义组件组
const components: Record<string, React.FC> = {
  'full-content': FullContent,
  'header-nav': HeaderNav,
  'mixed-nav': MixedNav,
  'sidebar-mixed-nav': SidebarMixedNav,
  'sidebar-nav': SidebarNav,
  'header-mixed-nav': HeaderMixedNav,
  'header-sidebar-nav': HeaderSidebarNav,
};

// 预设的布局
const PRESET = [
  {
    name: t('preferences.vertical'),
    tip: t('preferences.verticalTip'),
    type: 'sidebar-nav',
  },
  {
    name: t('preferences.twoColumn'),
    tip: t('preferences.twoColumnTip'),
    type: 'sidebar-mixed-nav',
  },
  {
    name: t('preferences.horizontal'),
    tip: t('preferences.horizontalTip'),
    type: 'header-nav',
  },
];
/**
 * 布局模块
 */
const MyLayout: React.FC = () => {
  const { layout, updatePreferences } = usePreferencesStore(
    useShallow((state) => ({
      layout: state.preferences.app.layout,
      updatePreferences: state.updatePreferences,
    }))
  );
  return (
    <div className="flex flex-wrap w-full gap-5">
      {PRESET.map((item) => (
        <div
          key={item.name}
          className="flex flex-col cursor-pointer w-[100px]"
          onClick={() => {
            updatePreferences('app', 'layout', item.type);
          }}
        >
          <div
            className={clsx('outline-box items-center flex justify-center', {
              'outline-box-active': layout === item.type,
            })}
          >
            {(() => {
              const Comp = components[item.type]!;
              return <Comp />;
            })()}
          </div>
          <div className="layoutTitle">
            {item.name}
            {item.tip && (
              <Tooltip title={item.tip}>
                <QuestionCircleOutlined className="text-xs! ml-1" />
              </Tooltip>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
export default MyLayout;
