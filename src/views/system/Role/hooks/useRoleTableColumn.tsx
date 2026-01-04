import { DownOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { App, Button, Dropdown, type MenuProps, Switch, type TableProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { Copy16Regular, DeleteDismiss24Filled, UserPlus } from '@/components/icons';
import { MyIcon } from '@/components/MyIcon';
import type { RoleModel } from '@/services/system/role/type';
import { useRoleActions } from './useRoleAction';
import type { ModalType } from './useRoleModal';
import { useRolePermissions } from './useRolePermissions';

interface UseRoleTableColumnProps {
  // 当前操作行的数据
  currentRow: Partial<RoleModel> | null;
  openModal: (name: ModalType, record?: RoleModel) => void;
  // 成功的回调
  onSuccess?: () => void;
}

/**
 * @description: 角色表格列配置hook
 */
export const useRoleTableColumns = (props: UseRoleTableColumnProps) => {
  const { modal } = App.useApp();
  const { currentRow, onSuccess, openModal } = props;
  const { canDeleteRole, canAssignMenu, canAssignUser } = useRolePermissions();
  const { t } = useTranslation();
  // 操作hooks
  const { updateRoleStatus, deleteRoles } = useRoleActions({ currentRow, onSuccess });

  // 更多操作菜单项
  const moreActionItems = (record: RoleModel): MenuProps['items'] => {
    return [
      {
        key: 'assignUser',
        label: '分配用户',
        icon: <UserPlus className="text-sm! block" />,
        disabled: !canAssignUser,
        onClick: () => {
          if (!canAssignUser) {
            modal.error({
              title: '权限不足',
              content: '您没有分配用户角色的权限，请联系管理员获取相应权限。',
            });
            return;
          }
          openModal('assignUser', record);
        },
      },
      {
        key: 'assignMenu',
        label: '分配菜单',
        icon: <MyIcon type="nexus-assigned" className="text-sm! block" />,
        disabled: !canAssignMenu,
        onClick: () => {
          if (!canAssignMenu) {
            modal.error({
              title: '权限不足',
              content: '您没有分配菜单权限的权限，请联系管理员获取相应权限。',
            });
            return;
          }
          openModal('assignMenu', record);
        },
      },
      {
        key: 'copy',
        label: '复制',
        icon: <Copy16Regular className="text-sm! block text-(--ant-blue-4)" />,
        onClick: () => {
          modal.warning({
            title: '功能暂未实现',
            content: '复制功能暂未实现',
          });
        },
      },
      {
        key: 'delete',
        label: t('common.operation.delete'),
        icon: <DeleteDismiss24Filled className="text-sm! block text-(--ant-color-error)!" />,
        disabled: !canDeleteRole,
        onClick: () => {
          if (!canDeleteRole) {
            modal.error({
              title: '权限不足',
              content: '您没有删除角色的权限，请联系管理员获取相应权限。',
            });
            return;
          }
          modal.confirm({
            title: '删除角色',
            icon: <ExclamationCircleFilled />,
            content: '确定删除该角色吗？数据删除后将无法恢复！',
            okButtonProps: {
              danger: true,
              type: 'default',
            },
            cancelButtonProps: {
              type: 'primary',
            },
            onOk() {
              deleteRoles([record.id]);
            },
          });
        },
      },
    ];
  };

  const columns: TableProps<RoleModel>['columns'] = [
    {
      dataIndex: 'id',
      title: 'ID',
      key: 'id',
      hidden: true,
    },
    {
      title: '编码',
      width: 80,
      dataIndex: 'roleCode',
      key: 'roleCode',
    },
    {
      title: '名称',
      width: 160,
      dataIndex: 'roleName',
      key: 'roleName',
    },
    {
      title: '类型',
      width: 120,
      dataIndex: 'roleType',
      key: 'roleType',
      align: 'center',
      render(value) {
        switch (value) {
          case 0:
            return '系统角色';
          case 1:
            return '普通角色';
          default:
            return '';
        }
      },
    },
    {
      title: '状态',
      width: 60,
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render(value, record) {
        return (
          <Switch
            size="small"
            checked={value}
            onChange={(checked) => {
              updateRoleStatus(record.id, checked);
            }}
          />
        );
      },
    },
    {
      title: '角色权限范围（访问本人|访问所有数据）',
      width: 160,
      dataIndex: 'dataScope',
      key: 'dataScope',
    },
    {
      title: '描述',
      width: 160,
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '操作',
      width: 90,
      dataIndex: 'action',
      fixed: 'end',
      align: 'center',
      render: (_, record: RoleModel) => (
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
