import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App, Modal } from 'antd';
import type { ExportOptions, SysParam, SysParamFormData, SysParamSearchParams } from '@/services/system/params';
import { sysParamService } from '@/services/system/params';
import { clearAllParamCache, deleteParamCache, updateParamCache } from '@/utils/paramService';

interface UseParamActionsProps {
  // 当前操作的行数据
  currentRow: SysParam | null;
  // 成功的回调
  onSuccess?: () => void;
}

const { confirm } = Modal;

/**
 * 系统参数操作相关的 hooks
 */
export const useParamActions = ({ currentRow, onSuccess }: UseParamActionsProps) => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  // 新增参数
  const createParamMutation = useMutation({
    mutationFn: (data: SysParamFormData) => sysParamService.createParam(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['sys_params'] });
      // 更新参数缓存
      if (data.code && data.value) {
        updateParamCache(data.code, data.value);
      }
      message.success('新增参数成功');
      onSuccess?.();
    },
    onError: (error: any) => {
      message.error(`新增参数失败: ${error.message || '未知错误'}`);
    },
  });

  // 更新参数
  const updateParamMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: SysParamFormData }) => sysParamService.updateParam(id, data),
    onSuccess: (_, { data }) => {
      queryClient.invalidateQueries({ queryKey: ['sys_params'] });
      // 更新参数缓存
      if (data.code && data.value) {
        updateParamCache(data.code, data.value);
      }
      message.success('更新参数成功');
      onSuccess?.();
    },
    onError: (error: any) => {
      message.error(`更新参数失败: ${error.message || '未知错误'}`);
    },
  });

  // 删除参数
  const deleteParamMutation = useMutation({
    mutationFn: ({ id, code }: { id: number; code: string }) => sysParamService.deleteParam(id),
    onSuccess: (_, { code }) => {
      queryClient.invalidateQueries({ queryKey: ['sys_params'] });
      // 删除参数缓存
      if (code) {
        deleteParamCache(code);
      }
      message.success('删除参数成功');
      onSuccess?.();
    },
    onError: (error: any) => {
      message.error(`删除参数失败: ${error.message || '未知错误'}`);
    },
  });

  // 批量删除参数
  const batchDeleteParamsMutation = useMutation({
    mutationFn: ({ ids, codes }: { ids: number[]; codes: string[] }) => sysParamService.batchDeleteParams(ids),
    onSuccess: (_, { codes }) => {
      queryClient.invalidateQueries({ queryKey: ['sys_params'] });
      // 批量删除参数缓存
      if (codes && codes.length > 0) {
        codes.forEach((code) => {
          if (code) {
            deleteParamCache(code);
          }
        });
      }
      message.success('批量删除参数成功');
      onSuccess?.();
    },
    onError: (error: any) => {
      message.error(`批量删除参数失败: ${error.message || '未知错误'}`);
    },
  });

  // 导入参数
  const importParamsMutation = useMutation({
    mutationFn: (file: File) => sysParamService.importParams(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sys_params'] });
      // 导入可能影响多个参数，清空所有缓存
      clearAllParamCache();
      message.success('导入参数成功');
      onSuccess?.();
    },
    onError: (error: any) => {
      message.error(`导入参数失败: ${error.message || '未知错误'}`);
    },
  });

  // 处理模态框确认
  const handleModalSave = (values: SysParamFormData) => {
    if (currentRow?.id) {
      updateParamMutation.mutate({
        id: currentRow.id,
        data: values,
      });
    } else {
      createParamMutation.mutate(values);
    }
  };

  // 删除参数（带确认）
  const deleteParam = (record: SysParam) => {
    confirm({
      title: '确认删除',
      content: `确定要删除参数"${record.name}"吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        deleteParamMutation.mutate({ id: record.id, code: record.code });
      },
    });
  };

  // 批量删除参数（带确认）
  const batchDeleteParams = (ids: number[], codes: string[]) => {
    confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${ids.length} 个参数吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        batchDeleteParamsMutation.mutate({ ids, codes });
      },
    });
  };

  // 导入参数
  const importParams = (file: File) => {
    importParamsMutation.mutate(file);
  };

  // 导出参数
  const exportParamsMutation = useMutation({
    mutationFn: (options: {
      type: 'all' | 'selected';
      selectedIds?: number[];
      searchParams?: SysParamSearchParams;
    }) => {
      const exportOptions: ExportOptions = {
        type: options.type,
        ...(options.selectedIds && { selectedIds: options.selectedIds }),
        ...(options.searchParams && { searchParams: options.searchParams }),
      };
      return sysParamService.exportParams(exportOptions);
    },
    onSuccess: (blob) => {
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `系统参数_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('导出参数成功');
    },
    onError: (error: any) => {
      message.error(`导出参数失败: ${error.message || '未知错误'}`);
    },
  });

  // 导出参数
  const exportParams = (type: 'all' | 'selected', selectedIds?: number[], searchParams?: SysParamSearchParams) => {
    exportParamsMutation.mutate({
      type,
      ...(type === 'selected' && { selectedIds }),
      ...(type === 'all' && { searchParams }),
    });
  };

  // 更新参数状态
  const updateParamStatus = (record: SysParam, status: boolean) => {
    updateParamMutation.mutate({
      id: record.id,
      data: { ...record, status },
    });
  };

  return {
    handleModalSave,
    deleteParam,
    batchDeleteParams,
    importParams,
    exportParams,
    updateParamStatus,
    isLoading:
      createParamMutation.isPending ||
      updateParamMutation.isPending ||
      deleteParamMutation.isPending ||
      batchDeleteParamsMutation.isPending ||
      importParamsMutation.isPending ||
      exportParamsMutation.isPending,
    isSaving: createParamMutation.isPending || updateParamMutation.isPending,
  };
};
