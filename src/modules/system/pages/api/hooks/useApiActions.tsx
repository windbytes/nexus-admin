/**
 * @file 系统接口维护操作与数据查询
 */

import { ExclamationCircleFilled } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { App } from 'antd';
import type { Key } from 'react';
import { apiService } from '@/modules/system/api/api';
import { menuService } from '@/modules/system/api/menu';
import type { ApiModel, ApiSaveParams } from '@/shared/api/system/api/type';

interface UseApiActionsOptions {
  selectedMenuId: string | null;
  selectedRowKeys: Key[];
  setSelectedRowKeys: (keys: Key[]) => void;
  openForm: (record?: Partial<ApiModel>) => void;
  closeForm: () => void;
  refetchApis: () => void;
}

/**
 * 系统接口维护操作：增删改、弹窗确认。
 *
 * @param options - 选中态与回调
 */
export function useApiActions(options: UseApiActionsOptions) {
  const { modal, message } = App.useApp();
  const { selectedMenuId, selectedRowKeys, setSelectedRowKeys, openForm, closeForm, refetchApis } = options;

  /**
   * 写操作成功：关弹窗、清空勾选并刷新。
   */
  function onSuccess() {
    closeForm();
    setSelectedRowKeys([]);
    refetchApis();
  }

  const addMutation = useMutation({
    mutationFn: (params: ApiSaveParams) => apiService.add(params),
    onSuccess: () => {
      message.success('新增接口成功');
      onSuccess();
    },
    onError: (error: Error) => {
      modal.error({ title: '新增接口失败', content: error.message || '未知错误' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (params: ApiSaveParams) => apiService.update(params),
    onSuccess: () => {
      message.success('修改接口成功');
      onSuccess();
    },
    onError: (error: Error) => {
      modal.error({ title: '修改接口失败', content: error.message || '未知错误' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.delete(id),
    onSuccess: () => {
      message.success('删除接口成功');
      refetchApis();
    },
    onError: (error: Error) => {
      modal.error({ title: '删除接口失败', content: error.message || '未知错误' });
    },
  });

  const batchDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => apiService.batchDelete(ids),
    onSuccess: () => {
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      refetchApis();
    },
    onError: (error: Error) => {
      modal.error({ title: '批量删除失败', content: error.message || '未知错误' });
    },
  });

  /**
   * @param values - 表单提交值
   */
  async function handleModalSave(values: ApiSaveParams) {
    if (values.id) {
      await updateMutation.mutateAsync(values);
    } else {
      await addMutation.mutateAsync(values);
    }
  }

  /**
   * 校验已选菜单后打开新增弹窗。
   */
  function handleAdd() {
    if (!selectedMenuId) {
      modal.warning({ content: '请先在左侧选择要配置接口的菜单（仅叶子/可点击页面）' });
      return;
    }
    openForm();
  }

  /**
   * @param record - 待删除行
   */
  function handleDelete(record: ApiModel) {
    modal.confirm({
      title: '删除接口',
      icon: <ExclamationCircleFilled />,
      content: `确定删除接口「${record.name}」吗？`,
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutate(record.id),
    });
  }

  /**
   * 批量删除确认。
   */
  function handleBatchDelete() {
    if (selectedRowKeys.length === 0) {
      modal.warning({ content: '请先勾选要删除的接口' });
      return;
    }
    modal.confirm({
      title: '批量删除',
      icon: <ExclamationCircleFilled />,
      content: `确定删除选中的 ${selectedRowKeys.length} 个接口吗？`,
      okButtonProps: { danger: true },
      onOk: () => batchDeleteMutation.mutate(selectedRowKeys as string[]),
    });
  }

  return {
    handleModalSave,
    handleAdd,
    handleDelete,
    handleBatchDelete,
  };
}

/**
 * 菜单树 + 接口列表数据。
 *
 * @param selectedMenuId - 当前选中菜单；未选时不请求接口列表
 */
export function useApiData(selectedMenuId: string | null) {
  const { data: menuList = [], isFetching: menuLoading } = useQuery({
    queryKey: ['sys_menu_apis_tree'],
    queryFn: () => menuService.getAllMenus({}),
  });

  const {
    data: apiList = [],
    isFetching: apiLoading,
    refetch: refetchApis,
  } = useQuery({
    queryKey: ['sys_api', selectedMenuId],
    queryFn: () => (selectedMenuId ? apiService.queryByMenuId({ menuId: selectedMenuId }) : Promise.resolve([])),
    enabled: !!selectedMenuId,
  });

  return {
    menuList,
    menuLoading,
    apiList,
    apiLoading,
    refetchApis,
  };
}
