import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import { commonService } from '@/services/common';
import { useTabStore } from '@/stores/tabStore';
import { useUserStore } from '@/stores/userStore';

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
        // 清除后端的信息
        const res = await commonService.logout();
        if (res) {
          // 清空所有tab
          resetTabs();
          // 清理角色相关的缓存
          queryClient.removeQueries({ queryKey: ['user-roles'] });
          // 清理用户信息
          userLogout();
          // 修改回document.title
          document.title = 'syndra';
          // 退出到登录页面
          navigate({ to: '/login', replace: true });
        }
      },
    });
  };

  return handleLogout;
};
