/**
 * @file 系统管理 - 角色管理页面
 * @description 角色列表 CRUD、统一授权（菜单/按钮/接口）；路由 component：`system/role`。
 * 授权用户未完整移植（用户模块未就绪）。
 */

import { ExclamationCircleFilled } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { App } from 'antd';
import { isEqual } from 'lodash-es';
import { type Key, useEffect, useState } from 'react';
import { roleService } from '@/modules/system/api/role';
import type { RoleModel, RoleSearchParams } from '@/shared/api/system/role/type';
import ProTable from '@/shared/components/pro/ProTable';
import AssignGrantDrawer from './components/AssignGrantDrawer';
import RoleInfoModal from './components/RoleInfoModal';
import SearchForm from './components/SearchForm';
import TableActionButtons from './components/TableActionButtons';
import { useRoleActions } from './hooks/useRoleAction';
import { useRoleModals } from './hooks/useRoleModal';
import { useRolePermissions } from './hooks/useRolePermissions';
import { useRoleTableColumns } from './hooks/useRoleTableColumn';

/**
 * 角色管理完整页面。
 *
 * @returns 角色列表与授权弹窗/抽屉
 */
function Role() {
  const { modal } = App.useApp();
  const { modal: modalName, current, closeModal, openModal } = useRoleModals();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useState<RoleSearchParams>({
    pageNum: 1,
    pageSize: 20,
  });
  const permissions = useRolePermissions();

  const {
    isFetching,
    data: result,
    refetch,
  } = useQuery({
    queryKey: ['sys_roles', searchParams],
    queryFn: () =>
      roleService.getRoleListPage({
        ...searchParams,
        total: searchParams.pageNum === 1 ? 0 : total,
      }),
  });

  useEffect(() => {
    if (searchParams.pageNum === 1) {
      setTotal(result?.totalRow || 0);
    }
  }, [searchParams.pageNum, result?.totalRow]);

  /**
   * 写操作成功：清空勾选、关弹窗并刷新。
   */
  function handleSuccess() {
    setSelectedRowKeys([]);
    closeModal();
    refetch();
  }

  const { deleteRoles, handleModalSave } = useRoleActions({
    currentRow: current,
    onSuccess: handleSuccess,
  });

  /**
   * @param values - 搜索表单值
   */
  function handleSearch(values: RoleSearchParams) {
    const search = {
      ...values,
      pageNum: searchParams.pageNum,
      pageSize: searchParams.pageSize,
    };
    if (isEqual(search, searchParams)) {
      refetch();
      return;
    }
    setSearchParams((prev) => ({ ...prev, ...search }));
  }

  /**
   * @param page - 页码
   * @param pageSize - 每页条数
   */
  function handlePageChange(page: number, pageSize?: number) {
    setSearchParams((prev) => ({
      ...prev,
      pageNum: page,
      pageSize: pageSize || prev.pageSize,
    }));
  }

  /**
   * @param keys - 选中行 key
   */
  function handleSelectionChange(keys: Key[]) {
    setSelectedRowKeys(keys as string[]);
  }

  /**
   * @param ids - 待删除角色 ID
   */
  function handleBatchDelete(ids: string[]) {
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
  }

  const columns = useRoleTableColumns({
    currentRow: current,
    onSuccess: handleSuccess,
    openModal,
  });

  /**
   * @param record - 角色行
   */
  function handleOpenDetail(record: RoleModel) {
    openModal('view', record);
  }

  return (
    <>
      <div className="h-full flex flex-col gap-2">
        <SearchForm onSearch={handleSearch} loading={isFetching} />
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
            showTotal: (totalCount: number, range: [number, number]) =>
              `${range[0]} - ${range[1]} / ${totalCount} 条`,
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
      <RoleInfoModal
        open={modalName === 'add' || modalName === 'edit' || modalName === 'view'}
        onOk={handleModalSave}
        onCancel={closeModal}
        roleInfo={current}
        action={modalName === 'add' ? 'add' : modalName === 'view' ? 'view' : 'edit'}
      />
      <AssignGrantDrawer
        open={modalName === 'assignGrant'}
        roleId={current?.id || ''}
        roleName={current?.roleName}
        onCancel={closeModal}
        onSaved={handleSuccess}
      />
    </>
  );
}

export default Role;
