import {
  FileMarkdownOutlined,
  InfoCircleOutlined,
  LockOutlined,
  LogoutOutlined,
  QuestionCircleFilled,
  SyncOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Dropdown, type MenuProps } from 'antd';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import avatar from '@/assets/images/avatar.png';
import { useLogout } from '@/hooks/useLogout';
import { usePreferencesStore } from '@/stores/store';
import { useUserStore } from '@/stores/userStore';

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
    }))
  );
  const { t } = useTranslation();

  const handleLogout = useLogout();

  // 菜单栏
  const items: MenuProps['items'] = [
    {
      key: 'avatar',
      label: (
        <div className="avatar flex items-center">
          <Avatar size="large" src={avatar} />
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
      onClick: handleLogout,
    },
  ];
  return (
    <Dropdown
      trigger={['hover']}
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
