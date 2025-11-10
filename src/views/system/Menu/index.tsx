import { menuService } from '@/services/system/menu/menuApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App, Layout, theme } from 'antd';
import type React from 'react';
import { useCallback, useReducer } from 'react';
import MenuDetail from './menu-detail';
import MenuInfoDrawer from './menu-info-drawer';
import MenuInterfacePermission from './menu-interface-permission';
import MenuTree from './menu-tree';

/**
 *
 * @returns 菜单
 */
const Menu: React.FC = () => {
  const { token } = theme.useToken();
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();

  // 合并的状态
  const [state, dispatch] = useReducer((prev: any, action: any) => ({ ...prev, ...action }), {
    // 抽屉是否打开
    openDrawer: false,
    // 当前选中的菜单
    currentMenu: null,
    // 当前的操作
    operation: 'view',
    // 复制的菜单数据（用于复制功能）
    copiedMenuData: null,
  });

  /**
   * 选择菜单
   * @param menu 菜单
   */
  const onSelectMenu = useCallback((menu: any) => {
    console.log('选中节点', menu);
    dispatch({ currentMenu: menu });
  }, []);

  /**
   * 打开抽屉
   * @param open 是否打开
   */
  const onOpenDrawer = useCallback((open: boolean, operation: string) => {
    if (!open) {
      // 关闭抽屉时清空复制的菜单数据
      dispatch({ openDrawer: open, operation, copiedMenuData: null });
    } else {
      dispatch({ openDrawer: open, operation });
    }
  }, []);

  /**
   * 复制菜单
   * @param menuData 要复制的菜单数据
   */
  const handleCopyMenu = useCallback((menuData: any) => {
    // 复制菜单数据，移除id等唯一标识字段
    const copiedData = {
      ...menuData,
      id: undefined, // 移除id，确保是新增
      name: `${menuData.name}_副本`, // 在名称后添加"_副本"标识
      url: menuData.url ? `${menuData.url}_copy` : undefined, // 如果存在url，添加"_copy"后缀
      componentName: menuData.componentName ? `${menuData.componentName}_copy` : undefined, // 如果存在组件名，添加"_copy"后缀
    };

    // 设置复制的菜单数据并打开新增抽屉
    dispatch({
      copiedMenuData: copiedData,
      openDrawer: true,
      operation: 'add',
    });
  }, []);

  // 新增菜单的mutation
  const addMenuMutation = useMutation({
    mutationFn: async (menuData: Record<string, any>) => {
      return await menuService.addMenu(menuData);
    },
    onSuccess: () => {
      // 重新获取菜单数据
      queryClient.invalidateQueries({ queryKey: ['sys_menu'] });
      // 关闭抽屉
      dispatch({ openDrawer: false });
    },
    onError: (error: any) => {
      modal.error({
        title: '菜单新增失败',
        content: `新增菜单时发生错误：${error.message || '未知错误'}。请检查输入数据或联系技术支持。`,
      });
    },
  });

  // 修改菜单的mutation
  const updateMenuMutation = useMutation({
    mutationFn: async (menuData: Record<string, any>) => {
      return await menuService.updateMenu(menuData);
    },
    onSuccess: () => {
      // 重新获取菜单数据
      queryClient.invalidateQueries({ queryKey: ['sys_menu'] });
      // 关闭抽屉
      dispatch({ openDrawer: false });
    },
    onError: (error: any) => {
      modal.error({
        title: '菜单修改失败',
        content: `修改菜单时发生错误：${error.message || '未知错误'}。请检查输入数据或联系技术支持。`,
      });
    },
  });

  // 删除菜单的mutation
  const deleteMenuMutation = useMutation({
    mutationFn: async (menuId: string) => {
      return await menuService.deleteMenu(menuId);
    },
    onSuccess: () => {
      message.success('菜单删除成功！');
      // 重新获取菜单数据
      queryClient.invalidateQueries({ queryKey: ['sys_menu'] });
      // 清空当前选中的菜单
      dispatch({ currentMenu: null });
    },
    onError: (error: any) => {
      modal.error({
        title: '菜单删除失败',
        content: `删除菜单时发生错误：${error.message || '未知错误'}。请检查菜单状态或联系技术支持。`,
      });
    },
  });

  /**
   * 弹窗点击确定的回调函数
   * @param menuData 编辑的菜单数据
   */
  const handleDrawerOk = async (menuData: Record<string, any>) => {
    try {
      if (state.operation === 'add') {
        // 新增数据
        await addMenuMutation.mutateAsync(menuData);
      } else if (state.operation === 'edit') {
        // 编辑数据
        await updateMenuMutation.mutateAsync(menuData);
      }
    } catch (error) {
      // 错误已在mutation中处理，这里不需要额外处理
      console.error('操作失败:', error);
    }
  };

  /**
   * 删除菜单
   * @param menuId 菜单ID
   */
  const handleDeleteMenu = async (menuId: string) => {
    try {
      await deleteMenuMutation.mutateAsync(menuId);
    } catch (error) {
      // 错误已在mutation中处理，这里不需要额外处理
      console.error('删除失败:', error);
    }
  };

  return (
    <>
      <Layout className="p-4">
        <Layout.Sider width={320} theme="light" style={{ borderRadius: token.borderRadius }}>
          {/* 左边菜单列表 */}
          <MenuTree onSelectMenu={onSelectMenu} onOpenDrawer={onOpenDrawer} />
        </Layout.Sider>
        <Layout.Content className="flex flex-col ml-4 gap-4">
          {/* 菜单详情 */}
          <MenuDetail
            menu={state.currentMenu}
            onOpenDrawer={onOpenDrawer}
            onDeleteMenu={handleDeleteMenu}
            onCopyMenu={handleCopyMenu}
          />
          {/* 菜单接口权限列表 */}
          <MenuInterfacePermission menu={state.currentMenu} />
        </Layout.Content>
      </Layout>
      <MenuInfoDrawer
        menu={state.currentMenu}
        operation={state.operation}
        open={state.openDrawer}
        copiedMenuData={state.copiedMenuData}
        onOk={handleDrawerOk}
        onClose={onOpenDrawer}
      />
    </>
  );
};

export default Menu;
