import { CopyOutlined, DeleteOutlined, EditOutlined, ExclamationCircleFilled, MoreOutlined } from '@ant-design/icons';
import { App, Button, Dropdown, type MenuProps, Switch, type TableProps, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { TABLE_ACTION_CELL_CLASSNAME, TABLE_ACTION_COLUMN_WIDTH } from '@/constants/table';
import type { MenuModel } from '@/services/system/menu/type';
import { addIcon } from '@/utils/optimized-icons';
import { MENU_TYPE } from '../constants';
import { useMenuActions } from './useMenuActions';
import type { ModalType } from './useMenuModals';
import { useMenuPermissions } from './useMenuPermissions';

interface UseMenuTableColumnProps {
  // 当前操作行的数据
  currentRow: Partial<MenuModel> | null;
  openModal: (name: ModalType, record?: MenuModel) => void;
  // 成功的回调
  onSuccess?: () => void;
  // 设置复制数据
  setCopiedData?: (data: Partial<MenuModel> | null) => void;
}

/**
 * 菜单表格列配置hook
 */
export const useMenuTableColumns = (props: UseMenuTableColumnProps) => {
  const { modal } = App.useApp();
  const { currentRow, onSuccess, openModal, setCopiedData } = props;
  const { canEditMenu, canDeleteMenu, canCopyMenu } = useMenuPermissions();
  const { t } = useTranslation();
  // 操作hooks
  const { deleteMenu, updateMenuStatus } = useMenuActions({ currentRow, onSuccess });

  // 获取菜单类型标签
  const getMenuTypeTag = (menuType: number) => {
    const typeMap: Record<number, { label: string; color: string }> = {
      [MENU_TYPE.TOP_LEVEL]: { label: '目录', color: 'blue' },
      [MENU_TYPE.SUB_MENU]: { label: '子菜单', color: 'green' },
      [MENU_TYPE.SUB_ROUTE]: { label: '子路由', color: 'orange' },
      [MENU_TYPE.PERMISSION_BUTTON]: { label: '权限按钮', color: 'purple' },
    };
    const typeInfo = typeMap[menuType] || { label: '未知', color: 'default' };
    return (
      <Tag variant="solid" color={typeInfo.color}>
        {typeInfo.label}
      </Tag>
    );
  };

  // 复制菜单
  const handleCopyMenu = (record: MenuModel) => {
    const copiedData = {
      ...record,
      id: undefined,
      name: `${record.name}_副本`,
      url: record.url ? `${record.url}_copy` : undefined,
      componentName: record.componentName ? `${record.componentName}_copy` : undefined,
    };
    setCopiedData?.(copiedData);
    openModal('add', record);
  };

  // 更多操作菜单项
  const moreActionItems = (record: MenuModel): MenuProps['items'] => {
    return [
      {
        key: 'copy',
        label: t('common.operation.copy'),
        icon: <CopyOutlined className="text-sm! block" />,
        disabled: !canCopyMenu,
        onClick: () => {
          if (!canCopyMenu) {
            modal.error({
              title: '权限不足',
              content: '您没有复制菜单的权限，请联系管理员获取相应权限。',
            });
            return;
          }
          handleCopyMenu(record);
        },
      },
      {
        key: 'delete',
        label: t('common.operation.delete'),
        icon: <DeleteOutlined className="text-sm! block text-(--ant-color-error)!" />,
        disabled: !canDeleteMenu,
        onClick: () => {
          if (!canDeleteMenu) {
            modal.error({
              title: '权限不足',
              content: '您没有删除菜单的权限，请联系管理员获取相应权限。',
            });
            return;
          }
          modal.confirm({
            title: '删除菜单',
            icon: <ExclamationCircleFilled />,
            content: '确定删除该菜单吗？数据删除后将无法恢复！',
            okButtonProps: {
              danger: true,
              type: 'default',
            },
            cancelButtonProps: {
              type: 'primary',
            },
            onOk() {
              deleteMenu(record.id);
            },
          });
        },
      },
    ];
  };

  const columns: TableProps<MenuModel>['columns'] = [
    {
      dataIndex: 'id',
      title: 'ID',
      key: 'id',
      hidden: true,
    },
    {
      title: '菜单名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      align: 'left',
      render: (name: string, record: MenuModel) => (
        <div className="flex items-center gap-2">
          {record.icon && <span>{addIcon(record.icon)}</span>}
          <span className="font-medium">{t(name)}</span>
        </div>
      ),
    },
    {
      title: '菜单类型',
      dataIndex: 'menuType',
      key: 'menuType',
      width: 100,
      align: 'center',
      render: (menuType: number) => getMenuTypeTag(menuType),
    },
    {
      title: '路由地址',
      dataIndex: 'url',
      key: 'url',
      width: 200,
      align: 'left',
      render: (url: string) => <span className="text-gray-600">{url || '-'}</span>,
    },
    {
      title: '组件路径',
      dataIndex: 'component',
      key: 'component',
      width: 200,
      align: 'left',
      ellipsis: true,
      render: (component: string) => <span className="text-gray-600">{component || '-'}</span>,
    },
    {
      title: '权限标识',
      dataIndex: 'perms',
      key: 'perms',
      width: 150,
      align: 'left',
      render: (perms: string) => <span className="text-gray-600">{perms || '-'}</span>,
    },
    {
      title: '排序',
      dataIndex: 'sortNo',
      key: 'sortNo',
      width: 80,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: boolean, record: MenuModel) => {
        return (
          <div className="flex items-center justify-center">
            <Switch
              checked={status}
              checkedChildren="启用"
              unCheckedChildren="停用"
              disabled={!canEditMenu}
              onChange={(checked) => {
                updateMenuStatus(record.id, checked);
              }}
              className={status ? 'bg-green-500' : 'bg-gray-400'}
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
      sorter: (a: MenuModel, b: MenuModel) => a.createTime.localeCompare(b.createTime),
    },
    {
      title: '操作',
      width: TABLE_ACTION_COLUMN_WIDTH,
      dataIndex: 'action',
      fixed: 'end',
      align: 'center',
      render: (_, record: MenuModel) => (
        <div className={TABLE_ACTION_CELL_CLASSNAME}>
          <Button
            size="small"
            type="link"
            icon={<EditOutlined className="text-(--ant-color-primary)!" />}
            classNames={{ content: 'text-(--ant-color-primary)' }}
            onClick={() => openModal('edit', record)}
            disabled={!canEditMenu}
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
      ),
    },
  ];

  return columns;
};
