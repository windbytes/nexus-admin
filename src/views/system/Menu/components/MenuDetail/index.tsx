import { CopyOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App, Button, Card, Descriptions, Space } from 'antd';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { menuService } from '@/services/system/menu/menuApi';
import type { MenuModel } from '@/services/system/menu/type';
import type { ModalType } from '../../hooks/useMenuModals';
import { useMenuPermissions } from '../../hooks/useMenuPermissions';
import MenuDescriptionItems from './components/MenuDescriptionItems';

export type MenuDetailProps = {
  menu: MenuModel | null;
  /**
   * 打开抽屉
   * @param name 操作类型
   * @param record 可选的菜单数据（用于编辑或新增时的父菜单）
   */
  openModal: (name: ModalType, record?: MenuModel) => void;
  /**
   * 删除菜单
   * @param menuId 菜单ID
   */
  onDeleteMenu: (menuId: string) => void;
  /**
   * 复制菜单
   * @param menuData 要复制的菜单数据
   */
  onCopyMenu: (menuData: Partial<MenuModel>) => void;
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

  /**
   * 切换菜单状态
   */
  const handleToggleStatus = (id: string, status: boolean) => {
    toggleMenuStatusMutation.mutate({ id, status });
  };

  // 选中的菜单的描述列表
  const items = MenuDescriptionItems({
    menu,
    onToggleStatus: handleToggleStatus,
    canEditMenu: permissions.canEditMenu,
  });

  /**
   * 删除菜单
   */
  const handleDelete = () => {
    if (!menu?.id) {
      return;
    }
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
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('add', menu || undefined)}>
                {t('common.operation.add')}子菜单
              </Button>
            )}
            {permissions.canEditMenu && (
              <Button
                color="orange"
                variant="outlined"
                icon={<EditOutlined />}
                onClick={() => openModal('edit', menu || undefined)}
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
