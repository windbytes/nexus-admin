import avatar from '@/assets/images/avatar.png';
import { commonService } from '@/services/common';
import { frameworkService } from '@/services/framework/frameworkApi';
import { usePreferencesStore } from '@/stores/store';
import { useTabStore } from '@/stores/tabStore';
import { useUserStore } from '@/stores/userStore';
import {
  ExclamationCircleOutlined,
  FileMarkdownOutlined,
  InfoCircleOutlined,
  LockOutlined,
  LogoutOutlined,
  QuestionCircleFilled,
  SyncOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { App, Avatar, Divider, Dropdown, type MenuProps, message, theme } from 'antd';
import type React from 'react';
import { memo, type ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

/**
 * 用户信息下拉框
 * @returns
 */
const UserDropdown: React.FC = () => {
  const updatePreferences = usePreferencesStore(useShallow((state) => state.updatePreferences));
  const userStore = useUserStore(
    useShallow((state) => ({
      loginUser: state.loginUser,
      isLogin: state.isLogin,
      currentRoleId: state.currentRoleId,
      roleCode: state.roleCode,
      switchRole: state.switchRole,
      logout: state.logout,
    }))
  );
  const { resetTabs } = useTabStore(
    useShallow((state) => ({
      resetTabs: state.resetTabs,
    }))
  );
  const { token } = theme.useToken();
  const { modal } = App.useApp();
  const { t } = useTranslation();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 使用 React Query 获取用户角色列表
  const {
    data: userRoles = [],
    isLoading: loading,
    error: rolesError,
  } = useQuery({
    queryKey: ['user-roles', userStore.loginUser],
    queryFn: () => frameworkService.getUserRolesByUserName(userStore.loginUser),
    enabled: userStore.isLogin && Boolean(userStore.loginUser),
  });

  // 使用 useMemo 计算当前角色信息，避免无限循环
  const currentRoleInfo = useMemo(() => {
    const currentRoleId = userStore.currentRoleId;
    const currentRole = userRoles.find((role) => role.id === currentRoleId);
    return {
      currentRoleId,
      currentRoleName: currentRole?.roleName || userStore.roleCode || '未选择角色',
      hasRoles: userRoles.length > 0,
    };
  }, [userRoles, userStore.currentRoleId, userStore.roleCode]);

  // 角色切换的 mutation
  const roleSwitchMutation = useMutation({
    mutationFn: async (roleId: string) => {
      // 更新当前角色
      userStore.switchRole(roleId);

      // 重新获取菜单数据（为后续菜单重新加载做准备）
      await commonService.getMenuListByRoleId(roleId);

      return roleId;
    },
    onSuccess: () => {
      // 清空当前标签页
      resetTabs();

      // 显示成功消息
      message.success('角色切换成功，页面将刷新');

      // 延迟刷新页面，让用户看到成功消息
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error) => {
      console.error('角色切换失败:', error);
      message.error('角色切换失败');
    },
  });

  // 角色切换处理
  const handleRoleSwitch = (roleId: string) => {
    roleSwitchMutation.mutate(roleId);
  };

  // 菜单栏
  const items: MenuProps['items'] = [
    {
      key: 'doc',
      label: t('layout.header.userDropdown.doc'),
      icon: <FileMarkdownOutlined />,
    },
    {
      key: '1',
      label: t('layout.header.userDropdown.profile'),
      icon: <UserOutlined />,
      disabled: false,
      onClick: () => {
        // 个人中心做成一个弹窗，内部可以修改
      },
    },
    {
      key: 'switchRole',
      label: (
        <div className="flex items-center justify-between">
          <span>{t('layout.header.userDropdown.switchRole')}</span>
          <span className="text-xs text-gray-500">{currentRoleInfo.currentRoleName}</span>
        </div>
      ),
      icon: <UserOutlined />,
      disabled: loading || !currentRoleInfo.hasRoles || roleSwitchMutation.isPending,
      popupStyle: {
        width: 220,
      },
      popupOffset: [2, 8],
      children: [
        // 加载状态
        ...(loading
          ? [
              {
                key: 'loading',
                label: '加载中...',
                icon: <SyncOutlined spin />,
                disabled: true,
              },
            ]
          : []),
        // 错误状态
        ...(rolesError
          ? [
              {
                key: 'error',
                label: '加载失败，点击重试',
                icon: <ExclamationCircleOutlined />,
                onClick: () => {
                  // 重新获取角色列表
                  queryClient.invalidateQueries({ queryKey: ['user-roles'] });
                },
              },
            ]
          : []),
        // 角色列表
        ...userRoles.map((role) => ({
          key: role.id,
          label: (
            <div className="flex items-center justify-between">
              <span>{role.roleName}</span>
              <div className="flex items-center gap-1">
                {currentRoleInfo.currentRoleId === role.id && <span className="text-xs text-green-500">当前</span>}
                {roleSwitchMutation.isPending && roleSwitchMutation.variables === role.id && (
                  <SyncOutlined spin className="text-xs" />
                )}
              </div>
            </div>
          ),
          icon: <UserOutlined />,
          disabled: roleSwitchMutation.isPending,
          onClick: () => handleRoleSwitch(role.id),
        })),
      ],
    },
    {
      key: 'help',
      label: t('layout.header.userDropdown.support'),
      icon: <QuestionCircleFilled />,
      popupStyle: {
        width: 220,
      },
      popupOffset: [2, 8],
      children: [
        {
          key: 'help1',
          label: t('layout.header.userDropdown.feedback'),
          icon: <QuestionCircleFilled />,
          onClick: () => {
            // 跳转到问题反馈
          },
        },
        {
          key: 'help2',
          label: t('layout.header.userDropdown.question'),
          icon: <QuestionCircleFilled />,
          onClick: () => {
            // 跳转到常见问题
          },
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: 'about',
      label: (
        <div className="flex items-center justify-between">
          <span>{t('layout.header.userDropdown.about')}</span>
          <div className="flex items-center">
            <div className="text-[12px]">0.0.1</div>
            <div className="w-2 h-2 bg-green-400 rounded-sm ml-1" />
          </div>
        </div>
      ),
      icon: <InfoCircleOutlined />,
      onClick: () => {
        // 跳转到关于
      },
    },
    {
      key: '3',
      label: t('layout.header.userDropdown.refresh'),
      icon: <SyncOutlined />,
      onClick: () => {
        // 后端的缓存信息（相当于把缓存数据刷新）
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'lock',
      label: t('layout.header.lock'),
      icon: <LockOutlined />,
      onClick: () => {
        updatePreferences('widget', 'lockScreenStatus', true);
      },
    },
    {
      type: 'divider',
    },
    {
      key: '4',
      label: t('layout.header.userDropdown.logout'),
      icon: <LogoutOutlined />,
      disabled: false,
      danger: true,
      onClick: () => {
        modal.confirm({
          title: t('layout.header.userDropdown.logout'),
          icon: <ExclamationCircleOutlined />,
          content: t('login.confirmLogout'),
          onOk: () => {
            // 清除后端的信息
            commonService.logout().then((res: boolean) => {
              if (res) {
                // 清空所有tab
                resetTabs();
                // 清理角色相关的缓存
                queryClient.removeQueries({ queryKey: ['user-roles'] });
                // 清理用户信息
                userStore.logout();
                // 修改回document.title
                document.title = 'nexus';
                // 退出到登录页面
                navigate({ to: '/login', replace: true });
              }
            });
          },
        });
      },
    },
  ];

  /**
   * 内容样式
   */
  const contentStyle: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowSecondary,
  };

  /**
   * 自定义渲染
   * @param menus 菜单
   * @returns
   */
  const renderDropdown = (menus: ReactNode) => {
    return (
      <div className="dropdownContent" style={contentStyle}>
        <div className="avatar flex items-center p-3">
          <Avatar size="large" src={avatar} />
        </div>
        <Divider style={{ margin: '2px 0' }} />
        {menus}
      </div>
    );
  };

  return (
    <Dropdown
      trigger={['hover']}
      menu={{ items, triggerSubMenuAction: 'hover' }}
      popupRender={renderDropdown}
      placement="bottomLeft"
      styles={{
        root: {
          width: 240,
        }
      }}
    >
      <div className="login-user flex items-center cursor-pointer justify-between h-[50] transition-all duration-300">
        <Avatar size="default" src={avatar} />
        <span style={{ margin: '0 0 0 6px' }}>{userStore.loginUser}</span>
      </div>
    </Dropdown>
  );
};

export default memo(UserDropdown);
