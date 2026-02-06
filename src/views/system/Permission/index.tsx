import { ExclamationCircleFilled } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { App } from 'antd';
import { isEqual } from 'lodash-es';
import type React from 'react';
import { type Key, useEffect, useState } from 'react';
import ProTable from '@/components/ProTable';
import { permissionService } from '@/services/system/permission/permissionApi';
import type { PermissionModel } from '@/services/system/permission/type';
import PermissionInfoModal from './components/PermissionInfoModal';
import SearchForm from './components/SearchForm';
import TableActionButtons from './components/TableActionButtons';
import { usePermissionActions } from './hooks/usePermissionActions';
import { usePermissionModals } from './hooks/usePermissionModals';
import { usePermissionPermissions } from './hooks/usePermissionPermissions';
import { usePermissionTableColumns } from './hooks/usePermissionTableColumn';
import type { PermissionSearchParams } from './types';

/**
 * 权限点管理页面主组件
 * 提供权限点的增删改查功能，支持批量操作
 */
const Permission: React.FC = () => {
  const { modal } = App.useApp();

  // 弹窗管理hook
  const { modal: modalName, current, closeModal, openModal } = usePermissionModals();

  // 选中的行
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  // 表格数据总数
  const [total, setTotal] = useState<number>(0);

  // 查询参数
  const [searchParams, setSearchParams] = useState<PermissionSearchParams>({
    pageNum: 1,
    pageSize: 20,
  });

  // 权限检查
  const permissions = usePermissionPermissions();

  // 查询权限点数据
  const {
    isFetching,
    data: result,
    refetch,
  } = useQuery({
    queryKey: ['sys_permissions', searchParams],
    queryFn: () =>
      permissionService.queryPermissionListPage({
        ...searchParams,
        total: searchParams.pageNum === 1 ? 0 : total,
      }),
  });

  // 同步分页总数
  useEffect(() => {
    if (searchParams.pageNum === 1) {
      setTotal(result?.totalRow || 0);
    }
  }, [searchParams.pageNum, result?.totalRow]);

  /**
   * 通用成功回调
   * 关闭弹窗、清空选中行、刷新数据
   */
  const handleSuccess = () => {
    closeModal();
    setSelectedRowKeys([]);
    refetch();
  };

  // 权限点操作hook
  const { deletePermissions, handleModalSave } = usePermissionActions({
    currentRow: current,
    onSuccess: handleSuccess,
  });

  /**
   * 处理搜索
   */
  const handleSearch = (values: PermissionSearchParams) => {
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
    setSearchParams((prev: PermissionSearchParams) => ({ ...prev, ...search }));
  };

  /**
   * 处理分页变化
   */
  const handlePageChange = (page: number, pageSize?: number) => {
    setSearchParams((prev) => ({
      ...prev,
      pageNum: page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  /**
   * 处理行选择变化
   */
  const handleSelectionChange = (keys: Key[], _rows: PermissionModel[]) => {
    setSelectedRowKeys(keys as string[]);
  };

  /**
   * 批量删除
   */
  const handleBatchDelete = (ids: string[]) => {
    if (!permissions.canDelete) {
      modal.error({
        title: '权限不足',
        content: '您没有删除权限点的权限，请联系管理员获取相应权限。',
      });
      return;
    }
    modal.confirm({
      title: '批量删除权限点',
      icon: <ExclamationCircleFilled />,
      content: `确定删除选中的 ${ids.length} 个权限点吗？此操作不可恢复！`,
      okButtonProps: {
        danger: true,
        type: 'default',
      },
      cancelButtonProps: {
        type: 'primary',
      },
      onOk() {
        deletePermissions(ids);
      },
    });
  };

  // 获取表格列定义
  const columns = usePermissionTableColumns({
    currentRow: current,
    onSuccess: handleSuccess,
    openModal,
  });

  /**
   * 打开详情弹窗
   */
  const handleOpenDetail = (record: PermissionModel) => {
    openModal('view', record);
  };

  return (
    <>
      <div className="h-full flex flex-col gap-2">
        {/* 权限点搜索栏 */}
        <SearchForm onSearch={handleSearch} loading={isFetching} />

        {/* 权限点数据表格 */}
        <ProTable<PermissionModel>
          title="权限点列表"
          columns={columns}
          dataSource={result?.records || []}
          loading={isFetching}
          rowKey="id"
          actionButtons={
            <TableActionButtons
              handleBatchDelete={() => handleBatchDelete(selectedRowKeys)}
              refetch={refetch}
              selectedRows={selectedRowKeys}
              openModal={openModal}
            />
          }
          onRefresh={refetch}
          rowSelection={{
            type: 'checkbox' as const,
            selectedRowKeys,
            onChange: handleSelectionChange,
          }}
          pagination={{
            current: searchParams.pageNum,
            pageSize: searchParams.pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number, range: [number, number]) => `${range[0]} - ${range[1]} / ${total} 条`,
            hideOnSinglePage: false,
            onChange: handlePageChange,
          }}
          rowClassName={(record: PermissionModel) => (record.status === false ? 'opacity-60 bg-gray-50' : '')}
          onRow={(record: PermissionModel) => ({
            onDoubleClick: () => handleOpenDetail(record),
          })}
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

      {/* 编辑/新增/查看权限点弹窗 */}
      <PermissionInfoModal
        open={modalName === 'add' || modalName === 'edit' || modalName === 'view'}
        onOk={handleModalSave}
        onCancel={closeModal}
        permissionInfo={current}
        action={modalName === 'add' ? 'add' : modalName === 'view' ? 'view' : 'edit'}
      />
    </>
  );
};

export default Permission;
