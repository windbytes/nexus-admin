import type { Endpoint, EndpointFormData, EndpointSearchParams } from '@/services/integrated/endpoint/endpointApi';
import { endpointService } from '@/services/integrated/endpoint/endpointApi';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { App, Card } from 'antd';
import type React from 'react';
import { lazy, useCallback, useReducer, useState } from 'react';
import EndpointSearchForm from './components/EndpointSearchForm';
import EndpointTable from './components/EndpointTable';
import EndpointTableActions from './components/EndpointTableActions';

const EndpointModal = lazy(() => import('./components/EndpointModal'));

/**
 * 页面状态定义
 */
interface PageState {
  modalVisible: boolean;
  modalTitle: string;
  currentRecord: Partial<Endpoint> | null;
  isViewMode: boolean;
  selectedRowKeys: React.Key[];
  selectedRows: Endpoint[];
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
 * 端点维护主页面
 */
const Endpoint: React.FC = () => {
  const { modal, message } = App.useApp();

  // 页面状态管理
  const [state, dispatch] = useReducer(
    (prev: PageState, action: Partial<PageState>) => ({
      ...prev,
      ...action,
    }),
    {
      modalVisible: false,
      modalTitle: '新增端点',
      currentRecord: null,
      isViewMode: false,
      selectedRowKeys: [],
      selectedRows: [],
    }
  );

  // 搜索参数管理
  const [searchParams, setSearchParams] = useState<EndpointSearchParams>({
    pageNum: 1,
    pageSize: 20,
  });

  // 查询端点列表
  const {
    data: result,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['endpoint_list', searchParams],
    queryFn: () => endpointService.getEndpointList(searchParams),
  });

  // 新增/编辑端点 mutation
  const saveEndpointMutation = useMutation({
    mutationFn: (data: EndpointFormData) => {
      if (data.id) {
        return endpointService.updateEndpoint(data);
      }
      return endpointService.addEndpoint(data);
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

  // 删除端点 mutation
  const deleteEndpointMutation = useMutation({
    mutationFn: (id: string) => endpointService.deleteEndpoint(id),
    onSuccess: () => {
      message.success('删除成功！');
      refetch();
    },
    onError: (error: any) => {
      message.error(`删除失败：${error.message}`);
    },
  });

  // 批量删除端点 mutation
  const batchDeleteEndpointMutation = useMutation({
    mutationFn: (ids: string[]) => endpointService.batchDeleteEndpoint(ids),
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

  // 更新端点状态 mutation
  const updateStatusMutation = useMutation({
    mutationFn: (data: EndpointFormData) => endpointService.updateEndpoint(data),
    onSuccess: () => {
      message.success('状态更新成功！');
      refetch();
    },
    onError: (error: any) => {
      message.error(`状态更新失败：${error.message}`);
    },
  });

  // 导出端点配置 mutation
  const exportConfigMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => endpointService.exportConfig(id, name),
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
    (values: Omit<EndpointSearchParams, 'pageNum' | 'pageSize'>) => {
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
      modalTitle: '新增端点',
      currentRecord: null,
      isViewMode: false,
    });
  }, []);

  /**
   * 处理查看
   */
  const handleView = useCallback((record: Endpoint) => {
    dispatch({
      modalVisible: true,
      modalTitle: '查看端点',
      currentRecord: record,
      isViewMode: true,
    });
  }, []);

  /**
   * 处理编辑
   */
  const handleEdit = useCallback((record: Endpoint) => {
    dispatch({
      modalVisible: true,
      modalTitle: '编辑端点',
      currentRecord: record,
      isViewMode: false,
    });
  }, []);

  /**
   * 处理删除
   */
  const handleDelete = useCallback(
    (record: Endpoint) => {
      modal.confirm({
        title: '确认删除',
        icon: <ExclamationCircleOutlined />,
        content: `确定要删除端点"${record.name}"吗？此操作不可恢复。`,
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          deleteEndpointMutation.mutate(record.id);
        },
      });
    },
    [modal, deleteEndpointMutation]
  );

  /**
   * 处理批量删除
   */
  const handleBatchDelete = useCallback(() => {
    if (state.selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的端点！');
      return;
    }

    modal.confirm({
      title: '确认批量删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${state.selectedRowKeys.length} 个端点吗？此操作不可恢复。`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        batchDeleteEndpointMutation.mutate(state.selectedRowKeys as string[]);
      },
    });
  }, [state.selectedRowKeys, modal, message, batchDeleteEndpointMutation]);

  /**
   * 处理导出
   */
  const handleExport = useCallback(
    (record: Endpoint) => {
      exportConfigMutation.mutate({
        id: record.id,
        name: record.name,
      });
    },
    [exportConfigMutation]
  );

  /**
   * 处理批量导出
   */
  const handleBatchExport = useCallback(() => {
    if (state.selectedRowKeys.length === 0) {
      message.warning('请先选择要导出的端点！');
      return;
    }

    // 逐个导出选中的端点
    state.selectedRows.forEach((record) => {
      exportConfigMutation.mutate({
        id: record.id,
        name: record.name,
      });
    });
  }, [state.selectedRowKeys, state.selectedRows, message, exportConfigMutation]);

  /**
   * 处理导入
   */
  const handleImport = () => {
    message.info('导入功能开发中...');
  };

  /**
   * 处理测试
   */
  const handleTest = useCallback(
    (record: Endpoint) => {
      message.info(`测试端点：${record.name}（功能开发中...）`);
      // TODO: 实现端点测试功能
    },
    [message]
  );

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
    (record: Endpoint, checked: boolean) => {
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
  const handleSelectionChange = useCallback((selectedRowKeys: React.Key[], selectedRows: Endpoint[]) => {
    dispatch({
      selectedRowKeys,
      selectedRows,
    });
  }, []);

  /**
   * 处理弹窗确认
   */
  const handleModalOk = useCallback(
    (values: EndpointFormData) => {
      saveEndpointMutation.mutate(values);
    },
    [saveEndpointMutation]
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
    deleteEndpointMutation.isPending ||
    batchDeleteEndpointMutation.isPending ||
    updateStatusMutation.isPending ||
    exportConfigMutation.isPending;

  return (
    <div className="h-full flex flex-col gap-4">
      {/* 搜索表单 */}
      <EndpointSearchForm onSearch={handleSearch} loading={isLoading} />

      {/* 表格区域 */}
      <Card className="flex-1">
        {/* 表格操作按钮 */}
        <EndpointTableActions
          onAdd={handleAdd}
          onBatchDelete={handleBatchDelete}
          onImport={handleImport}
          onBatchExport={handleBatchExport}
          onRefresh={handleRefresh}
          selectedRowKeys={state.selectedRowKeys}
          loading={tableLoading}
        />

        {/* 端点表格 */}
        <EndpointTable
          data={result?.records || []}
          loading={tableLoading}
          selectedRowKeys={state.selectedRowKeys}
          onSelectionChange={handleSelectionChange}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onExport={handleExport}
          onTest={handleTest}
          onStatusChange={handleStatusChange}
          pagination={{
            pageSize: searchParams.pageSize,
            current: searchParams.pageNum,
            ...PAGINATION_CONFIG,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            total: result?.totalRow ?? 0,
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
      <EndpointModal
        open={state.modalVisible}
        title={state.modalTitle}
        loading={saveEndpointMutation.isPending}
        {...(state.currentRecord && { initialValues: state.currentRecord })}
        isViewMode={state.isViewMode}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      />
    </div>
  );
};

export default Endpoint;
