import { useQuery } from '@tanstack/react-query';
import { Card, Divider } from 'antd';
import { isEqual } from 'lodash-es';
import { useEffect, useReducer, useState } from 'react';
import type { UserModel } from '@/services/system/user/type';
import { userService } from '@/services/system/user/userApi';
import { Operation, SearchForm, TableActionButtons, UserInfoModal, UserPasswordModal, UserTable } from './components';
import AssignRoleModal from './components/AssignRoleModal';
import RecycleModal from './components/RecycleModal';
import { useUserMutations, useUserPermissions, useUserTableActions } from './hooks/index';
import type { UserSearchParams } from './types';

/**
 * 组件状态类型
 */
interface UserState {
  openEditModal: boolean;
  openPasswordModal: boolean;
  openOperationModal: boolean;
  // 打开回收站
  openRecycleModal: boolean;
  // 打开角色分配弹窗
  openAssignRoleModal: boolean;
  currentRow: Partial<UserModel> | null;
  selectedRows: Partial<UserModel>[];
  action: string;
  total: number;
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
      openRecycleModal: false,
      openAssignRoleModal: false,
      currentRow: null,
      selectedRows: [],
      action: '',
      total: 0,
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
    isFetching,
    data: result,
    refetch,
  } = useQuery({
    queryKey: ['sys_users', searchParams],
    queryFn: () => userService.queryUserListPage({ ...searchParams }),
  });

  // 同步分页总数
  useEffect(() => {
    if (searchParams.pageNum === 1) {
      dispatch({
        total: result?.totalRow,
      });
    }
  }, [searchParams.pageNum, result?.totalRow]);

  // 成功回调
  const handleSuccess = () => {
    dispatch({
      selectedRows: [],
    });
    setSelectedRowKeys([]);
    setSelectedRows([]);
    refetch();
  };

  // Mutations
  const { logicDeleteUserMutation, updateStatusMutation, handleSubmit } = useUserMutations({
    currentRow: state.currentRow,
    onSuccess: handleSuccess,
  });

  // 表格操作
  const { handleEdit, handleDetail, handleAdd, handleRecycle, handleStatusChange, getMoreActions, handleBatchDelete } =
    useUserTableActions({
      permissions,
      dispatch,
      logicDeleteUserMutation,
      refetch,
      updateStatusMutation,
    });

  // 处理搜索
  const handleSearch = (values: UserSearchParams) => {
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
  const handleSelectionChange = (keys: string[], rows: UserModel[]) => {
    setSelectedRowKeys(keys);
    setSelectedRows(rows);
    dispatch({
      selectedRows: rows,
    });
  };

  // 关闭编辑弹窗
  const handleCloseEditModal = () => {
    dispatch({
      openEditModal: false,
      currentRow: null,
    });
  };

  // 关闭密码弹窗
  const handleClosePasswordModal = () => {
    dispatch({
      openPasswordModal: false,
    });
  };

  // 关闭操作记录弹窗
  const handleCloseOperationModal = () => {
    dispatch({
      openOperationModal: false,
    });
  };

  // 关闭回收站弹窗
  const handleCloseRecycleModal = () => {
    dispatch({
      openRecycleModal: false,
    });
  };

  // 处理表单提交成功
  const handleModalOk = (values: Partial<UserModel>) => {
    handleSubmit(values);
    dispatch({
      openEditModal: false,
    });
  };

  // 批量删除
  const handleBatchDeleteClick = () => {
    handleBatchDelete(selectedRows);
  };

  return (
    <div className="h-full flex flex-col gap-2">
      {/* 搜索表单 */}
      <SearchForm onSearch={handleSearch} isLoading={isFetching} />

      {/* 用户列表 */}
      <Card
        className="grow min-h-0 flex flex-col"
        classNames={{ body: 'flex grow' }}
        title={
          <div className="flex items-center">
            <h2>用户列表</h2>
            <Divider orientation="vertical" />
            <span className="text-sm! text-gray-500">{`已选 ${selectedRowKeys.length} 项`}</span>
            <Divider orientation="vertical" />
            <TableActionButtons
              handleAdd={handleAdd}
              handleBatchDelete={handleBatchDeleteClick}
              handleRecycle={handleRecycle}
              refetch={refetch}
              selectedRows={selectedRows}
            />
          </div>
        }
      >
        <UserTable
          data={result?.records || []}
          loading={isFetching}
          searchParams={searchParams}
          total={state.total}
          selectedRowKeys={selectedRowKeys}
          onSelectionChange={handleSelectionChange}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDetail={handleDetail}
          onStatusChange={handleStatusChange}
          getMoreActions={getMoreActions}
          canUpdateStatus={permissions.canUpdateStatus}
        />
      </Card>

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

      {/* 回收站弹窗 */}
      <RecycleModal
        visible={state.openRecycleModal}
        onCancel={handleCloseRecycleModal}
        onOk={handleCloseRecycleModal}
      />
      {/* 角色分配表格穿梭框弹窗 */}
      <AssignRoleModal
        visible={state.openAssignRoleModal}
        onCancel={() => {
          dispatch({
            openAssignRoleModal: false,
          });
        }}
        onOk={() => {
          // 暂时这么写，需要点击确定的时候保存数据
          dispatch({
            openAssignRoleModal: false,
          });
        }}
      />
    </div>
  );
};

export default User;
