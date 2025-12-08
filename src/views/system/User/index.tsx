import { useQuery } from '@tanstack/react-query';
import { isEqual } from 'lodash-es';
import { useCallback, useReducer, useState } from 'react';
import type { UserModel } from '@/services/system/user/type';
import { userService } from '@/services/system/user/userApi';
import {
  Operation,
  SearchForm,
  TableActionButtons,
  UserCard,
  UserInfoModal,
  UserPasswordModal,
  UserTable,
} from './components';
import { useUserMutations, useUserPermissions, useUserTableActions } from './hooks/index';
import type { UserSearchParams } from './types';

/**
 * 组件状态类型
 */
interface UserState {
  openEditModal: boolean;
  openPasswordModal: boolean;
  openOperationModal: boolean;
  currentRow: Partial<UserModel> | null;
  selectedRows: Partial<UserModel>[];
  action: string;
}

/**
 * 用户管理
 */
const User = () => {
  // 状态管理
  const [state, dispatch] = useReducer(
    (prev: UserState, action: Partial<UserState>) => ({
      ...prev,
      ...action,
    }),
    {
      openEditModal: false,
      openPasswordModal: false,
      openOperationModal: false,
      currentRow: null,
      selectedRows: [],
      action: '',
    }
  );

  // 查询参数
  const [searchParams, setSearchParams] = useState<UserSearchParams>({
    pageNum: 1,
    pageSize: 20,
  });

  // 选中的行
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<UserModel[]>([]);

  // 权限检查
  const permissions = useUserPermissions();

  // 查询用户数据
  const {
    isLoading,
    data: result,
    refetch,
  } = useQuery({
    queryKey: ['sys_users', searchParams],
    queryFn: () => userService.queryUserListPage({ ...searchParams }),
  });

  // 成功回调
  const handleSuccess = useCallback(() => {
    dispatch({
      selectedRows: [],
    });
    setSelectedRowKeys([]);
    setSelectedRows([]);
    refetch();
  }, [refetch]);

  // Mutations
  const { logicDeleteUserMutation, updateStatusMutation, handleSubmit } = useUserMutations({
    currentRow: state.currentRow,
    onSuccess: handleSuccess,
  });

  // 表格操作
  const { handleEdit, handleDetail, handleAdd, handleStatusChange, getMoreActions, handleBatchDelete } =
    useUserTableActions({
      permissions,
      dispatch,
      logicDeleteUserMutation,
      refetch,
      updateStatusMutation,
    });

  // 处理搜索
  const handleSearch = useCallback(
    (values: UserSearchParams) => {
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
      setSearchParams((prev: UserSearchParams) => ({ ...prev, ...search }));
    },
    [searchParams, refetch]
  );

  // 处理分页变化
  const handlePageChange = useCallback((page: number, pageSize?: number) => {
    setSearchParams((prev) => ({
      ...prev,
      pageNum: page,
      pageSize: pageSize || prev.pageSize,
    }));
  }, []);

  // 处理行选择变化
  const handleSelectionChange = useCallback((keys: string[], rows: UserModel[]) => {
    setSelectedRowKeys(keys);
    setSelectedRows(rows);
    dispatch({
      selectedRows: rows,
    });
  }, []);

  // 关闭编辑弹窗
  const handleCloseEditModal = useCallback(() => {
    dispatch({
      openEditModal: false,
      currentRow: null,
    });
  }, []);

  // 关闭密码弹窗
  const handleClosePasswordModal = useCallback(() => {
    dispatch({
      openPasswordModal: false,
    });
  }, []);

  // 关闭操作记录弹窗
  const handleCloseOperationModal = useCallback(() => {
    dispatch({
      openOperationModal: false,
    });
  }, []);

  // 处理表单提交成功
  const handleModalOk = useCallback(
    (values: Partial<UserModel>) => {
      handleSubmit(values);
      dispatch({
        openEditModal: false,
      });
    },
    [handleSubmit]
  );

  // 批量删除
  const handleBatchDeleteClick = useCallback(() => {
    handleBatchDelete(selectedRows);
  }, [handleBatchDelete, selectedRows]);

  return (
    <div className="user-management-container h-full flex flex-col gap-2">
      {/* 搜索表单 */}
      <SearchForm onSearch={handleSearch} isLoading={isLoading} />

      {/* 用户列表 */}
      <UserCard selectedCount={selectedRowKeys.length}>
        <TableActionButtons
          handleAdd={handleAdd}
          handleBatchDelete={handleBatchDeleteClick}
          refetch={refetch}
          selectedRows={selectedRows}
        />
        <UserTable
          data={result?.records || []}
          loading={isLoading}
          searchParams={searchParams}
          total={result?.totalRow || 0}
          selectedRowKeys={selectedRowKeys}
          onSelectionChange={handleSelectionChange}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDetail={handleDetail}
          onStatusChange={handleStatusChange}
          getMoreActions={getMoreActions}
          canUpdateStatus={permissions.canUpdateStatus}
        />
      </UserCard>

      {/* 编辑弹窗 */}
      <UserInfoModal
        visible={state.openEditModal}
        onOk={handleModalOk}
        onCancel={handleCloseEditModal}
        userInfo={state.currentRow}
        action={state.action}
      />

      {/* 密码编辑弹窗 */}
      <UserPasswordModal
        open={state.openPasswordModal}
        userInfo={state.currentRow || {}}
        onClose={handleClosePasswordModal}
        onOk={handleClosePasswordModal}
      />

      {/* 操作记录弹窗 */}
      <Operation
        userInfo={state.currentRow || {}}
        visible={state.openOperationModal}
        onCancel={handleCloseOperationModal}
      />
    </div>
  );
};

export default User;
