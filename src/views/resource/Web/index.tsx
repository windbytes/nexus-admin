import type {
  WebService,
  WebServiceFormData,
  WebServiceSearchParams,
} from '@/services/resource/webservice/webServiceApi';
import { webServiceApi } from '@/services/resource/webservice/webServiceApi';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { App, Card, Modal } from 'antd';
import type React from 'react';
import { useCallback, useReducer, useState } from 'react';
import { WebServiceModal, WebServiceSearchForm, WebServiceTable, WebServiceTableActions } from './components';

const { confirm } = Modal;

/**
 * 分页配置常量
 */
const PAGINATION_CONFIG = {
  showQuickJumper: true,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
};

/**
 * 组件状态
 */
interface WebServiceState {
  modalVisible: boolean;
  modalTitle: string;
  currentRecord: Partial<WebService> | null;
  isViewMode: boolean;
  selectedRowKeys: React.Key[];
  selectedRows: WebService[];
}

/**
 * 状态操作类型
 */
type WebServiceAction = Partial<WebServiceState>;

/**
 * 状态 reducer
 */
const reducer = (state: WebServiceState, action: WebServiceAction): WebServiceState => {
  return { ...state, ...action };
};

/**
 * 初始状态
 */
const initialState: WebServiceState = {
  modalVisible: false,
  modalTitle: '',
  currentRecord: null,
  isViewMode: false,
  selectedRowKeys: [],
  selectedRows: [],
};

/**
 * Web服务管理主组件
 */
const Web: React.FC = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(reducer, initialState);

  // 搜索参数
  const [searchParams, setSearchParams] = useState<WebServiceSearchParams>({
    pageNum: 1,
    pageSize: 10,
  });

  // 查询Web服务列表
  const { data: result, isLoading } = useQuery({
    queryKey: ['webServiceList', searchParams],
    queryFn: () => webServiceApi.getWebServiceList(searchParams),
  });

  // 新增/更新Web服务
  const saveWebServiceMutation = useMutation({
    mutationFn: async (data: WebServiceFormData) => {
      if (data.id) {
        return await webServiceApi.updateWebService(data);
      }
      return await webServiceApi.addWebService(data);
    },
    onSuccess: (_, variables) => {
      message.success(`${variables.id ? '更新' : '新增'}成功！`);
      queryClient.invalidateQueries({ queryKey: ['webServiceList'] });
      handleModalCancel();
    },
    onError: (error: any) => {
      message.error(`操作失败：${error.message}`);
    },
  });

  // 删除Web服务
  const deleteWebServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      return await webServiceApi.deleteWebService(id);
    },
    onSuccess: () => {
      message.success('删除成功！');
      queryClient.invalidateQueries({ queryKey: ['webServiceList'] });
    },
    onError: (error: any) => {
      message.error(`删除失败：${error.message}`);
    },
  });

  // 批量删除Web服务
  const batchDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return await webServiceApi.batchDeleteWebService(ids);
    },
    onSuccess: () => {
      message.success('批量删除成功！');
      queryClient.invalidateQueries({ queryKey: ['webServiceList'] });
      dispatch({ selectedRowKeys: [], selectedRows: [] });
    },
    onError: (error: any) => {
      message.error(`批量删除失败：${error.message}`);
    },
  });

  // 导出WSDL
  const exportWsdlMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      return await webServiceApi.exportWsdl(id, name);
    },
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
  const handleSearch = useCallback((params: WebServiceSearchParams) => {
    setSearchParams(params);
  }, []);

  /**
   * 处理新增
   */
  const handleAdd = useCallback(() => {
    dispatch({
      modalVisible: true,
      modalTitle: '新增Web服务',
      currentRecord: null,
      isViewMode: false,
    });
  }, []);

  /**
   * 处理查看
   */
  const handleView = useCallback((record: WebService) => {
    dispatch({
      modalVisible: true,
      modalTitle: '查看Web服务',
      currentRecord: record,
      isViewMode: true,
    });
  }, []);

  /**
   * 处理编辑
   */
  const handleEdit = useCallback((record: WebService) => {
    dispatch({
      modalVisible: true,
      modalTitle: '编辑Web服务',
      currentRecord: record,
      isViewMode: false,
    });
  }, []);

  /**
   * 处理删除
   */
  const handleDelete = useCallback(
    (record: WebService) => {
      confirm({
        title: '确认删除',
        icon: <ExclamationCircleOutlined />,
        content: `确定要删除Web服务"${record.name}"吗？此操作不可恢复！`,
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          deleteWebServiceMutation.mutate(record.id);
        },
      });
    },
    [deleteWebServiceMutation]
  );

  /**
   * 处理批量删除
   */
  const handleBatchDelete = useCallback(() => {
    if (state.selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的数据！');
      return;
    }

    confirm({
      title: '确认批量删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${state.selectedRowKeys.length} 条数据吗？此操作不可恢复！`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        batchDeleteMutation.mutate(state.selectedRowKeys as string[]);
      },
    });
  }, [state.selectedRowKeys, batchDeleteMutation, message]);

  /**
   * 处理导出
   */
  const handleExport = useCallback(
    (record: WebService) => {
      exportWsdlMutation.mutate({ id: record.id, name: record.name });
    },
    [exportWsdlMutation]
  );

  /**
   * 处理状态变更
   */
  const handleStatusChange = useCallback(
    (record: WebService, checked: boolean) => {
      const updatedRecord: WebServiceFormData = {
        ...record,
        status: checked,
      };
      saveWebServiceMutation.mutate(updatedRecord);
    },
    [saveWebServiceMutation]
  );

  /**
   * 处理刷新
   */
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['webServiceList'] });
  }, [queryClient]);

  /**
   * 处理表格行选择
   */
  const handleSelectionChange = useCallback((selectedRowKeys: React.Key[], selectedRows: WebService[]) => {
    dispatch({ selectedRowKeys, selectedRows });
  }, []);

  /**
   * 处理弹窗确认
   */
  const handleModalOk = useCallback(
    (values: WebServiceFormData) => {
      saveWebServiceMutation.mutate(values);
    },
    [saveWebServiceMutation]
  );

  /**
   * 处理弹窗取消
   */
  const handleModalCancel = useCallback(() => {
    dispatch({
      modalVisible: false,
      modalTitle: '',
      currentRecord: null,
      isViewMode: false,
    });
  }, []);

  // 表格加载状态
  const tableLoading =
    isLoading ||
    saveWebServiceMutation.isPending ||
    deleteWebServiceMutation.isPending ||
    batchDeleteMutation.isPending ||
    exportWsdlMutation.isPending;

  return (
    <div className="h-full flex flex-col gap-2">
      {/* 搜索表单 */}
      <WebServiceSearchForm onSearch={handleSearch} loading={isLoading} />

      {/* 表格区域 */}
      <Card className="flex-1">
        {/* 表格操作按钮 */}
        <WebServiceTableActions
          onAdd={handleAdd}
          onBatchDelete={handleBatchDelete}
          onRefresh={handleRefresh}
          selectedRowKeys={state.selectedRowKeys}
          loading={tableLoading}
        />

        {/* Web服务表格 */}
        <WebServiceTable
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
      <WebServiceModal
        open={state.modalVisible}
        title={state.modalTitle}
        loading={saveWebServiceMutation.isPending}
        initialValues={state.currentRecord}
        isViewMode={state.isViewMode}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      />
    </div>
  );
};

export default Web;
