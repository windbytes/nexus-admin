import { DownOutlined, ExclamationCircleFilled, ManOutlined, WomanOutlined } from '@ant-design/icons';
import { App, Button, Dropdown, type MenuProps, Switch, type TableProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { DeleteDismiss24Filled, History48Regular, PasswordReset48Regular } from '@/components/icons';
import { MyIcon } from '@/components/MyIcon';
import type { UserModel } from '@/services/system/user/type';
import { useUserActions } from './useUserAction';
import type { ModalType } from './useUserModals';
import { useUserPermissions } from './useUserPermissions';

interface UseUserTableColumnProps {
  // 当前操作行的数据
  currentRow: Partial<UserModel> | null;
  openModal: (name: ModalType, record?: UserModel) => void;
  // 成功的回调
  onSuccess?: () => void;
}

/**
 * @description: 用户表格列配置hook
 */
export const useUserTableColumns = (props: UseUserTableColumnProps) => {
  const { modal } = App.useApp();
  const { currentRow, onSuccess, openModal } = props;
  const { canUpdateStatus, canDeleteUser, canUpdatePassword, canViewActionLog, canAssignRole } = useUserPermissions();
  const { t } = useTranslation();
  // 操作hooks
  const { updateUserStatus, deleteUsers } = useUserActions({ currentRow, onSuccess });

  // 更多操作菜单项
  const moreActionItems = (record: UserModel): MenuProps['items'] => {
    return [
      {
        key: 'updatePwd',
        label: '修改密码',
        icon: <PasswordReset48Regular className="text-sm! block text-orange-300" />,
        disabled: !canUpdatePassword,
        onClick: () => {
          if (!canUpdatePassword) {
            modal.error({
              title: '权限不足',
              content: '您没有修改用户密码的权限，请联系管理员获取相应权限。',
            });
            return;
          }
          openModal('password', record);
        },
      },
      {
        key: 'assignRole',
        label: '分配角色',
        icon: <MyIcon type="nexus-assigned" className="text-sm! block" />,
        disabled: !canAssignRole,
        onClick: () => {
          if (!canAssignRole) {
            modal.error({
              title: '权限不足',
              content: '您没有分配用户角色的权限，请联系管理员获取相应权限。',
            });
            return;
          }
          openModal('assignRole', record);
        },
      },
      {
        key: 'operation',
        label: '操作记录',
        icon: <History48Regular className="text-sm! block" />,
        disabled: !canViewActionLog,
        onClick: () => {
          if (!canViewActionLog) {
            modal.error({
              title: '权限不足',
              content: '您没有查看用户操作记录的权限，请联系管理员获取相应权限。',
            });
            return;
          }
          openModal('actionLog', record);
        },
      },
      {
        key: 'delete',
        label: t('common.operation.delete'),
        icon: <DeleteDismiss24Filled className="text-sm! block text-(--ant-color-error)!" />,
        disabled: !canDeleteUser,
        onClick: () => {
          if (!canDeleteUser) {
            modal.error({
              title: '权限不足',
              content: '您没有删除用户的权限，请联系管理员获取相应权限。',
            });
            return;
          }
          modal.confirm({
            title: '删除用户',
            icon: <ExclamationCircleFilled />,
            content: '确定删除该用户吗？数据删除后请在回收站中恢复！',
            okButtonProps: {
              danger: true,
              type: 'default',
            },
            cancelButtonProps: {
              type: 'primary',
            },
            onOk() {
              deleteUsers([record.id]);
            },
          });
        },
      },
    ];
  };

  const columns: TableProps<UserModel>['columns'] = [
    {
      dataIndex: 'id',
      title: 'ID',
      key: 'id',
      hidden: true,
    },
    {
      dataIndex: 'username',
      title: '用户名',
      key: 'username',
      width: 140,
      align: 'left',
    },
    {
      dataIndex: 'realName',
      title: '真实姓名',
      key: 'realName',
      width: 120,
      align: 'left',
      render: (text: string) => <span>{text || '-'}</span>,
    },
    {
      dataIndex: 'sex',
      title: '性别',
      key: 'sex',
      width: 80,
      align: 'center',
      sorter: (a: UserModel, b: UserModel) => a.sex.localeCompare(b.sex),
      render: (text: number) => {
        if (text === 1) {
          return (
            <span>
              <ManOutlined className="text-blue-500! mr-1" />男
            </span>
          );
        } else if (text === 2) {
          return (
            <span>
              <WomanOutlined className="text-pink-500! mr-1" />女
            </span>
          );
        }
        return <span className="text-gray-400">-</span>;
      },
    },
    {
      dataIndex: 'birthday',
      title: '生日',
      key: 'birthday',
      width: 120,
      align: 'center',
      render: (text: string) => {
        if (text) {
          return text;
        }
        return <span className="text-gray-400">--</span>;
      },
    },
    {
      dataIndex: 'email',
      title: '邮箱',
      key: 'email',
      width: 120,
      align: 'center',
    },
    {
      dataIndex: 'status',
      title: '状态',
      key: 'status',
      width: 100,
      align: 'center',
      render: (text: number, record: UserModel) => {
        const isActive = text === 1;

        return (
          <div className="flex items-center justify-center">
            <Switch
              checked={isActive}
              checkedChildren="启用"
              unCheckedChildren="禁用"
              disabled={!canUpdateStatus}
              onChange={(checked) => {
                updateUserStatus([record.id], checked ? 1 : 0);
              }}
              className={isActive ? 'bg-green-500' : 'bg-gray-400'}
            />
          </div>
        );
      },
    },
    {
      title: '创建日期',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 120,
      align: 'center',
      sorter: (a: UserModel, b: UserModel) => a.createTime.localeCompare(b.createTime),
    },
    {
      title: '操作',
      width: 90,
      dataIndex: 'action',
      fixed: 'right',
      align: 'center',
      render: (_, record: UserModel) => (
        <>
          <Button size="small" type="link" onClick={() => openModal('edit', record)}>
            {t('common.operation.edit')}
          </Button>
          <Dropdown menu={{ items: moreActionItems(record) ?? [] }} placement="bottom" trigger={['hover']}>
            <Button size="small" type="link" icon={<DownOutlined />} iconPlacement="end">
              {t('common.operation.more')}
            </Button>
          </Dropdown>
        </>
      ),
    },
  ];

  return columns;
};
