import { ExclamationCircleFilled } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { App } from 'antd';
import { isEqual } from 'lodash-es';
import type React from 'react';
import { type Key, useEffect, useState } from 'react';
import ProTable from '@/components/ProTable';
import { roleService } from '@/services/system/role/roleApi';
import type { RoleModel, RoleSearchParams } from '@/services/system/role/type';
import AssignRoleMenuDrawer from './components/AssignRoleMenuDrawer';
import AssignRoleUserDrawer from './components/AssignRoleUserDrawer';
import RoleInfoModal from './components/RoleInfoModal';
import SearchForm from './components/SearchForm';
import TableActionButtons from './components/TableActionButtons';
import { useRoleActions } from './hooks/useRoleAction';
import { useRoleModals } from './hooks/useRoleModal';
import { useRolePermissions } from './hooks/useRolePermissions';
import { useRoleTableColumns } from './hooks/useRoleTableColumn';

/**
 * 角色页面主组件
 */
const Role: React.FC = () => {
  const { modal } = App.useApp();
  // 窗口管理hook
  const { modal: modalName, current, closeModal, openModal } = useRoleModals();
  // 选中的行
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  // 表格数据总数
  const [total, setTotal] = useState<number>(0);
  // 查询参数
  const [searchParams, setSearchParams] = useState<RoleSearchParams>({
    pageNum: 1,
    pageSize: 20,
  });
  // 权限列表
  const permissions = useRolePermissions();

  // 查询角色数据
  const {
    isFetching,
    data: result,
    refetch,
  } = useQuery({
    queryKey: ['sys_roles', searchParams],
    queryFn: () => roleService.getRoleListPage({ ...searchParams }),
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

  // 角色操作hook
  const { deleteRoles, handleModalSave } = useRoleActions({
    currentRow: current,
    onSuccess: handleSuccess,
  });

  // 处理搜索
  const handleSearch = (values: RoleSearchParams) => {
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
    setSearchParams((prev: RoleSearchParams) => ({ ...prev, ...search }));
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
  const handleSelectionChange = (keys: Key[], _rows: RoleModel[]) => {
    setSelectedRowKeys(keys as string[]);
  };

  // 批量删除
  const handleBatchDelete = (ids: string[]) => {
    if (!permissions.canDeleteRole) {
      modal.error({
        title: '权限不足',
        content: '您没有删除角色的权限，请联系管理员获取相应权限。',
      });
      return;
    }
    modal.confirm({
      title: '删除角色',
      icon: <ExclamationCircleFilled />,
      content: '确定删除选中的角色吗？数据删除后将无法恢复！',
      okButtonProps: {
        danger: true,
        type: 'default',
      },
      cancelButtonProps: {
        type: 'primary',
      },
      onOk() {
        deleteRoles(ids);
      },
    });
  };

  // 处理菜单分配确认
  const handleAssignMenu = () => {
    closeModal();
    handleSuccess();
  };

  // 处理用户分配确认
  const handleAssignUser = () => {
    closeModal();
  };

  // 获取表格列定义
  const columns = useRoleTableColumns({
    currentRow: current,
    onSuccess: handleSuccess,
    openModal,
  });

  // 打开详情
  const handleOpenDetail = (record: RoleModel) => {
    openModal('view', record);
  };

  return (
    <>
      <div className="h-full flex flex-col gap-2">
        {/* 角色搜索栏 */}
        <SearchForm onSearch={handleSearch} loading={isFetching} />
        {/* 角色数据表格 */}
        <ProTable<RoleModel>
          title="角色列表"
          columns={columns}
          dataSource={result?.records || []}
          loading={isFetching}
          rowKey="id"
          size="small"
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
            columnWidth: 40,
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
          rowClassName={(record: RoleModel) => (!record.status ? 'opacity-60 bg-gray-50' : '')}
          onRow={(record: RoleModel) => ({
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
      {/* 编辑/新增角色弹窗 */}
      <RoleInfoModal
        open={modalName === 'add' || modalName === 'edit' || modalName === 'view'}
        onOk={handleModalSave}
        onCancel={closeModal}
        roleInfo={current}
        action={modalName === 'add' ? 'add' : modalName === 'view' ? 'view' : 'edit'}
      />
      {/* 菜单分配抽屉 */}
      <AssignRoleMenuDrawer
        open={modalName === 'assignMenu'}
        roleId={current?.id || ''}
        onOk={handleAssignMenu}
        onCancel={closeModal}
      />
      {/* 用户分配抽屉 */}
      <AssignRoleUserDrawer open={modalName === 'assignUser'} roleId={current?.id || ''} onCancel={closeModal} />
    </>
  );
};
export default Role;
