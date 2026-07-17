import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useShallow } from 'zustand/shallow';
import { commonService } from '@/shared/api/common';
import { useTabStore } from '@/shared/stores/tab.store';
import { useUserStore } from '@/shared/stores/user.store';

/**
 * 退出登录 Hook
 * 封装退出登录的所有逻辑，包括确认对话框、清理状态、导航等
 * @returns 退出登录的处理函数
 */
export const useLogout = () => {
  const { resetTabs } = useTabStore(
    useShallow((state) => ({
      resetTabs: state.resetTabs,
    }))
  );

  const { logout: userLogout } = useUserStore(
    useShallow((state) => ({
      logout: state.logout,
    }))
  );

  const { modal } = App.useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const handleLogout = () => {
    modal.confirm({
      title: t('layout.header.userDropdown.logout'),
      icon: <ExclamationCircleOutlined />,
      content: t('login.confirmLogout'),
      onOk: async () => {
        try {
          // 统一包装体成功时 data 常为 null，不能依赖 truthy 判断
          await commonService.logout();
        } catch {
          // 服务端登出失败时仍清理本地状态，避免无法离开已失效会话
        }
        resetTabs();
        queryClient.removeQueries({ queryKey: ['user-roles'] });
        userLogout();
        document.title = 'syndra';
        navigate({ to: '/login', replace: true });
      },
    });
  };

  return handleLogout;
};
