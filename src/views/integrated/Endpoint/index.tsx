import type { EndpointFormData, EndpointSearchParams } from '@/services/integrated/endpoint/endpointApi';
import { endpointService } from '@/services/integrated/endpoint/endpointApi';
import { useQuery } from '@tanstack/react-query';
import { Card, Spin } from 'antd';
import type React from 'react';
import { lazy, Suspense, useCallback, useState } from 'react';
import EndpointSearchForm from './components/EndpointSearchForm';
import EndpointTable from './components/EndpointTable';
import EndpointTableActions from './components/EndpointTableActions';
import { useDrawerState } from './hooks/useDrawerState';
import { useEndpointHandlers } from './hooks/useEndpointHandlers';
import { useEndpointMutations } from './hooks/useEndpointMutations';
import { useEndpointTest } from './hooks/useEndpointTest';

// 懒加载组件
const EndpointModal = lazy(() => import('./components/EndpointModal'));
const EndpointTestDrawer = lazy(() => import('./components/EndpointTestDrawer'));
const EndpointDetailDrawer = lazy(() => import('./components/EndpointDetailDrawer'));
const EndpointVersionDrawer = lazy(() => import('./components/EndpointVersionDrawer'));
const EndpointLogDrawer = lazy(() => import('./components/EndpointLogDrawer'));
/** 调用链路追踪Modal */
const EndpointCallChainTraceModal = lazy(() => import('./components/EndpointCallChainTraceModal'));
/** 依赖关系图谱Drawer */
const EndpointDependenciesDrawer = lazy(() => import('./components/EndpointDependenciesDrawer'));

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
 *
 * 功能说明：
 * - 端点的增删改查操作
 * - 端点搜索与筛选
 * - 端点测试与详情查看
 * - 端点版本管理与日志查看
 * - 端点批量操作（删除、导出、导入）
 *
 * 注意：统计功能已迁移至 /src/views/statics/Endpoint/index.tsx
 */
const Endpoint: React.FC = () => {
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

  // Modal/Drawer状态管理
  const { state, modalActions, drawerActions, selectionActions } = useDrawerState();

  // 稳定的回调函数引用
  const handleMutationSuccess = useCallback(() => {
    refetch();
    modalActions.close();
  }, [refetch, modalActions.close]);

  const handleClearSelection = useCallback(() => {
    selectionActions.clearSelection();
  }, [selectionActions.clearSelection]);

  // Mutations管理
  const mutations = useEndpointMutations(handleMutationSuccess, handleClearSelection);

  // 端点处理器Hook
  const { tableHandlers, actionHandlers } = useEndpointHandlers({
    modalActions,
    drawerActions,
    selectionActions,
    mutations: {
      deleteEndpoint: mutations.deleteEndpoint,
      batchDeleteEndpoint: mutations.batchDeleteEndpoint,
      exportConfig: mutations.exportConfig,
      updateStatus: mutations.updateStatus,
    },
    selectedData: {
      selectedRowKeys: state.selectedRowKeys,
      selectedRows: state.selectedRows,
    },
    onRefresh: refetch,
  });

  // 端点测试Hook
  const { executeTest } = useEndpointTest();

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
   * 版本恢复处理
   */
  const handleRestoreVersion = useCallback(async () => {
    // 模拟API调用
    // TODO: 实际应该调用后端API进行版本恢复
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  }, []);

  /**
   * 处理弹窗确认
   */
  const handleModalOk = useCallback(
    (values: EndpointFormData) => {
      mutations.saveEndpoint.mutate(values);
    },
    [mutations.saveEndpoint]
  );

  // 表格加载状态
  const tableLoading = isLoading || mutations.isLoading;

  return (
    <>
      <div className="h-full flex flex-col gap-4 p-4">
        {/* 搜索表单 */}
        <EndpointSearchForm onSearch={handleSearch} loading={isLoading} />

        {/* 表格区域 */}
        <Card className="flex-1">
          {/* 表格操作按钮 */}
          <EndpointTableActions {...actionHandlers} selectedRowKeys={state.selectedRowKeys} loading={tableLoading} />

          {/* 端点表格 */}
          <EndpointTable
            data={result?.records || []}
            loading={tableLoading}
            selectedRowKeys={state.selectedRowKeys}
            {...tableHandlers}
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
      </div>
      {/* 新增/编辑/查看弹窗 */}
      <Suspense fallback={<Spin />}>
        <EndpointModal
          open={state.modalVisible}
          title={state.modalTitle}
          loading={mutations.saveEndpoint.isPending}
          {...(state.currentRecord && { initialValues: state.currentRecord })}
          isViewMode={state.isViewMode}
          onOk={handleModalOk}
          onCancel={modalActions.close}
        />
      </Suspense>

      {/* 测试抽屉 */}
      {state.testDrawerVisible && (
        <Suspense fallback={null}>
          <EndpointTestDrawer
            open={state.testDrawerVisible}
            endpoint={state.testEndpoint}
            onClose={drawerActions.closeTest}
            onTest={executeTest}
          />
        </Suspense>
      )}

      {/* 详情抽屉 */}
      {state.detailDrawerVisible && (
        <Suspense fallback={null}>
          <EndpointDetailDrawer
            open={state.detailDrawerVisible}
            endpoint={state.detailEndpoint}
            onClose={drawerActions.closeDetail}
          />
        </Suspense>
      )}

      {/* 版本管理抽屉 */}
      {state.versionDrawerVisible && (
        <Suspense fallback={null}>
          <EndpointVersionDrawer
            open={state.versionDrawerVisible}
            endpoint={state.versionEndpoint}
            onClose={drawerActions.closeVersion}
            onRestore={handleRestoreVersion}
          />
        </Suspense>
      )}

      {/* 日志查看抽屉 */}
      {state.logDrawerVisible && (
        <Suspense fallback={null}>
          <EndpointLogDrawer
            open={state.logDrawerVisible}
            endpoint={state.logEndpoint}
            onClose={drawerActions.closeLog}
          />
        </Suspense>
      )}

      {/* 调用链路追踪弹窗 */}
      {state.callChainTraceModalVisible && (
        <Suspense fallback={null}>
          <EndpointCallChainTraceModal
            open={state.callChainTraceModalVisible}
            endpoint={state.callChainTraceEndpoint}
            onClose={modalActions.closeCallChainTrace}
          />
        </Suspense>
      )}

      {/* 依赖关系图谱抽屉 */}
      {state.dependenciesDrawerVisible && (
        <Suspense fallback={null}>
          <EndpointDependenciesDrawer
            open={state.dependenciesDrawerVisible}
            endpoint={state.dependenciesEndpoint}
            onClose={drawerActions.closeDependencies}
          />
        </Suspense>
      )}
    </>
  );
};

export default Endpoint;
