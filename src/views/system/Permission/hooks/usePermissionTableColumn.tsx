import { DownOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { App, Button, Dropdown, type MenuProps, Switch, Tag, type TableProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { DeleteDismiss24Filled } from '@/components/icons';
import type { PermissionModel } from '@/services/system/permission/type';
import { resourceTypeMap } from '../constants';
import { usePermissionActions } from './usePermissionActions';
import type { ModalType } from './usePermissionModals';
import { usePermissionPermissions } from './usePermissionPermissions';

interface UsePermissionTableColumnProps {
  /** 当前操作行的数据 */
  currentRow: Partial<PermissionModel> | null;
  /** 打开弹窗 */
  openModal: (name: ModalType, record?: PermissionModel) => void;
  /** 成功的回调 */
  onSuccess?: () => void;
}

/**
 * 权限点表格列配置hook
 */
export const usePermissionTableColumns = (props: UsePermissionTableColumnProps) => {
  const { modal } = App.useApp();
  const { currentRow, onSuccess, openModal } = props;
  const { canUpdateStatus, canDelete, canEdit } = usePermissionPermissions();
  const { t } = useTranslation();
  const { updateStatus, deletePermissions } = usePermissionActions({ currentRow, onSuccess });

  /**
   * 更多操作菜单项
   */
  const moreActionItems = (record: PermissionModel): MenuProps['items'] => {
    return [
      {
        key: 'delete',
        label: t('common.operation.delete'),
        icon: <DeleteDismiss24Filled className="text-sm! block text-(--ant-color-error)!" />,
        disabled: !canDelete,
        onClick: () => {
          if (!canDelete) {
            modal.error({
              title: '权限不足',
              content: '您没有删除权限点的权限，请联系管理员获取相应权限。',
            });
            return;
          }
          modal.confirm({
            title: '删除权限点',
            icon: <ExclamationCircleFilled />,
            content: `确定删除权限点「${record.permName}」吗？此操作不可恢复！`,
            okButtonProps: {
              danger: true,
              type: 'default',
            },
            cancelButtonProps: {
              type: 'primary',
            },
            onOk() {
              deletePermissions([record.id]);
            },
          });
        },
      },
    ];
  };

  const columns: TableProps<PermissionModel>['columns'] = [
    {
      dataIndex: 'id',
      title: 'ID',
      key: 'id',
      hidden: true,
    },
    {
      dataIndex: 'permCode',
      title: '权限编码',
      key: 'permCode',
      width: 200,
      align: 'left',
      ellipsis: true,
    },
    {
      dataIndex: 'permName',
      title: '权限名称',
      key: 'permName',
      width: 160,
      align: 'left',
    },
    {
      dataIndex: 'resourceType',
      title: '资源类型',
      key: 'resourceType',
      width: 100,
      align: 'center',
      render: (value: number) => {
        const config = resourceTypeMap[value];
        return config ? <Tag color={config.color}>{config.label}</Tag> : '-';
      },
    },
    {
      dataIndex: 'description',
      title: '描述',
      key: 'description',
      width: 200,
      align: 'left',
      ellipsis: true,
      render: (text: string) => <span>{text || '-'}</span>,
    },
    {
      dataIndex: 'sort',
      title: '排序',
      key: 'sort',
      width: 80,
      align: 'center',
      sorter: (a: PermissionModel, b: PermissionModel) => a.sort - b.sort,
    },
    {
      dataIndex: 'status',
      title: '状态',
      key: 'status',
      width: 100,
      align: 'center',
      render: (value: boolean, record: PermissionModel) => {
        return (
          <div className="flex items-center justify-center">
            <Switch
              checked={value}
              checkedChildren="启用"
              unCheckedChildren="停用"
              disabled={!canUpdateStatus}
              onChange={(checked) => {
                updateStatus([record.id], checked);
              }}
              className={value ? 'bg-green-500' : 'bg-gray-400'}
            />
          </div>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      align: 'center',
      sorter: (a: PermissionModel, b: PermissionModel) => a.createTime.localeCompare(b.createTime),
    },
    {
      title: '操作',
      width: 90,
      dataIndex: 'action',
      fixed: 'right',
      align: 'center',
      render: (_, record: PermissionModel) => (
        <>
          <Button
            size="small"
            type="link"
            disabled={!canEdit}
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
              icon={<DownOutlined className="text-(--ant-color-primary)!" />}
              iconPlacement="end"
            >
              {t('common.operation.more')}
            </Button>
          </Dropdown>
        </>
      ),
    },
  ];

  return columns;
};
