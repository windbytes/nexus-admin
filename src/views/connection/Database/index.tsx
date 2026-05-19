import { ExclamationCircleFilled } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { App } from 'antd';
import type React from 'react';
import { type Key, useEffect, useState } from 'react';
import ProTable from '@/components/ProTable';
import { connectionService } from '@/services/connection/database/connectionApi';
import type {
  ConnectionFormValues,
  ConnectionPoolStats,
  ConnectionSearchParams,
  DatabaseConnectionRecord,
} from '@/services/connection/database/type';
import type { DatabaseDriver } from '@/services/resource/database/driverApi';
import { driverService } from '@/services/resource/database/driverApi';
import ConnectionModal from './components/ConnectionModal';
import PoolStatsDrawer from './components/PoolStatsDrawer';
import SearchForm from './components/SearchForm';
import TableActionButtons from './components/TableActionButtons';
import { CONNECTION_PAGINATION } from './constants';
import { useConnectionTableColumns } from './hooks/useConnectionTableColumns';

interface PageModalState {
  open: boolean;
  title: string;
  record: DatabaseConnectionRecord | null;
}

interface PoolStatsState {
  open: boolean;
  record: DatabaseConnectionRecord | null;
}

/**
 * 数据库连接维护：上筛选、下表格；驱动列表来自资源模块，仅展示启用项供选择。
 */
const Database: React.FC = () => {
  const { modal, message } = App.useApp();
  const [searchParams, setSearchParams] = useState<ConnectionSearchParams>({
    pageNum: 1,
    pageSize: 20,
  });
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [modalState, setModalState] = useState<PageModalState>({
    open: false,
    title: '新增连接',
    record: null,
  });
  const [poolStatsState, setPoolStatsState] = useState<PoolStatsState>({
    open: false,
    record: null,
  });
  const [poolStatsData, setPoolStatsData] = useState<ConnectionPoolStats>();

  const {
    data: listResult,
    isFetching: listLoading,
    refetch,
  } = useQuery({
    queryKey: ['connection_database', searchParams],
    queryFn: () =>
      connectionService.page({
        ...searchParams,
        total: searchParams.pageNum === 1 ? 0 : total,
      }),
  });

  useEffect(() => {
    if (searchParams.pageNum === 1 && listResult?.totalRow !== undefined) {
      setTotal(listResult.totalRow);
    }
  }, [searchParams.pageNum, listResult?.totalRow]);

  const { data: driverPage } = useQuery({
    queryKey: ['driver_list', 'connection_selector'],
    queryFn: () =>
      driverService.getDriverList({
        pageNum: 1,
        pageSize: 500,
        status: true,
      }),
    staleTime: 120_000,
  });

  const drivers = (driverPage?.records ?? []).filter((d) => d.status !== false);

  const driversById = (() => {
    const m = new Map<string, DatabaseDriver>();
    for (const d of drivers) {
      m.set(d.id, d);
    }
    return m;
  })();

  /** 关闭新增/编辑弹窗并清理当前编辑数据。 */
  function closeModal() {
    setModalState((s) => ({ ...s, open: false, record: null }));
  }

  /** 关闭连接池指标抽屉并清空指标缓存。 */
  function closePoolStats() {
    setPoolStatsState({ open: false, record: null });
    setPoolStatsData(undefined);
  }

  const saveMutation = useMutation({
    mutationFn: async (values: ConnectionFormValues) => {
      if (values.id) {
        return connectionService.update(values);
      }
      const { id: _id, ...rest } = values;
      return connectionService.add(rest);
    },
    onSuccess: () => {
      message.success('保存成功');
      closeModal();
      setSelectedRowKeys([]);
      refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => connectionService.delete(id),
    onSuccess: () => {
      message.success('已删除');
      refetch();
    },
  });

  const batchDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => connectionService.batchDelete(ids),
    onSuccess: () => {
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      refetch();
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      enabled ? connectionService.enable(id) : connectionService.disable(id),
    onSuccess: (_, vars) => {
      message.success(vars.enabled ? '已启用并创建连接池' : '已停用并销毁连接池');
      refetch();
    },
  });

  const poolStatsMutation = useMutation({
    mutationFn: (id: string) => connectionService.poolStats(id),
    onSuccess: (data) => {
      setPoolStatsData(data);
    },
  });

  /** 根据筛选条件重置到第一页并触发列表查询。 */
  function handleSearch(values: Partial<ConnectionSearchParams>) {
    setSearchParams((prev) => ({
      ...prev,
      ...values,
      pageNum: 1,
    }));
  }

  /** 响应分页控件变更。 */
  function handlePageChange(page: number, pageSize?: number) {
    setSearchParams((prev) => ({
      ...prev,
      pageNum: page,
      pageSize: pageSize ?? prev.pageSize,
    }));
  }

  /** 打开新增连接弹窗。 */
  function handleAdd() {
    setModalState({ open: true, title: '新增连接', record: null });
  }

  /** 打开编辑连接弹窗并回填当前行。 */
  function handleEdit(record: DatabaseConnectionRecord) {
    setModalState({ open: true, title: '编辑连接', record });
  }

  /** 删除单条连接（含确认弹窗）。 */
  function handleDelete(record: DatabaseConnectionRecord) {
    modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleFilled />,
      content: `确定删除连接「${record.name}」吗？`,
      okButtonProps: { danger: true, type: 'default' },
      cancelButtonProps: { type: 'primary' },
      onOk: () => deleteMutation.mutate(record.id),
    });
  }

  /** 批量删除当前选中的连接。 */
  function handleBatchDelete() {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的连接');
      return;
    }
    modal.confirm({
      title: '确认批量删除',
      icon: <ExclamationCircleFilled />,
      content: `将删除 ${selectedRowKeys.length} 条连接，是否继续？`,
      okButtonProps: { danger: true, type: 'default' },
      cancelButtonProps: { type: 'primary' },
      onOk: () => batchDeleteMutation.mutate(selectedRowKeys),
    });
  }

  /** 同步表格勾选行。 */
  function handleSelectionChange(keys: Key[]) {
    setSelectedRowKeys(keys as string[]);
  }

  /** 启用/停用连接并触发后端连接池创建或销毁。 */
  function handleToggleStatus(record: DatabaseConnectionRecord, enabled: boolean) {
    if (record.enabled === enabled) {
      return;
    }
    modal.confirm({
      title: enabled ? '确认启用连接' : '确认停用连接',
      icon: <ExclamationCircleFilled />,
      content: enabled
        ? `将为「${record.name}」创建连接池并启用，是否继续？`
        : `将销毁「${record.name}」连接池并停用，是否继续？`,
      cancelButtonProps: { type: 'primary' },
      okButtonProps: { type: 'default' },
      onOk: () => statusMutation.mutate({ id: record.id, enabled }),
    });
  }

  /** 提交弹窗表单，统一走保存变更流程。 */
  function handleModalOk(values: ConnectionFormValues) {
    saveMutation.mutate(values);
  }

  /** 打开连接池指标抽屉并拉取最新指标。 */
  function handleViewPoolStats(record: DatabaseConnectionRecord) {
    setPoolStatsState({ open: true, record });
    setPoolStatsData(undefined);
    poolStatsMutation.mutate(record.id);
  }

  /** 手动刷新当前抽屉中的连接池指标。 */
  function handleRefreshPoolStats() {
    const id = poolStatsState.record?.id;
    if (!id) {
      return;
    }
    poolStatsMutation.mutate(id);
  }

  const columns = useConnectionTableColumns({
    driversById,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onToggleStatus: handleToggleStatus,
    onViewPoolStats: handleViewPoolStats,
    statusLoading: statusMutation.isPending,
  });

  const records = listResult?.records ?? [];
  const tableLoading =
    listLoading || deleteMutation.isPending || batchDeleteMutation.isPending || statusMutation.isPending;

  return (
    <>
      <div className="flex h-full flex-col gap-2">
        <SearchForm onSearch={handleSearch} loading={listLoading} />
        <ProTable<DatabaseConnectionRecord>
          title="连接列表"
          columns={columns}
          dataSource={records}
          loading={tableLoading}
          rowKey="id"
          actionButtons={
            <TableActionButtons
              onAdd={handleAdd}
              onRefresh={refetch}
              onBatchDelete={handleBatchDelete}
              selectedRowKeys={selectedRowKeys}
              loading={tableLoading}
            />
          }
          onRefresh={refetch}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys,
            onChange: handleSelectionChange,
          }}
          pagination={{
            current: searchParams.pageNum,
            pageSize: searchParams.pageSize,
            total,
            ...CONNECTION_PAGINATION,
            showTotal: (t, range) => `第 ${range[0]}-${range[1]} 条 / 共 ${t} 条`,
            onChange: handlePageChange,
          }}
          bordered
          cardClassNames={{
            root: 'flex min-h-0 grow flex-col',
            body: 'flex grow',
            table: {
              container: 'min-h-0 min-w-0 grow',
              root: 'full-height-table',
            },
          }}
          onRow={(record) => ({
            onDoubleClick: () => handleEdit(record),
          })}
        />
      </div>
      <ConnectionModal
        open={modalState.open}
        title={modalState.title}
        loading={saveMutation.isPending}
        initialRecord={modalState.record}
        drivers={drivers}
        onOk={handleModalOk}
        onCancel={closeModal}
      />
      <PoolStatsDrawer
        open={poolStatsState.open}
        connectionName={poolStatsState.record?.name}
        stats={poolStatsData}
        loading={poolStatsMutation.isPending}
        onRefresh={handleRefreshPoolStats}
        onClose={closePoolStats}
      />
    </>
  );
};

export default Database;
