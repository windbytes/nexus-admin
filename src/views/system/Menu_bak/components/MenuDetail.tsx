import { PlusOutlined, DeleteOutlined, EditOutlined, CopyOutlined } from '@ant-design/icons';
import { App, Button, Card, Descriptions, Popconfirm, Space, Switch, Tag, type DescriptionsProps } from 'antd';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import type { MenuModel } from '@/services/system/menu/type';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { menuService } from '@/services/system/menu/menuApi';
import { useMenuPermissions } from '../hooks/useMenuPermissions';
import type { ModalType } from '../hooks/useMenuModals';

export type MenuDetailProps = {
  menu: MenuModel | null;
  /**
   * 打开抽屉
   * @param name 操作类型
   */
  openModal: (name: ModalType) => void;
  /**
   * 删除菜单
   * @param menuId 菜单ID
   */
  onDeleteMenu: (menuId: string) => Promise<void>;
  /**
   * 复制菜单
   * @param menuData 要复制的菜单数据
   */
  onCopyMenu: (menuData: any) => void;
};

/**
 * 菜单详情
 * @returns 菜单详情
 */
const MenuDetail: React.FC<MenuDetailProps> = ({ menu, openModal, onDeleteMenu, onCopyMenu }) => {
  const { modal } = App.useApp();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const permissions = useMenuPermissions();

  // 切换菜单状态mutation
  const toggleMenuStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) => menuService.toggleMenuStatus(id, status),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['sys_menu'] });
    },
  });

  // 选中的菜单的描述列表
  const items: DescriptionsProps['items'] = [
    {
      key: '1',
      label: '菜单类型',
      children: (() => {
        switch (menu?.menuType) {
          case 0:
            return <Tag color="red">目录</Tag>;
          case 1:
            return <Tag color="green">子菜单</Tag>;
          case 2:
            return <Tag color="blue">子路由</Tag>;
          case 3:
            return <Tag color="orange">权限按钮</Tag>;
          default:
            return '';
        }
      })(),
    },
    {
      key: '2',
      label: '菜单状态',
      children: (
        <Popconfirm
          title="切换菜单状态"
          description={`确定${menu?.status ? '禁用' : '启用'}菜单吗？`}
          onConfirm={() => {
            if (menu?.id) {
              toggleMenuStatusMutation.mutate({ id: menu.id, status: !menu.status });
            }
          }}
        >
          <Switch size="small" checked={menu?.status} disabled={!permissions.canEditMenu} />
        </Popconfirm>
      ),
    },
    {
      key: '3',
      label: '菜单名称',
      children: menu?.name,
    },
    {
      key: '4',
      label: '组件路径',
      children: menu?.component,
    },
    {
      key: '5',
      label: '路由名称',
      children: menu?.componentName,
    },
    {
      key: '6',
      label: '路由路径',
      children: menu?.url,
    },
    {
      key: '7',
      label: '路由参数',
      children: JSON.stringify(menu?.routeQuery ? menu.routeQuery : '{}'),
    },
    {
      key: '8',
      label: '菜单排序',
      children: menu?.sortNo,
    },
    {
      key: '9',
      label: '是否隐藏',
      children: <Tag color={menu?.hidden ? 'red' : 'green'}>{menu?.hidden ? '是' : '否'}</Tag>,
    },
    {
      key: '10',
      label: '是否缓存',
      children: <Tag color={menu?.keepAlive ? 'green' : 'red'}>{menu?.keepAlive ? '是' : '否'}</Tag>,
    },
  ];

  /**
   * 删除菜单
   */
  const handleDelete = () => {
    if (!menu?.id) return;
    // 需要做级联删除的判定
    modal.confirm({
      title: '删除菜单',
      content: '确定删除菜单吗？数据删除后将无法恢复！',
      onOk: async () => {
        try {
          await onDeleteMenu(menu.id);
        } catch (error) {
          console.error('删除失败:', error);
        }
      },
    });
  };

  /**
   * 复制菜单
   */
  const handleCopy = () => {
    if (menu) {
      onCopyMenu(menu);
    }
  };

  return (
    <Card className="min-h-1/3 max-h-1/2">
      <Descriptions
        column={2}
        size="small"
        bordered
        items={items}
        title="菜单详情"
        extra={
          <Space>
            {permissions.canAddMenu && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('add')}>
                {t('common.operation.add')}子菜单
              </Button>
            )}
            {permissions.canEditMenu && (
              <Button
                color="orange"
                variant="outlined"
                icon={<EditOutlined />}
                onClick={() => openModal('edit')}
              >
                {t('common.operation.edit')}
              </Button>
            )}
            {permissions.canCopyMenu && (
              <Button color="cyan" variant="outlined" icon={<CopyOutlined />} onClick={handleCopy}>
                {t('common.operation.copy')}
              </Button>
            )}
            {permissions.canDeleteMenu && (
              <Button color="danger" variant="outlined" icon={<DeleteOutlined />} onClick={handleDelete}>
                {t('common.operation.delete')}
              </Button>
            )}
          </Space>
        }
      />
    </Card>
  );
};

export default MenuDetail;

