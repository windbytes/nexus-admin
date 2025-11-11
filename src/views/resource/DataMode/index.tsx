import type { DataModeFormData, DataModeSearchParams, JsonDataMode } from '@/services/resource/datamode/dataModeApi';
import { dataModeService } from '@/services/resource/datamode/dataModeApi';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { App, Card } from 'antd';
import type React from 'react';
import { useCallback, useReducer, useState } from 'react';
import DataModeModal from './components/DataModeModal';
import DataModeSearchForm from './components/DataModeSearchForm';
import DataModeTable from './components/DataModeTable';
import DataModeTableActions from './components/DataModeTableActions';

/**
 * 页面状态定义
 */
interface PageState {
  modalVisible: boolean;
  modalTitle: string;
  currentRecord: Partial<JsonDataMode> | null;
  isViewMode: boolean;
  selectedRowKeys: React.Key[];
  selectedRows: JsonDataMode[];
}

/**
 * 分页配置常量
 */
const PAGINATION_CONFIG = {
  showQuickJumper: true,
  showSizeChanger: true,
  hideOnSinglePage: false,
  pageSizeOptions: ['10', '20', '50', '100'],
};

/**
 * JSON数据模式维护模块
 */
const DataMode: React.FC = () => {
  const { modal, message } = App.useApp();

  // 页面状态管理
  const [state, dispatch] = useReducer(
    (prev: PageState, action: Partial<PageState>) => ({
      ...prev,
      ...action,
    }),
    {
      modalVisible: false,
      modalTitle: '新增JSON数据模式',
      currentRecord: null,
      isViewMode: false,
      selectedRowKeys: [],
      selectedRows: [],
    }
  );

  // 搜索参数管理
  const [searchParams, setSearchParams] = useState<DataModeSearchParams>({
    pageNum: 1,
    pageSize: 20,
  });

  // 查询数据模式列表
  const {
    data: result,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['datamode_list', searchParams],
    queryFn: () => dataModeService.getDataModeList(searchParams),
  });

  // 新增/编辑数据模式 mutation
  const saveDataModeMutation = useMutation({
    mutationFn: (data: DataModeFormData) => {
      if (data.id) {
        return dataModeService.updateDataMode(data);
      }
      return dataModeService.addDataMode(data);
    },
    onSuccess: () => {
      message.success(state.currentRecord?.id ? '编辑成功！' : '新增成功！');
      dispatch({
        modalVisible: false,
        currentRecord: null,
        isViewMode: false,
      });
      refetch();
    },
    onError: (error: any) => {
      message.error(`操作失败：${error.message}`);
    },
  });

  // 删除数据模式 mutation
  const deleteDataModeMutation = useMutation({
    mutationFn: (id: string) => dataModeService.deleteDataMode(id),
    onSuccess: () => {
      message.success('删除成功！');
      refetch();
    },
    onError: (error: any) => {
      message.error(`删除失败：${error.message}`);
    },
  });

  // 批量删除数据模式 mutation
  const batchDeleteDataModeMutation = useMutation({
    mutationFn: (ids: string[]) => dataModeService.batchDeleteDataMode(ids),
    onSuccess: () => {
      message.success('批量删除成功！');
      dispatch({
        selectedRowKeys: [],
        selectedRows: [],
      });
      refetch();
    },
    onError: (error: any) => {
      message.error(`批量删除失败：${error.message}`);
    },
  });

  // 更新数据模式状态 mutation
  const updateStatusMutation = useMutation({
    mutationFn: (data: DataModeFormData) => dataModeService.updateDataMode(data),
    onSuccess: () => {
      message.success('状态更新成功！');
      refetch();
    },
    onError: (error: any) => {
      message.error(`状态更新失败：${error.message}`);
    },
  });

  // 导出Schema mutation
  const exportSchemaMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => dataModeService.exportSchema(id, name),
    onSuccess: () => {
      message.success('导出成功！');
    },
    onError: (error: any) => {
      message.error(`导出失败：${error.message}`);
    },
  });

  /**
   * 处理搜索
   */
  const handleSearch = useCallback(
    (values: Omit<DataModeSearchParams, 'pageNum' | 'pageSize'>) => {
      setSearchParams({
        ...values,
        pageNum: 1,
        pageSize: searchParams.pageSize,
      });
    },
    [searchParams.pageSize]
  );

  /**
   * 处理新增
   */
  const handleAdd = useCallback(() => {
    dispatch({
      modalVisible: true,
      modalTitle: '新增JSON数据模式',
      currentRecord: null,
      isViewMode: false,
    });
  }, []);

  /**
   * 处理查看
   */
  const handleView = useCallback((record: JsonDataMode) => {
    dispatch({
      modalVisible: true,
      modalTitle: '查看JSON数据模式',
      currentRecord: record,
      isViewMode: true,
    });
  }, []);

  /**
   * 处理编辑
   */
  const handleEdit = useCallback((record: JsonDataMode) => {
    dispatch({
      modalVisible: true,
      modalTitle: '编辑JSON数据模式',
      currentRecord: record,
      isViewMode: false,
    });
  }, []);

  /**
   * 处理删除
   */
  const handleDelete = useCallback(
    (record: JsonDataMode) => {
      modal.confirm({
        title: '确认删除',
        icon: <ExclamationCircleOutlined />,
        content: `确定要删除JSON数据模式"${record.name}"吗？此操作不可恢复。`,
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          deleteDataModeMutation.mutate(record.id);
        },
      });
    },
    [modal, deleteDataModeMutation]
  );

  /**
   * 处理批量删除
   */
  const handleBatchDelete = useCallback(() => {
    if (state.selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的JSON数据模式！');
      return;
    }

    modal.confirm({
      title: '确认批量删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${state.selectedRowKeys.length} 个JSON数据模式吗？此操作不可恢复。`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        batchDeleteDataModeMutation.mutate(state.selectedRowKeys as string[]);
      },
    });
  }, [state.selectedRowKeys, modal, message, batchDeleteDataModeMutation]);

  /**
   * 处理导出
   */
  const handleExport = useCallback(
    (record: JsonDataMode) => {
      exportSchemaMutation.mutate({
        id: record.id,
        name: record.name,
      });
    },
    [exportSchemaMutation]
  );

  /**
   * 处理批量导出
   */
  const handleBatchExport = useCallback(() => {
    if (state.selectedRowKeys.length === 0) {
      message.warning('请先选择要导出的JSON数据模式！');
      return;
    }

    // 逐个导出选中的Schema
    state.selectedRows.forEach((record) => {
      exportSchemaMutation.mutate({
        id: record.id,
        name: record.name,
      });
    });
  }, [state.selectedRowKeys, state.selectedRows, message, exportSchemaMutation]);

  /**
   * 处理刷新
   */
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  /**
   * 处理状态变更
   */
  const handleStatusChange = useCallback(
    (record: JsonDataMode, checked: boolean) => {
      updateStatusMutation.mutate({
        ...record,
        status: checked,
      });
    },
    [updateStatusMutation]
  );

  /**
   * 处理选择变更
   */
  const handleSelectionChange = useCallback((selectedRowKeys: React.Key[], selectedRows: JsonDataMode[]) => {
    dispatch({
      selectedRowKeys,
      selectedRows,
    });
  }, []);

  /**
   * 处理弹窗确认
   */
  const handleModalOk = useCallback(
    (values: DataModeFormData) => {
      saveDataModeMutation.mutate(values);
    },
    [saveDataModeMutation]
  );

  /**
   * 处理弹窗取消
   */
  const handleModalCancel = useCallback(() => {
    dispatch({
      modalVisible: false,
      currentRecord: null,
      isViewMode: false,
    });
  }, []);

  // 表格加载状态
  const tableLoading =
    isLoading ||
    deleteDataModeMutation.isPending ||
    batchDeleteDataModeMutation.isPending ||
    updateStatusMutation.isPending ||
    exportSchemaMutation.isPending;

  return (
    <div className="h-full flex flex-col gap-2">
      {/* 搜索表单 */}
      <DataModeSearchForm onSearch={handleSearch} loading={isLoading} />

      {/* 表格区域 */}
      <Card className="flex-1">
        {/* 表格操作按钮 */}
        <DataModeTableActions
          onAdd={handleAdd}
          onBatchDelete={handleBatchDelete}
          onBatchExport={handleBatchExport}
          onRefresh={handleRefresh}
          selectedRowKeys={state.selectedRowKeys}
          loading={tableLoading}
        />

        {/* 数据模式表格 */}
        <DataModeTable
          data={result?.records || []}
          loading={tableLoading}
          selectedRowKeys={state.selectedRowKeys}
          onSelectionChange={handleSelectionChange}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onExport={handleExport}
          onStatusChange={handleStatusChange}
          pagination={{
            pageSize: searchParams.pageSize,
            current: searchParams.pageNum,
            ...PAGINATION_CONFIG,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            total: result?.total || 0,
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

      {/* 新增/编辑/查看弹窗 */}
      <DataModeModal
        open={state.modalVisible}
        title={state.modalTitle}
        loading={saveDataModeMutation.isPending}
        initialValues={state.currentRecord}
        isViewMode={state.isViewMode}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      />
    </div>
  );
};

export default DataMode;
