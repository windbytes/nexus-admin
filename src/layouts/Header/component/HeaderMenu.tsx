import { useShallow } from 'zustand/shallow';
import { usePreferencesStore } from '@/stores/store';
import LayoutMenu from '../../menu';

/**
 * 顶部菜单
 */
const HeaderMenu = () => {
  const { layout, menuAlign, semiDarkHeader } = usePreferencesStore(
    useShallow((state) => ({
      layout: state.preferences.app.layout,
      menuAlign: state.preferences.header.menuAlign,
      semiDarkHeader: state.preferences.theme.semiDarkHeader,
    }))
  );

  const showHeaderNav = layout === 'header-nav' || layout === 'mixed-nav' || layout === 'header-mixed-nav';

  const themeHeader = semiDarkHeader ? 'dark' : 'light';

  return (
    <div className={`menu-align-${menuAlign} flex h-full min-w-0 flex-1 items-center`}>
      {showHeaderNav && <LayoutMenu className="w-full" mode="horizontal" theme={themeHeader} />}
    </div>
  );
};

export default HeaderMenu;
