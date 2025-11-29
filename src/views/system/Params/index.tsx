import {
  sysParamService,
  type ExportOptions,
  type SysParam,
  type SysParamFormData,
  type SysParamSearchParams,
} from '@/services/system/params';
import { clearAllParamCache, deleteParamCache, updateParamCache } from '@/utils/paramService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { App, Card, Modal } from 'antd';
import { isEqual } from 'lodash-es';
import type React from 'react';
import { useCallback, useState } from 'react';
import ParamDrawer from './components/ParamDrawer';
import ParamTable from './components/ParamTable';
import SearchForm from './components/SearchForm';
import TableActionButtons from './components/TableActionButtons';
import { PAGINATION_CONFIG } from './config';
import './styles/params.module.scss';

const { confirm } = Modal;

/**
 * 系统参数管理
 */
const Params: React.FC = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  // 状态管理
  const [searchParams, setSearchParams] = useState<SysParamSearchParams>({
    pageNum: 1,
    pageSize: 10,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('');
  const [currentRecord, setCurrentRecord] = useState<SysParam | undefined>();
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);

  // 查询参数列表
  const {
    data: result,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['sys_params', searchParams],
    queryFn: () => sysParamService.queryParams(searchParams),
  });

  // 数据
  const total = result?.totalRow || 0;

  // 新增参数
  const createMutation = useMutation({
    mutationFn: (data: SysParamFormData) => sysParamService.createParam(data),
    onSuccess: (_, data) => {
      setDrawerVisible(false);
      queryClient.invalidateQueries({ queryKey: ['sys_params'] });

      // 更新参数缓存
      if (data.code && data.value) {
        updateParamCache(data.code, data.value);
      }
    },
  });

  // 更新参数
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: SysParamFormData }) => sysParamService.updateParam(id, data),
    onSuccess: (_, { data }) => {
      setDrawerVisible(false);
      queryClient.invalidateQueries({ queryKey: ['sys_params'] });

      // 更新参数缓存
      if (data.code && data.value) {
        updateParamCache(data.code, data.value);
      }
    },
  });

  // 删除参数
  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: number; code: string }) => sysParamService.deleteParam(id),
    onSuccess: (_, { code }) => {
      queryClient.invalidateQueries({ queryKey: ['sys_params'] });

      // 删除参数缓存
      if (code) {
        deleteParamCache(code);
      }
    },
  });

  // 批量删除参数
  const batchDeleteMutation = useMutation({
    mutationFn: ({ ids }: { ids: number[]; codes: string[] }) => sysParamService.batchDeleteParams(ids),
    onSuccess: (_, { codes }) => {
      setSelectedRowKeys([]);
      queryClient.invalidateQueries({ queryKey: ['sys_params'] });

      // 批量删除参数缓存
      if (codes && codes.length > 0) {
        codes.forEach((code) => {
          if (code) {
            deleteParamCache(code);
          }
        });
      }
    },
  });

  // 导入参数
  const importMutation = useMutation({
    mutationFn: (file: File) => sysParamService.importParams(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sys_params'] });

      // 导入可能影响多个参数，清空所有缓存
      clearAllParamCache();
    },
  });

  // 导出参数
  const exportMutation = useMutation({
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

  // 处理搜索
  const handleSearch = useCallback((values: SysParamSearchParams) => {
    const search = {
      ...values,
      pageNum: searchParams.pageNum,
      pageSize: searchParams.pageSize,
    };
    if (isEqual(search, searchParams)) {
      // 参数没有变化，手动刷新数据
      refetch();
      return;
    }
    setSearchParams((prev: SysParamSearchParams) => ({ ...prev, ...search }));
  }, []);

  // 处理新增
  const handleAdd = useCallback(() => {
    setDrawerTitle('新增参数');
    setCurrentRecord(undefined);
    setDrawerVisible(true);
  }, []);

  // 处理编辑
  const handleEdit = useCallback((record: SysParam) => {
    setDrawerTitle('编辑参数');
    setCurrentRecord(record);
    setDrawerVisible(true);
  }, []);

  // 处理删除
  const handleDelete = useCallback(
    (record: SysParam) => {
      confirm({
        title: '确认删除',
        content: `确定要删除参数"${record.name}"吗？`,
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          deleteMutation.mutate({ id: record.id, code: record.code });
        },
      });
    },
    [deleteMutation]
  );

  // 处理批量删除
  const handleBatchDelete = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的参数');
      return;
    }

    // 获取选中记录的code
    const selectedRecords = result?.records?.filter((record) => selectedRowKeys.includes(record.id)) || [];
    const selectedCodes = selectedRecords.map((record) => record.code);

    confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个参数吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        batchDeleteMutation.mutate({
          ids: selectedRowKeys as number[],
          codes: selectedCodes,
        });
      },
    });
  }, [selectedRowKeys, batchDeleteMutation, message, result?.records]);

  // 处理刷新
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // 处理导入
  const handleImport = useCallback(
    (file: File) => {
      importMutation.mutate(file);
    },
    [importMutation]
  );

  // 处理导出
  const handleExport = useCallback(
    (type: 'all' | 'selected') => {
      const exportOptions: { type: 'all' | 'selected'; selectedIds?: number[]; searchParams?: SysParamSearchParams } = {
        type,
        ...(type === 'selected' && { selectedIds: selectedRowKeys as number[] }),
        ...(type === 'all' && { searchParams }),
      };

      exportMutation.mutate(exportOptions);
    },
    [exportMutation, selectedRowKeys, searchParams]
  );

  // 处理展开搜索
  const handleToggleSearchExpand = useCallback(() => {
    setSearchExpanded((prev) => !prev);
  }, []);

  // 处理状态变更
  const handleStatusChange = useCallback(
    (record: SysParam, checked: boolean) => {
      updateMutation.mutate({
        id: record.id,
        data: { ...record, status: checked },
      });
    },
    [updateMutation]
  );

  // 处理表格选择变更
  const handleSelectionChange = useCallback((keys: React.Key[], _rows: SysParam[]) => {
    setSelectedRowKeys(keys);
  }, []);

  // 处理抽屉确认
  const handleDrawerOk = useCallback(
    (values: SysParamFormData) => {
      setDrawerLoading(true);

      if (currentRecord) {
        // 编辑模式
        updateMutation.mutate({
          id: currentRecord.id,
          data: values,
        });
      } else {
        // 新增模式
        createMutation.mutate(values);
      }

      setDrawerLoading(false);
    },
    [currentRecord, createMutation, updateMutation]
  );

  // 处理抽屉取消
  const handleDrawerCancel = useCallback(() => {
    setDrawerVisible(false);
    setCurrentRecord(undefined);
  }, []);

  // 计算加载状态
  const tableLoading =
    isLoading ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    batchDeleteMutation.isPending ||
    importMutation.isPending ||
    exportMutation.isPending;

  return (
    <div className="h-full flex flex-col params-container gap-2">
      {/* 搜索表单 */}
      <SearchForm
        onSearch={handleSearch}
        loading={isLoading}
        expanded={searchExpanded}
        onToggleExpand={handleToggleSearchExpand}
      />

      <Card className="flex-1">
        {/* 表格操作按钮 */}
        <TableActionButtons
          onAdd={handleAdd}
          onBatchDelete={handleBatchDelete}
          onRefresh={handleRefresh}
          onImport={handleImport}
          onExport={handleExport}
          selectedRowKeys={selectedRowKeys}
          loading={tableLoading}
        />

        {/* 参数表格 */}
        <ParamTable
          data={result?.records || []}
          loading={tableLoading}
          selectedRowKeys={selectedRowKeys}
          onSelectionChange={handleSelectionChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          pagination={{
            pageSize: searchParams.pageSize,
            current: searchParams.pageNum,
            ...PAGINATION_CONFIG,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            total: total,
            onChange(page, pageSize) {
              setSearchParams({
                ...searchParams,
                pageNum: page,
                pageSize: pageSize,
              });
            },
          }}
        />
      </Card>

      {/* 新增/编辑抽屉 */}
      <ParamDrawer
        open={drawerVisible}
        title={drawerTitle}
        loading={drawerLoading}
        initialValues={currentRecord}
        onOk={handleDrawerOk}
        onCancel={handleDrawerCancel}
      />
    </div>
  );
};

export default Params;
