import { CopyOutlined, DeleteOutlined, EditOutlined, ExclamationCircleFilled, MoreOutlined } from '@ant-design/icons';
import { App, Button, Dropdown, type MenuProps, Switch, type TableProps, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import type { MenuModel } from '@/shared/api/system/menu/type';
import { TABLE_ACTION_CELL_CLASSNAME, TABLE_ACTION_COLUMN_WIDTH } from '@/shared/constants/table';
import { addIcon } from '@/shared/utils/optimized-icons';
import { MENU_TYPE } from '../constants';
import { useMenuActions } from './useMenuActions';
import type { ModalType } from './useMenuModals';
import { useMenuPermissions } from './useMenuPermissions';

interface UseMenuTableColumnProps {
  /** 当前操作上下文行（传给 actions，用于更新时带上 id） */
  currentRow: Partial<MenuModel> | null;
  /**
   * 打开弹窗。
   * @param name - 弹窗类型
   * @param record - 关联菜单行
   */
  openModal: (name: ModalType, record?: MenuModel) => void;
  /** 写操作成功回调 */
  onSuccess?: () => void;
  /**
   * 写入复制预填数据。
   * @param data - 复制后的字段
   */
  setCopiedData?: (data: Partial<MenuModel> | null) => void;
}

/**
 * 构建菜单树表列定义（含类型标签、状态开关、编辑/复制/删除操作）。
 *
 * @param props - 列行为依赖的回调与权限上下文
 * @returns antd Table `columns` 配置
 */
export function useMenuTableColumns(props: UseMenuTableColumnProps) {
  const { modal } = App.useApp();
  const { currentRow, onSuccess, openModal, setCopiedData } = props;
  const { canEditMenu, canDeleteMenu, canCopyMenu } = useMenuPermissions();
  const { t } = useTranslation();
  const { deleteMenu, updateMenuStatus } = useMenuActions({ currentRow, onSuccess });

  /**
   * 将菜单类型数值渲染为彩色 Tag。
   * @param menuType - 菜单类型枚举值
   * @returns Tag 元素
   */
  function getMenuTypeTag(menuType: number) {
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
  }

  /**
   * 复制当前行：克隆字段并打开新增弹窗。
   * @param record - 被复制的菜单行
   */
  function handleCopyMenu(record: MenuModel) {
    const copiedData = {
      ...record,
      id: undefined,
      name: `${record.name}_副本`,
      url: record.url ? `${record.url}_copy` : undefined,
      componentName: record.componentName ? `${record.componentName}_copy` : undefined,
    };
    setCopiedData?.(copiedData);
    // 复制走新增：不把源行当作 parentMenu，避免标题/上级预填干扰（parentId 已在 copiedData 中）
    openModal('add');
  }

  /**
   * 生成行内「更多」下拉菜单项（复制 / 删除）。
   * @param record - 当前行
   * @returns antd Dropdown `items`
   */
  function moreActionItems(record: MenuModel): MenuProps['items'] {
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
  }

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
      dataIndex: 'permCode',
      key: 'permCode',
      width: 150,
      align: 'left',
      render: (permCode: string) => <span className="text-gray-600">{permCode || '-'}</span>,
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
}
