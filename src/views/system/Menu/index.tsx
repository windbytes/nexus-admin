import { useQueryClient } from '@tanstack/react-query';
import type React from 'react';
import { useCallback } from 'react';
import type { MenuModel } from '@/services/system/menu/type';
import MenuDetail from './components/MenuDetail';
import MenuInfoDrawer from './components/MenuInfoDrawer';
import MenuInterfacePermission from './components/MenuInterfacePermission';
import MenuTree from './components/MenuTree';
import { useMenuActions } from './hooks/useMenuActions';
import { useMenuModals } from './hooks/useMenuModals';

/**
 * 菜单管理页面主组件
 */
const Menu: React.FC = () => {
  const queryClient = useQueryClient();
  // 窗口管理hook
  const {
    modal,
    current,
    editingMenu,
    parentMenu,
    copiedMenuData,
    openModal,
    closeModal,
    setCopiedData,
    setCurrentMenu,
  } = useMenuModals();

  // 菜单操作hook
  const { handleModalSave, deleteMenu } = useMenuActions({
    currentRow: editingMenu,
    onSuccess: () => {
      closeModal();
      // 重新获取菜单数据
      queryClient.invalidateQueries({ queryKey: ['sys_menu'] });
    },
  });

  /**
   * 选择菜单
   * @param menu 菜单
   */
  const onSelectMenu = useCallback(
    (menu: MenuModel) => {
      // 更新当前选中的菜单
      setCurrentMenu(menu);
    },
    [setCurrentMenu]
  );

  /**
   * 复制菜单
   * @param menuData 要复制的菜单数据
   */
  const handleCopyMenu = useCallback(
    (menuData: Partial<MenuModel>) => {
      // 复制菜单数据，移除id等唯一标识字段
      const copiedData = {
        ...menuData,
        id: undefined, // 移除id，确保是新增
        name: `${menuData.name}_副本`, // 在名称后添加"_副本"标识
        url: menuData.url ? `${menuData.url}_copy` : undefined, // 如果存在url，添加"_copy"后缀
        componentName: menuData.componentName ? `${menuData.componentName}_copy` : undefined, // 如果存在组件名，添加"_copy"后缀
      };

      // 设置复制的菜单数据并打开新增抽屉
      setCopiedData(copiedData);
      openModal('add', menuData as MenuModel);
    },
    [openModal, setCopiedData]
  );

  return (
    <>
      <div className="flex gap-2 h-full w-full">
        {/* 左边菜单列表 */}
        <MenuTree onSelectMenu={onSelectMenu} openModal={openModal} />
        {/* 右侧内容区域 */}
        <div className="flex flex-col flex-1 gap-2 h-full min-w-0">
          {/* 菜单详情 */}
          <MenuDetail menu={current} openModal={openModal} onDeleteMenu={deleteMenu} onCopyMenu={handleCopyMenu} />
          {/* 菜单接口权限列表 */}
          <MenuInterfacePermission menu={current} />
        </div>
      </div>
      {/* 菜单信息抽屉 */}
      <MenuInfoDrawer
        menu={modal === 'add' ? parentMenu || undefined : editingMenu || undefined}
        operation={modal === 'add' ? 'add' : modal === 'edit' ? 'edit' : 'view'}
        open={modal === 'add' || modal === 'edit'}
        copiedMenuData={copiedMenuData || undefined}
        onOk={handleModalSave}
        onClose={closeModal}
      />
    </>
  );
};

export default Menu;
