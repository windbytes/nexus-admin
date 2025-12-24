import { DownOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import type { UseMutationResult } from '@tanstack/react-query';
import type { TableProps } from 'antd';
import { App, Button, Dropdown, Switch } from 'antd';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy16Regular, DeleteDismiss24Filled, UserPlus } from '@/components/icons';
import type { RoleModel, RoleState } from '@/services/system/role/type';

interface RoleTableColumnsProps {
  dispatch: React.Dispatch<Partial<RoleState>>;
  logicDeleteUserMutation: UseMutationResult<any, any, any, unknown>;
  toggleRoleStatusMutation: UseMutationResult<any, any, any, unknown>;
}

/**
 * 角色表格列配置
 * @param props 参数
 * @returns 表格列配置
 */
const getRoleTableColumns = ({
  dispatch,
  logicDeleteUserMutation,
  toggleRoleStatusMutation,
}: RoleTableColumnsProps): TableProps<RoleModel>['columns'] => {
  const { modal, message } = App.useApp();
  const { t } = useTranslation();
  // 更多操作
  const more = useCallback(
    (row: RoleModel) => [
      {
        key: 'assign',
        label: '分配用户',
        icon: <UserPlus className="text-sm! block" />,
        onClick: () => {
          dispatch({
            openEditModal: false,
            currentRow: row,
            action: 'user',
            openRoleUserModal: true,
          });
        },
      },
      {
        key: 'delete',
        label: '删除',
        icon: <DeleteDismiss24Filled className="text-sm! block text-(--ant-color-error)" />,
        onClick: () => {
          modal.confirm({
            title: '删除角色',
            icon: <ExclamationCircleFilled />,
            content: '确定删除该角色吗？数据删除后将无法恢复！',
            onOk() {
              logicDeleteUserMutation.mutate([row.id]);
            },
          });
        },
      },
      {
        key: 'copy',
        label: '复制',
        icon: <Copy16Regular className="text-sm! block text-(--ant-blue-4)" />,
        onClick: () => {
          message.warning('复制功能暂未实现');
        },
      },
    ],
    []
  );

  /**
   * 表格列配置
   */
  const columns: TableProps<RoleModel>['columns'] = [
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
            value={value}
            onChange={(checked) => {
              toggleRoleStatusMutation.mutate({
                id: record['id'],
                status: checked,
              });
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
      fixed: 'right',
      align: 'center',
      render(_, record) {
        return (
          <div>
            <Button
              size="small"
              type="link"
              onClick={() => {
                dispatch({
                  openEditModal: true,
                  currentRow: record,
                  action: 'edit',
                });
              }}
            >
              {t('common.operation.edit')}
            </Button>
            {/* <Tooltip title="授权菜单">
              <Button
                type="text"
                icon={
                  <Icon icon="arcticons:ente-authenticator" style={{ color: colorSuccess }} className="text-xl block" />
                }
                onClick={() => {
                  dispatch({
                    openEditModal: false,
                    currentRow: record,
                    action: 'auth',
                    openRoleMenuModal: true,
                  });
                }}
              />
            </Tooltip> */}
            <Dropdown menu={{ items: more(record) }} placement="bottom" trigger={['hover']}>
              <Button size="small" type="link" icon={<DownOutlined />} iconPlacement="end">
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

export default getRoleTableColumns;
