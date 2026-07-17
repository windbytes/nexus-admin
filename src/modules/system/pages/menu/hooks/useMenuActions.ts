import { useMutation } from '@tanstack/react-query';
import { App } from 'antd';
import { type MenuExportParams, type MenuImportResult, menuService } from '@/modules/system/api/menu';
import type { MenuModel } from '@/shared/api/system/menu/type';
import type { MenuSearchParams } from '../types';

/**
 * `useMenuActions` 入参。
 */
interface UseMenuActionsProps {
  /** 当前编辑行；有 `id` 时弹窗保存走更新，否则走新增 */
  currentRow: Partial<MenuModel> | null;
  /** 任一写操作成功后的回调（通常用于关弹窗 + 刷新列表） */
  onSuccess?: () => void;
}

/**
 * `useMenuActions` 返回的操作方法集合。
 */
export interface UseMenuActionsResult {
  /**
   * 弹窗确认保存：有当前行 id 则更新，否则新增。
   * @param values - 表单提交的菜单字段
   */
  handleModalSave: (values: Partial<MenuModel>) => void;
  /**
   * 切换菜单启用状态。
   * @param id - 菜单 ID
   * @param status - 目标状态
   */
  updateMenuStatus: (id: string, status: boolean) => void;
  /**
   * 删除单条菜单。
   * @param id - 菜单 ID
   */
  deleteMenu: (id: string) => void;
  /**
   * 批量删除菜单。
   * @param ids - 菜单 ID 列表
   */
  deleteMenuBatch: (ids: string[]) => void;
  /**
   * 上传 CSV 导入菜单。
   * @param file - 本地 CSV 文件
   */
  importMenus: (file: File) => void;
  /**
   * 导出菜单并触发浏览器下载。
   * @param type - `all` 按当前搜索条件；`selected` 按选中 ID
   * @param selectedIds - 选中 ID（`type=selected` 时必填）
   * @param searchParams - 搜索条件（`type=all` 时使用）
   */
  exportMenus: (type: 'all' | 'selected', selectedIds?: string[], searchParams?: MenuSearchParams) => void;
}

/**
 * 封装菜单 CRUD、状态切换、导入导出的 React Query mutations。
 *
 * @param props - 当前编辑行与成功回调
 * @returns 供页面 / 列定义调用的操作方法
 */
export function useMenuActions({ currentRow, onSuccess }: UseMenuActionsProps): UseMenuActionsResult {
  const { modal, message } = App.useApp();

  const createMenuMutation = useMutation({
    mutationFn: (values: Partial<MenuModel>) => menuService.addMenu(values),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      modal.error({
        title: '菜单新增失败',
        content: `新增菜单时发生错误：${error.message || '未知错误'}。请检查输入数据或联系技术支持。`,
      });
    },
  });

  const updateMenuMutation = useMutation({
    mutationFn: (values: Partial<MenuModel>) => {
      if (!currentRow?.id) {
        throw new Error('当前行数据不存在');
      }
      return menuService.updateMenu({ id: currentRow.id, ...values });
    },
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      modal.error({
        title: '菜单修改失败',
        content: `修改菜单时发生错误：${error.message || '未知错误'}。请检查输入数据或联系技术支持。`,
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) => menuService.toggleMenuStatus(id, status),
    onSuccess,
  });

  /**
   * @param id - 菜单主键
   * @param status - 目标启用状态
   */
  function updateMenuStatus(id: string, status: boolean) {
    updateStatusMutation.mutate({ id, status });
  }

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

  /**
   * @param id - 菜单主键
   */
  function deleteMenu(id: string) {
    deleteMenuMutation.mutate(id);
  }

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

  /**
   * @param ids - 菜单主键列表
   */
  function deleteMenuBatch(ids: string[]) {
    deleteMenuBatchMutation.mutate(ids);
  }

  /**
   * @param values - 弹窗表单值
   */
  function handleModalSave(values: Partial<MenuModel>) {
    if (currentRow?.id) {
      updateMenuMutation.mutate(values);
    } else {
      createMenuMutation.mutate(values);
    }
  }

  const importMutation = useMutation({
    mutationFn: (file: File) => menuService.importMenus(file),
    onSuccess: (result: MenuImportResult) => {
      if (result.success) {
        message.success(`导入成功，共 ${result.successCount ?? 0} 条`);
        onSuccess?.();
      } else {
        modal.error({
          title: '导入失败',
          content: result.errors?.join('\n') || '导入过程中发生错误',
        });
      }
    },
    onError: (error: Error) => {
      modal.error({
        title: '导入失败',
        content: error.message || '未知错误',
      });
    },
  });

  /**
   * @param file - CSV 文件
   */
  function importMenus(file: File) {
    importMutation.mutate(file);
  }

  const exportMutation = useMutation({
    mutationFn: (params: MenuExportParams) => menuService.exportMenus(params),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `系统菜单_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('导出成功');
    },
    onError: (error: Error) => {
      modal.error({
        title: '导出失败',
        content: error.message || '未知错误',
      });
    },
  });

  /**
   * @param type - 导出范围
   * @param selectedIds - 选中 ID
   * @param searchParams - 当前搜索条件
   */
  function exportMenus(type: 'all' | 'selected', selectedIds?: string[], searchParams?: MenuSearchParams) {
    exportMutation.mutate({
      type,
      menuIds: type === 'selected' && selectedIds?.length ? selectedIds : undefined,
      menuName: type === 'all' ? searchParams?.name : undefined,
      menuType: type === 'all' ? searchParams?.menuType : undefined,
      status: type === 'all' ? searchParams?.status : undefined,
    });
  }

  return {
    handleModalSave,
    updateMenuStatus,
    deleteMenu,
    deleteMenuBatch,
    importMenus,
    exportMenus,
  };
}
