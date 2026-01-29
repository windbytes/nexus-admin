import { ExclamationCircleFilled } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { App } from 'antd';
import { isEqual } from 'lodash-es';
import type React from 'react';
import { type Key, useEffect, useState } from 'react';
import ProTable from '@/components/ProTable';
import { permissionService } from '@/services/system/permission';
import type { PermissionModel } from '@/services/system/permission/type';
import PermissionInfoModal from './components/PermissionInfoModal';
import SearchForm from './components/SearchForm';
import TableActionButtons from './components/TableActionButtons';
import { usePermissionActions } from './hooks/usePermissionActions';
import { usePermissionModals } from './hooks/usePermissionModals';
import { usePermissionTableColumns } from './hooks/usePermissionTableColumn';
import type { PermissionSearchParams } from './types';

/**
 * 权限点页面主组件
 */
const Permission: React.FC = () => {
  const { modal } = App.useApp();
  // 窗口管理hook
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

  // 查询权限点数据
  const {
    isFetching,
    data: result,
    refetch,
  } = useQuery({
    queryKey: ['sys_permissions', searchParams],
    queryFn: () => permissionService.queryPermissionListPage({ ...searchParams }),
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

  // 权限点操作hook
  const { deletePermissions, savePermission } = usePermissionActions({
    currentRow: current,
    onSuccess: handleSuccess,
  });

  // 处理搜索
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

  // 处理分页变化
  const handlePageChange = (page: number, pageSize?: number) => {
    setSearchParams((prev) => ({
      ...prev,
      pageNum: page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  // 处理行选择变化
  const handleSelectionChange = (keys: Key[], _rows: PermissionModel[]) => {
    setSelectedRowKeys(keys as string[]);
  };

  // 批量删除
  const handleBatchDelete = (ids: string[]) => {
    modal.confirm({
      title: '删除权限点',
      icon: <ExclamationCircleFilled />,
      content: '确定删除选中的权限点吗？',
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

  // 处理弹窗保存
  const handleModalSaveWithResources = (
    values: Partial<PermissionModel>,
    resources: Array<{ permissionId: string; resourceId: string; resourceType: 'ACTION' | 'API' }>
  ) => {
    // 统一调用保存接口，后端处理基础信息和资源绑定
    // 如果是编辑，需要在values中包含id
    const permissionData = current?.id ? { ...values, id: current.id } : values;

    // 准备资源数据（如果没有权限ID，先使用空字符串，后端会根据是新增还是编辑来处理）
    const resourcesData = resources.map((r) => ({
      permissionId: current?.id || '',
      resourceId: r.resourceId,
      resourceType: r.resourceType,
    }));

    // 调用统一保存接口，成功后会在usePermissionActions中处理成功回调
    savePermission({
      permission: permissionData,
      resources: resourcesData,
    });
  };

  // 获取表格列定义
  const columns = usePermissionTableColumns({
    currentRow: current,
    onSuccess: handleSuccess,
    openModal,
  });

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
          rowClassName={(record: PermissionModel) => (record.status === 0 ? 'opacity-60 bg-gray-50' : '')}
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
      {/* 编辑/新增权限点弹窗 */}
      <PermissionInfoModal
        open={modalName === 'add' || modalName === 'edit'}
        onOk={handleModalSaveWithResources}
        onCancel={closeModal}
        permissionInfo={current}
        action={modalName === 'add' ? 'add' : 'edit'}
      />
    </>
  );
};

export default Permission;
