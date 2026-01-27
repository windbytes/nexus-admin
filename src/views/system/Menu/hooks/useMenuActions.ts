import { useMutation } from '@tanstack/react-query';
import { App } from 'antd';
import { menuService } from '@/services/system/menu/menuApi';
import type { MenuModel } from '@/services/system/menu/type';

interface UseMenuActionsProps {
  // 当前操作的行数据
  currentRow: Partial<MenuModel> | null;
  // 成功的回调
  onSuccess?: () => void;
}

/**
 * 菜单操作相关的 hooks
 */
export const useMenuActions = ({ currentRow, onSuccess }: UseMenuActionsProps) => {
  const { modal, message } = App.useApp();

  /**
   * 新增菜单
   */
  const createMenuMutation = useMutation({
    mutationFn: (values: Partial<MenuModel>) => menuService.addMenu(values),
    onSuccess: () => {
      message.success('新增菜单成功');
      onSuccess?.();
    },
    onError: (error) => {
      modal.error({
        title: '菜单新增失败',
        content: `新增菜单时发生错误：${error.message || '未知错误'}。请检查输入数据或联系技术支持。`,
      });
    },
  });

  // 更新菜单
  const updateMenuMutation = useMutation({
    mutationFn: (values: Partial<MenuModel>) => {
      if (!currentRow?.id) {
        throw new Error('当前行数据不存在');
      }
      return menuService.updateMenu({ id: currentRow.id, ...values });
    },
    onSuccess: () => {
      message.success('修改菜单成功');
      onSuccess?.();
    },
    onError: (error) => {
      modal.error({
        title: '菜单修改失败',
        content: `修改菜单时发生错误：${error.message || '未知错误'}。请检查输入数据或联系技术支持。`,
      });
    },
  });

  // 更新菜单状态
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) => menuService.toggleMenuStatus(id, status),
    onSuccess,
  });

  // 更新菜单状态
  const updateMenuStatus = (id: string, status: boolean) => {
    updateStatusMutation.mutate({ id, status });
  };

  // 删除菜单
  const deleteMenuMutation = useMutation({
    mutationFn: (id: string) => menuService.deleteMenu(id),
    onSuccess: () => {
      message.success('菜单删除成功！');
      onSuccess?.();
    },
    onError: (error) => {
      modal.error({
        title: '菜单删除失败',
        content: `删除菜单时发生错误：${error.message || '未知错误'}。请检查菜单状态或联系技术支持。`,
      });
    },
  });

  // 删除菜单
  const deleteMenu = (id: string) => {
    deleteMenuMutation.mutate(id);
  };

  // 批量删除菜单
  const deleteMenuBatchMutation = useMutation({
    mutationFn: (ids: string[]) => menuService.deleteMenuBatch(ids),
    onSuccess: () => {
      message.success('批量删除菜单成功！');
      onSuccess?.();
    },
    onError: (error) => {
      modal.error({
        title: '批量删除菜单失败',
        content: `批量删除菜单时发生错误：${error.message || '未知错误'}。请检查菜单状态或联系技术支持。`,
      });
    },
  });

  // 批量删除菜单
  const deleteMenuBatch = (ids: string[]) => {
    deleteMenuBatchMutation.mutate(ids);
  };

  // 处理模态框确认
  const handleModalSave = (values: Partial<MenuModel>) => {
    if (currentRow?.id) {
      updateMenuMutation.mutate(values);
    } else {
      createMenuMutation.mutate(values);
    }
  };

  return {
    handleModalSave,
    updateMenuStatus,
    deleteMenu,
    deleteMenuBatch,
  };
};

