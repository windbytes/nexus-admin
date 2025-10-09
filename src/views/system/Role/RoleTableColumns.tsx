import type { TableProps } from 'antd';
import { ExclamationCircleFilled, MoreOutlined } from '@ant-design/icons';
import { Space, Button, Dropdown, App, Tooltip, Switch } from 'antd';
import type { RoleState } from '@/services/system/role/type';
import type { UseMutationResult } from '@tanstack/react-query';
import { Icon } from '@iconify-icon/react/dist/iconify.mjs';
import { usePreferencesStore } from '@/stores/store';
import { useCallback } from 'react';
import { useShallow } from 'zustand/shallow';

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
}: RoleTableColumnsProps): TableProps['columns'] => {
  const { modal, message } = App.useApp();
  const { colorPrimary, colorSuccess } = usePreferencesStore(
    useShallow((state) => ({
      colorPrimary: state.preferences.theme.colorPrimary,
      colorSuccess: state.preferences.theme.colorSuccess,
    })),
  );
  // 更多操作
  const more = useCallback(
    (row: any) => [
      {
        key: 'edit',
        label: '编辑',
        icon: <Icon icon="fluent-color:calendar-edit-16" className="text-xl! block" />,
        onClick: () => {
          dispatch({
            openEditModal: true,
            currentRow: row,
            action: 'edit',
          });
        },
      },
      {
        key: 'delete',
        label: '删除',
        icon: <Icon icon="fluent:delete-dismiss-24-filled" className="text-xl! block text-[#ff4d4f]" />,
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
        icon: <Icon icon="fluent-color:copy-16" className="text-xl! block" />,
        onClick: () => {
          message.warning('复制功能暂未实现');
        },
      },
    ],
    [],
  );

  /**
   * 表格列配置
   */
  const columns: TableProps['columns'] = [
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
                id: record.id,
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
      width: '12%',
      dataIndex: 'action',
      fixed: 'right',
      align: 'center',
      render(_, record) {
        return (
          <Space size={0}>
            <Tooltip title="详情">
              <Button
                type="text"
                icon={<Icon icon="ix:plant-details" style={{ color: colorPrimary }} className="text-xl block" />}
                onClick={() => {
                  dispatch({
                    openEditModal: true,
                    currentRow: record,
                    action: 'view',
                  });
                }}
              />
            </Tooltip>
            <Tooltip title="分配用户">
              <Button
                type="text"
                icon={<Icon icon="la:user-plus" style={{ color: colorPrimary }} className="text-xl block" />}
                onClick={() => {
                  dispatch({
                    openEditModal: false,
                    currentRow: record,
                    action: 'user',
                    openRoleUserModal: true,
                  });
                }}
              />
            </Tooltip>
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
            <Dropdown menu={{ items: more(record) }} placement="bottomRight" trigger={['click']}>
              <Button type="text" icon={<MoreOutlined className="text-xl" />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return columns;
};

export default getRoleTableColumns;
