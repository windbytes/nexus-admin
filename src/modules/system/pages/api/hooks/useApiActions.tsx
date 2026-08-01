/**
 * @file 系统接口注册表操作与数据查询
 */

import { ExclamationCircleFilled } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { App } from 'antd';
import type { Key } from 'react';
import { apiService } from '@/modules/system/api/api';
import { permissionService } from '@/modules/system/api/permission';
import type { ApiModel, ApiSaveParams, ApiSearchParams } from '@/shared/api/system/api/type';

interface UseApiActionsOptions {
  selectedRowKeys: Key[];
  setSelectedRowKeys: (keys: Key[]) => void;
  closeForm: () => void;
  refetchApis: () => void;
}

/**
 * 系统接口注册表操作：增删改、批量删除、扫描同步。
 *
 * @param options - 选中态与回调
 */
export function useApiActions(options: UseApiActionsOptions) {
  const { modal, message } = App.useApp();
  const { selectedRowKeys, setSelectedRowKeys, closeForm, refetchApis } = options;

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

  const scanMutation = useMutation({
    mutationFn: () => apiService.scan(),
    onSuccess: (result) => {
      modal.success({
        title: '扫描同步完成',
        content: `扫描端点 ${result.scannedEndpoints} 个，新增 ${result.inserted} 条，更新 ${result.updated} 条，跳过手工登记 ${result.skippedManual} 条，自动创建权限点 ${result.autoCreatedPerms} 个。`,
      });
      refetchApis();
    },
    onError: (error: Error) => {
      modal.error({ title: '扫描同步失败', content: error.message || '未知错误' });
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
   * @param record - 待删除行
   */
  function handleDelete(record: ApiModel) {
    modal.confirm({
      title: '删除接口',
      icon: <ExclamationCircleFilled />,
      content: `确定删除接口「${record.apiName}」吗？删除后该接口将按未注册处理（需鉴权）。`,
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

  /**
   * 触发注解扫描同步（@PreAuthorize 端点 → 注册表）。
   */
  function handleScan() {
    scanMutation.mutate();
  }

  return {
    handleModalSave,
    handleDelete,
    handleBatchDelete,
    handleScan,
    scanning: scanMutation.isPending,
  };
}

/**
 * 接口注册表分页数据。
 *
 * @param searchParams - 查询条件（含分页）
 */
export function useApiPageData(searchParams: ApiSearchParams, total: number) {
  const {
    data: result,
    isFetching: apiLoading,
    refetch: refetchApis,
  } = useQuery({
    queryKey: ['sys_api_registry', searchParams],
    queryFn: () =>
      apiService.page({
        ...searchParams,
        total: searchParams.pageNum === 1 ? 0 : total,
      }),
  });

  return {
    apiList: result?.records ?? [],
    totalRow: result?.totalRow ?? 0,
    apiLoading,
    refetchApis,
  };
}

/**
 * 权限点树数据（分组 + 接口权限点），供左侧分组树与表单绑定下拉使用。
 */
export function usePermissionTreeData() {
  const {
    data: tree = [],
    isFetching: treeLoading,
    refetch: refetchTree,
  } = useQuery({
    queryKey: ['sys_permission_tree'],
    queryFn: () => permissionService.getPermissionTree(false),
  });

  return { tree, treeLoading, refetchTree };
}
