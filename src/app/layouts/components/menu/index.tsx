import { EllipsisOutlined } from '@ant-design/icons';
import { Menu, type MenuProps } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useShallow } from 'zustand/shallow';
import { buildMenuItems, type MenuItem, resolveMenuSelection } from '@/app/layouts/components/LeftMenu/component/menu-utils';
import { useMenuStore, usePreferencesStore } from '@/shared/stores/preferences.store';
import { searchRoute } from '@/shared/utils/utils';

interface LayoutMenuProps {
  className?: string;
  mode?: 'horizontal' | 'inline';
  theme?: 'light' | 'dark';
}

/**
 * 布局菜单：用于 Header 横向展示或侧边栏内联展示
 * - 横向模式：菜单在顶部水平排列，超出部分自动折叠到「更多」下拉
 * - 内联模式：菜单在侧边栏垂直展开
 */
const LayoutMenu: React.FC<LayoutMenuProps> = ({ className, mode = 'horizontal', theme = 'light' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { menus, caches } = useMenuStore(
    useShallow((state) => ({
      menus: state.menus,
      caches: state.caches,
    }))
  );
  const { dynamicTitle } = usePreferencesStore(
    useShallow((state) => ({
      dynamicTitle: state.preferences.app.dynamicTitle,
    }))
  );

  const menuList = menus?.length ? buildMenuItems(menus, t) : [];

  /** 选中项：根据当前路由高亮；横向模式下不传 openKeys，避免子菜单常开导致其他菜单无法点击 */
  const { selectedKeys, openKeys } = (() => {
    if (!caches?.pathMap?.size) {
      return { selectedKeys: [] as string[], openKeys: [] as string[] };
    }
    const { selectedPath, openKeys: keys } = resolveMenuSelection(pathname, caches);
    return {
      selectedKeys: selectedPath ? [selectedPath] : [],
      openKeys: keys ?? [],
    };
  })();

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate({ to: key, replace: true });
  };

  const menuProps: MenuProps = {
    mode,
    theme,
    selectedKeys,
    items: menuList,
    onClick: onMenuClick,
    overflowedIndicator: <EllipsisOutlined />,
    className: 'border-none! flex-1 min-w-0',
    ...(mode === 'inline' ? { openKeys } : {}),
  };

  useEffect(() => {
    const route = searchRoute(pathname, menus);
    if (route?.meta?.title && dynamicTitle) {
      document.title = `Syndra - ${t(route.meta.title)}`;
    }
  }, [pathname, menus, dynamicTitle, t]);

  return (
    <div className={`flex-1 h-full min-w-0 overflow-hidden flex items-center ${className ?? ''}`}>
      <Menu
        {...menuProps}
        styles={{
          root: {
            lineHeight: 'var(--ant-menu-horizontal-line-height)',
          },
        }}
      />
    </div>
  );
};

export default LayoutMenu;
