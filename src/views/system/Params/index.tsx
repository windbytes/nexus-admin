import { useQuery } from '@tanstack/react-query';
import { isEqual } from 'lodash-es';
import type React from 'react';
import { type Key, useEffect, useState } from 'react';
import ProTable from '@/components/ProTable';
import type { SysParam } from '@/services/system/params';
import { sysParamService } from '@/services/system/params';
import ParamDrawer from './components/ParamDrawer';
import SearchForm from './components/SearchForm';
import TableActionButtons from './components/TableActionButtons';
import { PAGINATION_CONFIG } from './config';
import { useParamActions } from './hooks/useParamActions';
import { useParamModals } from './hooks/useParamModals';
import type { ParamSearchParams } from './types';
import './styles/params.module.scss';
import { useParamTableColumns } from './hooks/useParamTableColumn';

/**
 * 系统参数管理页面主组件
 */
const Params: React.FC = () => {
  // 窗口管理hook
  const { modal: modalName, current, closeModal, openModal } = useParamModals();
  // 选中的行
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  // 表格数据总数
  const [total, setTotal] = useState<number>(0);
  // 查询参数
  const [searchParams, setSearchParams] = useState<ParamSearchParams>({
    pageNum: 1,
    pageSize: 10,
  });
  const [searchExpanded, setSearchExpanded] = useState(false);

  // 查询参数列表
  const {
    isFetching,
    data: result,
    refetch,
  } = useQuery({
    queryKey: ['sys_params', searchParams],
    queryFn: () => sysParamService.queryParams({ ...searchParams }),
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
    closeModal();
    refetch();
  };

  // 参数操作hook
  const { handleModalSave, deleteParam, batchDeleteParams, importParams, exportParams, updateParamStatus, isSaving } =
    useParamActions({
      currentRow: current,
      onSuccess: handleSuccess,
    });

  // 处理搜索
  const handleSearch = (values: ParamSearchParams) => {
    const search = {
      ...values,
      pageNum: searchParams.pageNum,
      pageSize: searchParams.pageSize,
    };
    // 判断参数是否发生变化
    if (isEqual(search, searchParams)) {
      // 参数没有变化，手动刷新数据
      refetch();
      return;
    }
    setSearchParams((prev: ParamSearchParams) => ({ ...prev, ...search }));
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
  const handleSelectionChange = (keys: Key[], _rows: SysParam[]) => {
    setSelectedRowKeys(keys as number[]);
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      return;
    }

    // 获取选中记录的code
    const selectedRecords = result?.records?.filter((record) => selectedRowKeys.includes(record.id)) || [];
    const selectedCodes = selectedRecords.map((record) => record.code);

    batchDeleteParams(selectedRowKeys, selectedCodes);
  };

  // 处理编辑
  const handleEdit = (record: SysParam) => {
    openModal('edit', record);
  };

  // 处理删除
  const handleDelete = (record: SysParam) => {
    deleteParam(record);
  };

  // 处理状态变更
  const handleStatusChange = (record: SysParam, checked: boolean) => {
    updateParamStatus(record, checked);
  };

  // 处理导入
  const handleImport = (file: File) => {
    importParams(file);
  };

  // 处理导出
  const handleExport = (type: 'all' | 'selected') => {
    exportParams(type, type === 'selected' ? selectedRowKeys : undefined, type === 'all' ? searchParams : undefined);
  };

  // 处理展开搜索
  const handleToggleSearchExpand = () => {
    setSearchExpanded((prev) => !prev);
  };

  // 获取抽屉标题
  const getDrawerTitle = () => {
    if (modalName === 'add') {
      return '新增参数';
    }
    if (modalName === 'edit') {
      return '编辑参数';
    }
    return '';
  };

  // 获取表格列定义
  const columns = useParamTableColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onStatusChange: handleStatusChange,
  });

  return (
    <>
      <div className="h-full flex flex-col params-container gap-2">
        {/* 搜索表单 */}
        <SearchForm
          onSearch={handleSearch}
          loading={isFetching}
          expanded={searchExpanded}
          onToggleExpand={handleToggleSearchExpand}
        />
        {/* 参数数据表格 */}
        <ProTable<SysParam>
          title="参数列表"
          columns={columns}
          dataSource={result?.records || []}
          loading={isFetching}
          rowKey="id"
          actionButtons={
            <TableActionButtons
              handleBatchDelete={handleBatchDelete}
              refetch={refetch}
              selectedRows={selectedRowKeys}
              openModal={openModal}
              onImport={handleImport}
              onExport={handleExport}
            />
          }
          onRefresh={refetch}
          rowSelection={{
            selectedRowKeys,
            onChange: handleSelectionChange,
          }}
          pagination={{
            pageSize: searchParams.pageSize,
            current: searchParams.pageNum,
            ...PAGINATION_CONFIG,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            total: total,
            onChange(page, pageSize) {
              handlePageChange(page, pageSize);
            },
          }}
          bordered
          cardClassNames={{
            root: 'grow min-h-0 flex flex-col',
            body: 'flex grow',
            table: {
              container: 'grow min-h-0 min-w-0',
              root: 'full-height-table',
            },
          }}
        />
      </div>
      {/* 新增/编辑抽屉 */}
      <ParamDrawer
        open={modalName === 'add' || modalName === 'edit'}
        title={getDrawerTitle()}
        loading={isSaving}
        initialValues={current || undefined}
        onOk={handleModalSave}
        onCancel={closeModal}
      />
    </>
  );
};

export default Params;
