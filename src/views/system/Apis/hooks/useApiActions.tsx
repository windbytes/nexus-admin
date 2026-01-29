import { ExclamationCircleFilled } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { App } from 'antd';
import type { Key } from 'react';
import { apiService } from '@/services/system/api/apiApi';
import type { ApiModel, ApiSaveParams } from '@/services/system/api/type';
import { menuService } from '@/services/system/menu/menuApi';

interface UseApiActionsOptions {
  selectedMenuId: string | null;
  selectedRowKeys: Key[];
  setSelectedRowKeys: (keys: Key[]) => void;
  openForm: (record?: Partial<ApiModel>) => void;
  closeForm: () => void;
  refetchApis: () => void;
}

/**
 * 系统接口维护操作：增删改查、弹窗确认
 */
export const useApiActions = (options: UseApiActionsOptions) => {
  const { modal } = App.useApp();
  const {
    selectedMenuId,
    selectedRowKeys,
    setSelectedRowKeys,
    openForm,
    closeForm,
    refetchApis,
  } = options;

  const onSuccess = () => {
    closeForm();
    setSelectedRowKeys([]);
    refetchApis();
  };

  const addMutation = useMutation({
    mutationFn: (params: ApiSaveParams) => apiService.add(params),
    onSuccess,
  });

  const updateMutation = useMutation({
    mutationFn: (params: ApiSaveParams) => apiService.update(params),
    onSuccess,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.delete(id),
    onSuccess: refetchApis,
  });

  const batchDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => apiService.batchDelete(ids),
    onSuccess: () => {
      setSelectedRowKeys([]);
      refetchApis();
    },
  });

  const handleModalSave = async (values: ApiSaveParams) => {
    if (values.id) {
      await updateMutation.mutateAsync(values);
    } else {
      await addMutation.mutateAsync(values);
    }
  };

  const handleAdd = () => {
    if (!selectedMenuId) {
      modal.warning({ content: '请先在左侧选择要配置接口的菜单（仅叶子/可点击页面）' });
      return;
    }
    openForm();
  };

  const handleDelete = (record: ApiModel) => {
    modal.confirm({
      title: '删除接口',
      icon: <ExclamationCircleFilled />,
      content: `确定删除接口「${record.name}」吗？`,
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutate(record.id),
    });
  };

  const handleBatchDelete = () => {
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
  };

  return {
    handleModalSave,
    handleAdd,
    handleDelete,
    handleBatchDelete,
  };
};

/** 菜单树 + 接口列表数据 */
export const useApiData = (selectedMenuId: string | null) => {
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
    queryFn: () =>
      selectedMenuId
        ? apiService.queryByMenuId({ menuId: selectedMenuId })
        : Promise.resolve([]),
    enabled: !!selectedMenuId,
  });

  return {
    menuList,
    menuLoading,
    apiList,
    apiLoading,
    refetchApis,
  };
};
