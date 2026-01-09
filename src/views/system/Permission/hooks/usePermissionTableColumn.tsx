import { ExclamationCircleFilled } from '@ant-design/icons';
import { App, Button, Switch, type TableProps } from 'antd';
import { useTranslation } from 'react-i18next';
import type { PermissionModel } from '@/services/system/permission/type';
import { usePermissionActions } from './usePermissionActions';
import type { ModalType } from './usePermissionModals';
import { usePermissionPermissions } from './usePermissionPermissions';

interface UsePermissionTableColumnProps {
  // 当前操作行的数据
  currentRow: Partial<PermissionModel> | null;
  openModal: (name: ModalType, record?: PermissionModel) => void;
  // 成功的回调
  onSuccess?: () => void;
}

/**
 * @description: 权限点表格列配置hook
 */
export const usePermissionTableColumns = (props: UsePermissionTableColumnProps) => {
  const { modal } = App.useApp();
  const { currentRow, onSuccess, openModal } = props;
  const { canUpdateStatus, canDelete, canEdit } = usePermissionPermissions();
  const { t } = useTranslation();
  // 操作hooks
  const { updatePermissionStatus, deletePermission } = usePermissionActions({ currentRow, onSuccess });

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
      width: 180,
      align: 'left',
    },
    {
      dataIndex: 'permName',
      title: '权限名称',
      key: 'permName',
      width: 200,
      align: 'left',
    },
    {
      dataIndex: 'permType',
      title: '权限类型',
      key: 'permType',
      width: 120,
      align: 'center',
      render: (text: string) => {
        if (text === 'ACTION') {
          return <span className="text-blue-500">操作权限</span>;
        } else if (text === 'DATA') {
          return <span className="text-green-500">数据权限</span>;
        }
        return <span className="text-gray-400">-</span>;
      },
    },
    {
      dataIndex: 'moduleCode',
      title: '模块编码',
      key: 'moduleCode',
      width: 150,
      align: 'center',
      render: (text: string) => <span>{text || '-'}</span>,
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
      dataIndex: 'status',
      title: '状态',
      key: 'status',
      width: 100,
      align: 'center',
      render: (text: number, record: PermissionModel) => {
        const isActive = text === 1;

        return (
          <div className="flex items-center justify-center">
            <Switch
              checked={isActive}
              checkedChildren="启用"
              unCheckedChildren="停用"
              disabled={!canUpdateStatus}
              onChange={(checked) => {
                updatePermissionStatus(record.id, checked ? 1 : 0);
              }}
              className={isActive ? 'bg-green-500' : 'bg-gray-400'}
            />
          </div>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      align: 'center',
      sorter: (a: PermissionModel, b: PermissionModel) => a.createTime.localeCompare(b.createTime),
    },
    {
      title: '操作',
      width: 150,
      dataIndex: 'action',
      fixed: 'end',
      align: 'center',
      render: (_, record: PermissionModel) => (
        <div className="flex gap-2 justify-center">
          <Button
            size="small"
            type="link"
            classNames={{ content: 'text-(--ant-color-primary)' }}
            disabled={!canUpdateStatus}
            onClick={() => {
              if (!canUpdateStatus) {
                modal.error({
                  title: '权限不足',
                  content: '您没有更新权限点状态的权限，请联系管理员获取相应权限。',
                });
                return;
              }
              updatePermissionStatus(record.id, record.status === 1 ? 0 : 1);
            }}
          >
            {record.status === 1 ? '停用' : '启用'}
          </Button>
          <Button
            size="small"
            type="link"
            classNames={{ content: 'text-(--ant-color-primary)' }}
            disabled={!canEdit}
            onClick={() => {
              if (!canEdit) {
                modal.error({
                  title: '权限不足',
                  content: '您没有编辑权限点的权限，请联系管理员获取相应权限。',
                });
                return;
              }
              openModal('edit', record);
            }}
          >
            {t('common.operation.edit')}
          </Button>
          <Button
            size="small"
            type="link"
            danger
            disabled={!canDelete}
            onClick={() => {
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
                content: '确定删除该权限点吗？',
                okButtonProps: {
                  danger: true,
                  type: 'default',
                },
                cancelButtonProps: {
                  type: 'primary',
                },
                onOk() {
                  deletePermission(record.id);
                },
              });
            }}
          >
            {t('common.operation.delete')}
          </Button>
        </div>
      ),
    },
  ];

  return columns;
};
