import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  MoreOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { App, Button, Dropdown, type MenuProps, Switch, type TableProps, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { MyIcon } from '@/components/MyIcon';
import { TABLE_ACTION_CELL_CLASSNAME, TABLE_ACTION_COLUMN_WIDTH } from '@/constants/table';
import type { RoleModel } from '@/services/system/role/type';
import { useUserStore } from '@/stores/userStore';
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
  const { canDeleteRole, canAssignMenu, canAssignUser, canAssignPermission, canEditRole } = useRolePermissions();
  // 授权资源、授权权限共用同一权限点
  const canAssignResource = canAssignPermission;
  const { t } = useTranslation();
  // 操作hooks
  const { updateRoleStatus, deleteRoles } = useRoleActions({ currentRow, onSuccess });
  // 获取当前登录的角色
  const { roleCode } = useUserStore();

  // 更多操作菜单项：授权用户、授权菜单、授权资源、授权权限、复制、删除
  const moreActionItems = (record: RoleModel): MenuProps['items'] => {
    return [
      {
        key: 'assignUser',
        label: '授权用户',
        icon: <UserAddOutlined className="text-sm! block" />,
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
        label: '授权菜单',
        icon: <MyIcon type="syndra-assigned" className="text-sm! block" />,
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
        key: 'assignResource',
        label: '授权资源',
        icon: <MyIcon type="syndra-permission-assign" className="text-sm! block" />,
        disabled: !canAssignResource,
        onClick: () => {
          if (!canAssignResource) {
            modal.error({
              title: '权限不足',
              content: '您没有授权资源的权限，请联系管理员获取相应权限。',
            });
            return;
          }
          openModal('assignResource', record);
        },
      },
      {
        key: 'assignPermission',
        label: '授权权限',
        icon: <MyIcon type="syndra-permission-assign" className="text-sm! block" />,
        disabled: !canAssignPermission,
        onClick: () => {
          if (!canAssignPermission) {
            modal.error({
              title: '权限不足',
              content: '您没有授权权限的权限，请联系管理员获取相应权限。',
            });
            return;
          }
          openModal('assignPermission', record);
        },
      },
      {
        key: 'copy',
        label: '复制',
        icon: <CopyOutlined className="text-sm! block text-(--ant-blue-4)" />,
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
        icon: <DeleteOutlined className="text-sm! block text-(--ant-color-error)!" />,
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
      width: 130,
      dataIndex: 'roleName',
      key: 'roleName',
    },
    {
      title: '类型',
      width: 100,
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
            checked={value}
            disabled={!canEditRole}
            onChange={(checked) => {
              updateRoleStatus(record.id, checked);
            }}
          />
        );
      },
    },
    {
      title: '角色权限范围',
      width: 120,
      dataIndex: 'dataScope',
      key: 'dataScope',
    },
    {
      title: '角色等级',
      width: 80,
      dataIndex: 'roleLevel',
      key: 'roleLevel',
      align: 'center',
      render(value) {
        if (!value) {
          return (
            <Tag variant="solid" color="green">
              {value}
            </Tag>
          );
        }
        return (
          <Tag variant="solid" color="red">
            {value}
          </Tag>
        );
      },
    },
    {
      title: '内置角色',
      width: 60,
      dataIndex: 'isBuiltin',
      align: 'center',
      key: 'isBuiltin',
      render(value) {
        if (!value) {
          return (
            <Tag variant="solid" color="green">
              否
            </Tag>
          );
        }
        return (
          <Tag variant="solid" color="red">
            是
          </Tag>
        );
      },
    },
    {
      title: '描述',
      width: 120,
      dataIndex: 'remark',
      key: 'remark',
      render(value) {
        if (!value) {
          return '-';
        }
        return value;
      },
    },
    {
      title: '操作',
      width: TABLE_ACTION_COLUMN_WIDTH,
      dataIndex: 'action',
      fixed: 'end',
      align: 'center',
      render(_, record: RoleModel) {
        if (roleCode !== record.roleCode && record.isBuiltIn) {
          return null;
        }
        return (
          <div className={TABLE_ACTION_CELL_CLASSNAME}>
            <Button
              size="small"
              type="link"
              disabled={!canEditRole}
              icon={<EditOutlined className="text-(--ant-color-primary)!" />}
              classNames={{ content: 'text-(--ant-color-primary)' }}
              onClick={() => openModal('edit', record)}
            >
              {t('common.operation.edit')}
            </Button>
            <Dropdown menu={{ items: moreActionItems(record) ?? [] }} placement="bottom" trigger={['hover']}>
              <Button
                size="small"
                type="link"
                classNames={{ content: 'text-(--ant-color-primary)' }}
                icon={<MoreOutlined className="text-(--ant-color-primary)!" />}
              >
                {t('common.operation.more')}
              </Button>
            </Dropdown>
          </div>
        );
      },
    },
  ];

  return columns;
};
