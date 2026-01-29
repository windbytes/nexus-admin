import { useQuery } from '@tanstack/react-query';
import { useLocation } from '@tanstack/react-router';
import { Card, Divider, Spin } from 'antd';
import type React from 'react';
import { lazy, Suspense, useEffect, useState } from 'react';
import type { EndpointModel } from '@/services/integrated/endpoint/endpointApi';
import { endpointService } from '@/services/integrated/endpoint/endpointApi';
import EndpointTable from './components/EndpointTable';
import SearchForm from './components/SearchForm';
import TableActionButtons from './components/TableActionButtons';
import { useEndpointActions } from './hooks/useEndpointActions';
import { useEndpointModals } from './hooks/useEndpointModals';
import { useEndpointPermissions } from './hooks/useEndpointPermissions';
import type { EndpointSearchParams } from './types';

// 懒加载组件
const EndpointModal = lazy(() => import('./components/EndpointModal/index'));
const EndpointTestDrawer = lazy(() => import('./components/EndpointTestDrawer'));
const EndpointDetailDrawer = lazy(() => import('./components/EndpointDetailDrawer'));
const EndpointVersionDrawer = lazy(() => import('./components/EndpointVersionDrawer'));
const EndpointLogDrawer = lazy(() => import('./components/EndpointLogDrawer'));
/** 调用链路追踪Modal */
const EndpointCallChainTraceModal = lazy(() => import('./components/EndpointCallChainTraceModal'));
/** 依赖关系图谱Drawer */
const EndpointDependenciesDrawer = lazy(() => import('./components/EndpointDependenciesDrawer'));

// 1. 定义状态类型
type EndpointState = {
  type: string;
  action: 'create' | 'edit' | 'view';
};

/**
 * 端点维护主页面
 */
const Endpoint: React.FC = () => {
  const location = useLocation();
  const routeState = location.state as unknown as EndpointState;
  const { type, action } = routeState || {};
  // 窗口管理hook
  const { modal, drawer, current, initialValues, openModal, closeModal, openDrawer, closeDrawer } = useEndpointModals();
  // 选中的行
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  // 表格数据总数
  const [total, setTotal] = useState<number>(0);
  // 查询参数
  const [searchParams, setSearchParams] = useState<EndpointSearchParams>({
    pageNum: 1,
    pageSize: 20,
  });
  // 权限列表
  const permissions = useEndpointPermissions();

  // 查询端点数据
  const {
    isFetching,
    data: result,
    refetch,
  } = useQuery({
    queryKey: ['endpoint_list', searchParams],
    queryFn: () => endpointService.getEndpointList(searchParams),
  });

  // 同步分页总数
  useEffect(() => {
    if (searchParams.pageNum === 1) {
      setTotal(result?.totalRow || 0);
    }
  }, [searchParams.pageNum, result?.totalRow]);

  // 通用成功回调
  const handleSuccess = () => {
    setSelectedRowKeys([]);
    refetch();
  };

  // 端点操作hook
  const { deleteEndpoint, batchDeleteEndpoint, handleModalSave, isLoading } = useEndpointActions({
    currentRow: current,
    onSuccess: handleSuccess,
  });

  /**
   * 监听路由参数，当 action=create 时自动打开新增弹窗
   */
  useEffect(() => {
    if (action === 'create') {
      // 构建初始值，如果传了 type 参数，则设置 endpointType
      const initial = type ? { endpointType: type } : undefined;
      openModal('add', undefined, initial);
      // 清除state中的type和action
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [action, type, openModal]);

  // 处理搜索
  const handleSearch = (values: Omit<EndpointSearchParams, 'pageNum' | 'pageSize'>) => {
    setSearchParams({
      ...values,
      pageNum: 1,
      pageSize: searchParams.pageSize,
    });
  };

  // 处理分页变化
  const handlePageChange = (page: number, pageSize?: number) => {
    setSearchParams((prev) => ({
      ...prev,
      pageNum: page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  // 处理行选择变化
  const handleSelectionChange = (keys: React.Key[], _rows: EndpointModel[]) => {
    setSelectedRowKeys(keys as string[]);
  };

  // 批量删除
  const handleBatchDelete = (ids: string[]) => {
    if (!permissions.canDeleteEndpoint) {
      return;
    }
    batchDeleteEndpoint(ids);
  };

  // 表格加载状态
  const tableLoading = isFetching || isLoading;

  return (
    <>
      <div className="h-full flex flex-col gap-2">
        {/* 端点搜索栏 */}
        <SearchForm onSearch={handleSearch} loading={isFetching} />
        {/* 端点数据表格 */}
        <Card
          className="grow min-h-0 flex flex-col"
          classNames={{ body: 'flex grow' }}
          title={
            <div className="flex items-center">
              <h2>端点列表</h2>
              <Divider orientation="vertical" />
              <span className="text-sm! text-gray-500">{`已选 ${selectedRowKeys.length} 项`}</span>
              <Divider orientation="vertical" />
              <TableActionButtons
                handleBatchDelete={() => handleBatchDelete(selectedRowKeys)}
                refetch={refetch}
                selectedRows={selectedRowKeys}
                openModal={openModal}
              />
            </div>
          }
        >
          <EndpointTable
            datasource={result?.records || []}
            loading={tableLoading}
            pagination={{
              pageNum: searchParams.pageNum,
              pageSize: searchParams.pageSize,
              total: total,
            }}
            selectedRowKeys={selectedRowKeys}
            currentRow={current}
            onSelectionChange={handleSelectionChange}
            onPageChange={handlePageChange}
            onSuccess={handleSuccess}
            openModal={openModal}
            openDrawer={openDrawer}
          />
        </Card>
      </div>
      {/* 新增/编辑/查看/克隆弹窗 */}
      <Suspense fallback={<Spin />}>
        <EndpointModal
          open={modal === 'add' || modal === 'edit' || modal === 'view' || modal === 'clone'}
          title={
            modal === 'add' ? '新增端点' : modal === 'edit' ? '编辑端点' : modal === 'clone' ? '克隆端点' : '查看端点'
          }
          loading={isLoading}
          {...(current && { initialValues: current })}
          {...(initialValues && !current && { initialValues })}
          isViewMode={modal === 'view'}
          onOk={handleModalSave}
          onCancel={closeModal}
        />
      </Suspense>

      {/* 调用链路追踪弹窗 */}
      {modal === 'callChainTrace' && (
        <Suspense fallback={null}>
          <EndpointCallChainTraceModal open={modal === 'callChainTrace'} endpoint={current} onClose={closeModal} />
        </Suspense>
      )}

      {/* 测试抽屉 */}
      {drawer === 'test' && (
        <Suspense fallback={null}>
          <EndpointTestDrawer
            open={drawer === 'test'}
            endpoint={current}
            onClose={closeDrawer}
            onTest={async () => {
              // 模拟测试逻辑
              return {
                status: 'success' as const,
                message: '端点连接测试成功',
                responseTime: 100,
                timestamp: new Date().toISOString(),
              };
            }}
          />
        </Suspense>
      )}

      {/* 详情抽屉 */}
      {drawer === 'detail' && (
        <Suspense fallback={null}>
          <EndpointDetailDrawer open={drawer === 'detail'} endpoint={current} onClose={closeDrawer} />
        </Suspense>
      )}

      {/* 版本管理抽屉 */}
      {drawer === 'version' && (
        <Suspense fallback={null}>
          <EndpointVersionDrawer
            open={drawer === 'version'}
            endpoint={current}
            onClose={closeDrawer}
            onRestore={async () => {
              // 版本恢复处理
              return Promise.resolve();
            }}
          />
        </Suspense>
      )}

      {/* 日志查看抽屉 */}
      {drawer === 'log' && (
        <Suspense fallback={null}>
          <EndpointLogDrawer open={drawer === 'log'} endpoint={current} onClose={closeDrawer} />
        </Suspense>
      )}

      {/* 依赖关系图谱抽屉 */}
      {drawer === 'dependencies' && (
        <Suspense fallback={null}>
          <EndpointDependenciesDrawer open={drawer === 'dependencies'} endpoint={current} onClose={closeDrawer} />
        </Suspense>
      )}
    </>
  );
};
export default Endpoint;
