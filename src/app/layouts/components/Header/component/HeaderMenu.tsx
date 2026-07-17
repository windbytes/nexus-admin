import { useShallow } from 'zustand/shallow';
import { usePreferencesStore } from '@/shared/stores/preferences.store';
import LayoutMenu from '../../menu';

/** 水平布局：菜单在 Header 中横向展示，无侧边栏 */
const HORIZONTAL_LAYOUT = 'header-nav';

/**
 * 顶部菜单：仅在 header-nav / mixed-nav / header-mixed-nav 布局下显示
 * - header-nav：纯水平布局，菜单占满左侧剩余空间，超出自动折叠
 */
const HeaderMenu = () => {
  const { layout, menuAlign, semiDarkHeader } = usePreferencesStore(
    useShallow((state) => ({
      layout: state.preferences.app.layout,
      menuAlign: state.preferences.header.menuAlign,
      semiDarkHeader: state.preferences.theme.semiDarkHeader,
    }))
  );

  const showHeaderNav = layout === HORIZONTAL_LAYOUT || layout === 'mixed-nav' || layout === 'header-mixed-nav';
  const themeHeader = semiDarkHeader ? 'dark' : 'light';

  return (
    <div className={`menu-align-${menuAlign} flex h-full min-w-0 flex-1 items-center`}>
      {showHeaderNav && <LayoutMenu mode="horizontal" theme={themeHeader} />}
    </div>
  );
};

export default HeaderMenu;
