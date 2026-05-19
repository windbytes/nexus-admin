import { LoadingOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { App as AntdApp, Spin } from 'antd';
import type React from 'react';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Router } from '@/router';
import { commonService } from '@/services/common';
import { useMenuStore } from '@/stores/store';
import { useUserStore } from '@/stores/userStore';
import type { RouteItem } from '@/types/route';
import { antdUtils } from '@/utils/antdUtil';

/**
 * 主应用
 * 负责菜单数据加载和路由渲染
 */
const App: React.FC = () => {
  const { setMenus, setButtonPermissions } = useMenuStore(
    useShallow((state) => ({
      setMenus: state.setMenus,
      setButtonPermissions: state.setButtonPermissions,
    }))
  );
  const queryClient = useQueryClient();
  const { roleId = '', isLogin } = useUserStore();
  const { notification, message, modal } = AntdApp.useApp();

  // 使用 TanStack Query 获取菜单数据
  const { isFetching, refetch } = useQuery({
    queryKey: ['menuData', roleId],
    queryFn: async () => {
      const menu = await commonService.getMenuListByRoleId(roleId);
      setMenus(menu);
      return menu;
    },
    enabled: false, // 初始不自动执行
  });

  const { isFetching: isFetchingButtonPermissions, refetch: refetchButtonPermissions } = useQuery({
    queryKey: ['buttonPermissions', roleId],
    queryFn: async () => {
      const buttonPermissions = await commonService.getPermissionsByRoleId(roleId);
      setButtonPermissions(buttonPermissions);
      return buttonPermissions;
    },
    enabled: false, // 初始不自动执行
  });

  useEffect(() => {
    // 设置 antd 工具实例
    antdUtils.setMessageInstance(message);
    antdUtils.setNotificationInstance(notification);
    antdUtils.setModalInstance(modal);

    // 如果已登录，加载菜单数据
    if (isLogin && roleId) {
      const cachedMenu = queryClient.getQueryData(['menuData', roleId]);
      if (cachedMenu) {
        setMenus(cachedMenu as RouteItem[]);
      } else {
        refetch();
      }
      const cachedButtonPermissions = queryClient.getQueryData(['buttonPermissions', roleId]);
      if (cachedButtonPermissions) {
        setButtonPermissions(cachedButtonPermissions as string[]);
      } else {
        refetchButtonPermissions();
      }
    }
  }, [isLogin, roleId]);

  return (
    <>
      {isFetching || isFetchingButtonPermissions ? (
        <Spin indicator={<LoadingOutlined width={48} />} size="large" fullscreen />
      ) : (
        <Router />
      )}
    </>
  );
};

export default App;
