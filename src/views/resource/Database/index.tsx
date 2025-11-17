import type { DatabaseDriver, DriverFormData, DriverSearchParams } from '@/services/resource/database/driverApi';
import { driverService } from '@/services/resource/database/driverApi';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { App, Card } from 'antd';
import type React from 'react';
import { useCallback, useReducer, useState } from 'react';
import DriverModal from './components/DriverModal';
import DriverSearchForm from './components/DriverSearchForm';
import DriverTable from './components/DriverTable';
import DriverTableActions from './components/DriverTableActions';

/**
 * 页面状态定义
 */
interface PageState {
  modalVisible: boolean;
  modalTitle: string;
  currentRecord: Partial<DatabaseDriver> | null;
  selectedRowKeys: React.Key[];
  selectedRows: DatabaseDriver[];
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
 * 数据库驱动维护模块
 */
const Database: React.FC = () => {
  const { modal, message } = App.useApp();

  // 页面状态管理
  const [state, dispatch] = useReducer(
    (prev: PageState, action: Partial<PageState>) => ({
      ...prev,
      ...action,
    }),
    {
      modalVisible: false,
      modalTitle: '新增驱动',
      currentRecord: null,
      selectedRowKeys: [],
      selectedRows: [],
    }
  );

  // 搜索参数管理
  const [searchParams, setSearchParams] = useState<DriverSearchParams>({
    pageNum: 1,
    pageSize: 20,
  });

  // 查询驱动列表
  const {
    data: result,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['driver_list', searchParams],
    queryFn: () => driverService.getDriverList(searchParams),
  });

  // 新增/编辑驱动 mutation
  const saveDriverMutation = useMutation({
    mutationFn: (data: DriverFormData) => {
      if (data.id) {
        return driverService.updateDriver(data);
      }
      return driverService.addDriver(data);
    },
    onSuccess: () => {
      dispatch({
        modalVisible: false,
        currentRecord: null,
      });
      refetch();
    },
  });

  // 删除驱动 mutation
  const deleteDriverMutation = useMutation({
    mutationFn: (id: string) => driverService.deleteDriver(id),
    onSuccess: () => {
      message.success('删除成功！');
      refetch();
    },
    onError: (error: any) => {
      message.error(`删除失败：${error.message}`);
    },
  });

  // 批量删除驱动 mutation
  const batchDeleteDriverMutation = useMutation({
    mutationFn: (ids: string[]) => driverService.batchDeleteDriver(ids),
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

  // 更新驱动状态 mutation
  const updateStatusMutation = useMutation({
    mutationFn: (data: DriverFormData) => driverService.updateDriver(data),
    onSuccess: () => {
      message.success('状态更新成功！');
      refetch();
    },
    onError: (error: any) => {
      message.error(`状态更新失败：${error.message}`);
    },
  });

  // 下载驱动 mutation
  const downloadDriverMutation = useMutation({
    mutationFn: ({ id, fileName }: { id: string; fileName: string }) => driverService.downloadDriver(id, fileName),
  });

  // 批量下载驱动 mutation
  const batchDownloadDriverMutation = useMutation({
    mutationFn: (ids: string[]) => driverService.batchDownloadDriver(ids),
    onSuccess: () => {
      message.success('批量下载成功！');
    },
    onError: (error: any) => {
      message.error(`批量下载失败：${error.message}`);
    },
  });

  /**
   * 处理搜索
   */
  const handleSearch = useCallback(
    (values: Omit<DriverSearchParams, 'pageNum' | 'pageSize'>) => {
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
      modalTitle: '新增驱动',
      currentRecord: null,
    });
  }, []);

  /**
   * 处理编辑
   */
  const handleEdit = useCallback((record: DatabaseDriver) => {
    dispatch({
      modalVisible: true,
      modalTitle: '编辑驱动',
      currentRecord: record,
    });
  }, []);

  /**
   * 处理删除
   */
  const handleDelete = useCallback(
    (record: DatabaseDriver) => {
      modal.confirm({
        title: '确认删除',
        icon: <ExclamationCircleOutlined />,
        content: `确定要删除驱动"${record.name}"吗？此操作不可恢复。`,
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          deleteDriverMutation.mutate(record.id);
        },
      });
    },
    [modal, deleteDriverMutation]
  );

  /**
   * 处理批量删除
   */
  const handleBatchDelete = useCallback(() => {
    if (state.selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的驱动！');
      return;
    }

    modal.confirm({
      title: '确认批量删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${state.selectedRowKeys.length} 个驱动吗？此操作不可恢复。`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        batchDeleteDriverMutation.mutate(state.selectedRowKeys as string[]);
      },
    });
  }, [state.selectedRowKeys, modal, message, batchDeleteDriverMutation]);

  /**
   * 处理下载
   */
  const handleDownload = useCallback(
    (record: DatabaseDriver) => {
      downloadDriverMutation.mutate({
        id: record.id,
        fileName: record.fileName,
      });
    },
    [downloadDriverMutation]
  );

  /**
   * 处理批量下载
   */
  const handleBatchDownload = useCallback(() => {
    if (state.selectedRowKeys.length === 0) {
      message.warning('请先选择要下载的驱动！');
      return;
    }

    batchDownloadDriverMutation.mutate(state.selectedRowKeys as string[]);
  }, [state.selectedRowKeys, message, batchDownloadDriverMutation]);

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
    (record: DatabaseDriver, checked: boolean) => {
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
  const handleSelectionChange = useCallback((selectedRowKeys: React.Key[], selectedRows: DatabaseDriver[]) => {
    dispatch({
      selectedRowKeys,
      selectedRows,
    });
  }, []);

  /**
   * 处理弹窗确认
   */
  const handleModalOk = useCallback(
    (values: DriverFormData) => {
      saveDriverMutation.mutate(values);
    },
    [saveDriverMutation]
  );

  /**
   * 处理弹窗取消
   */
  const handleModalCancel = useCallback(() => {
    dispatch({
      modalVisible: false,
      currentRecord: null,
    });
  }, []);

  // 表格加载状态
  const tableLoading =
    isLoading ||
    deleteDriverMutation.isPending ||
    batchDeleteDriverMutation.isPending ||
    updateStatusMutation.isPending ||
    downloadDriverMutation.isPending ||
    batchDownloadDriverMutation.isPending;

  return (
    <div className="h-full flex flex-col gap-2">
      {/* 搜索表单 */}
      <DriverSearchForm onSearch={handleSearch} loading={isLoading} />

      {/* 表格区域 */}
      <Card className="flex-1">
        {/* 表格操作按钮 */}
        <DriverTableActions
          onAdd={handleAdd}
          onBatchDelete={handleBatchDelete}
          onBatchDownload={handleBatchDownload}
          onRefresh={handleRefresh}
          selectedRowKeys={state.selectedRowKeys}
          loading={tableLoading}
        />

        {/* 驱动表格 */}
        <DriverTable
          data={result?.records || []}
          loading={tableLoading}
          selectedRowKeys={state.selectedRowKeys}
          onSelectionChange={handleSelectionChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDownload={handleDownload}
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

      {/* 新增/编辑弹窗 */}
      <DriverModal
        open={state.modalVisible}
        title={state.modalTitle}
        loading={saveDriverMutation.isPending}
        initialValues={state.currentRecord}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      />
    </div>
  );
};

export default Database;
