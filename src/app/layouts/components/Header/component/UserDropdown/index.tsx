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
import { App, Avatar, Dropdown, type MenuProps, message } from 'antd';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useShallow } from 'zustand/shallow';
import avatar from '@/assets/images/avatar.png';
import { useLogout } from '@/shared/hooks/useLogout';
import { frameworkService } from '@/shared/api/framework/frameworkApi';
import { usePreferencesStore } from '@/shared/stores/preferences.store';
import { useTabStore } from '@/shared/stores/tab.store';
import { useUserStore } from '@/shared/stores/user.store';

/**
 * 用户信息下拉框
 * @returns
 */
const UserDropdown: React.FC = () => {
  const updatePreferences = usePreferencesStore(useShallow((state) => state.updatePreferences));
  const userStore = useUserStore(
    useShallow((state) => ({
      loginUser: state.loginUser,
      loginRoleId: state.roleId,
      isLogin: state.isLogin,
      roleCode: state.roleCode,
      switchRole: state.switchRole,
      clear: state.clear,
      setUserRoles: state.setUserRoles,
    }))
  );
  const navigate = useNavigate();
  const { resetTabs } = useTabStore(
    useShallow((state) => ({
      resetTabs: state.resetTabs,
    }))
  );
  const { modal } = App.useApp();
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const handleLogout = useLogout();

  // 使用 React Query 获取用户角色列表（然后需要更新store中的内容，以应对重新给用户分配了角色后，不用重新登录）
  const {
    data: userRoles = [],
    isLoading: isFetching,
    error: rolesError,
  } = useQuery({
    queryKey: ['dropdwon-user-roles', userStore.loginUser],
    queryFn: async () => {
      const userRoles = await frameworkService.getUserRolesByUserName(userStore.loginUser);
      userStore.setUserRoles(userRoles);
      return userRoles;
    },
    enabled: userStore.isLogin && Boolean(userStore.isLogin),
  });

  // 获取用户基础信息后
  const { data: userInfo } = useQuery({
    queryKey: ['dropdown-user-info', userStore.loginUser, userStore.loginRoleId],
    queryFn: () => frameworkService.getCurrentUserInfo(userStore.loginUser, userStore.loginRoleId),
    enabled: userStore.isLogin && Boolean(userStore.isLogin) && !!userStore.loginRoleId,
  });

  const currentRoleId = userStore.loginRoleId;
  const currentRole = userRoles.find((role) => role.id === currentRoleId);
  const currentRoleInfo = {
    currentRoleId,
    currentRoleName: currentRole?.roleName || userStore.roleCode || '未选择角色',
    hasRoles: userRoles.length > 0,
  };

  // 角色切换的 mutation
  const roleSwitchMutation = useMutation({
    mutationFn: async (roleId: string) => {
      // 更新当前角色调用整体刷新后，App.tsx中会处理重新加载菜单
      userStore.switchRole(roleId);
      return roleId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dropdwon-user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['dropdown-user-info'] });
      queryClient.invalidateQueries({ queryKey: ['menu-list'] });
      resetTabs();
      window.location.reload();
    },
    onError: (error) => {
      message.error(`角色切换失败: ${error.message}`);
    },
  });

  // 角色切换处理：先确认再切换并整体刷新
  const handleRoleSwitch = (roleId: string) => {
    modal.confirm({
      title: '切换角色',
      icon: <ExclamationCircleOutlined />,
      content: '切换角色后，系统将整体刷新以加载新角色权限与菜单，是否继续？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        roleSwitchMutation.mutate(roleId);
      },
    });
  };

  // 菜单栏
  const items: MenuProps['items'] = [
    {
      key: 'avatar',
      label: (
        <div className="avatar flex items-center">
          <Avatar size="large" src={avatar} />
          <div className="flex flex-col flex-1 shrink-0 ml-2">
            <span className="block text-sm font-medium truncate">
              {userInfo?.realName} - {userInfo?.roleName}
            </span>
            <span className="block mt-0.5 text-xs text-gray-500 truncate">{userInfo?.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'divider',
      type: 'divider',
    },
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
      disabled: isFetching || !currentRoleInfo.hasRoles || roleSwitchMutation.isPending,
      popupStyle: {
        width: 220,
      },
      popupOffset: [2, 8],
      children: [
        // 加载状态
        ...(isFetching
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
        // 清除本地的登录信息
        modal.confirm({
          title: t('layout.header.userDropdown.refresh'),
          icon: <ExclamationCircleOutlined />,
          content: '清除本地缓存的信息后，需要用户重新登录，是否继续？',
          onOk: async () => {
            // 清理角色相关的缓存
            queryClient.removeQueries({ queryKey: ['user-roles'] });
            // 清理菜单缓存
            queryClient.removeQueries({ queryKey: ['menu-list'] });
            // 清理用户信息
            userStore.clear();
            // 修改回document.title
            document.title = 'syndra';
            // 跳转登录界面
            navigate({ to: '/login', replace: true });
          },
        });
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
      onClick: handleLogout,
    },
  ];
  return (
    <Dropdown
      trigger={['click', 'hover']}
      menu={{ items, triggerSubMenuAction: 'hover' }}
      placement="bottomLeft"
      classNames={{
        root: 'w-[240px]',
      }}
    >
      <div className="login-user flex items-center cursor-pointer justify-between h-[50] transition-all duration-300">
        <Avatar size="default" src={avatar} />
        <span className="m-0 ml-1.5">{userStore.loginUser}</span>
      </div>
    </Dropdown>
  );
};

export default UserDropdown;
