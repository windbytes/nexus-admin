import { ExclamationCircleFilled } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { App } from 'antd';
import { isEqual } from 'lodash-es';
import type React from 'react';
import { type Key, useEffect, useState } from 'react';
import ProTable from '@/components/ProTable';
import type { UserModel } from '@/services/system/user/type';
import { userService } from '@/services/system/user/userApi';
import AssignRoleModal from './components/AssignRoleModal';
import Operation from './components/Operation';
import RecycleModal from './components/RecycleModal';
import SearchForm from './components/SearchForm';
import TableActionButtons from './components/TableActionButtons';
import UserInfoModal from './components/UserInfoModal';
import UserPasswordModal from './components/UserPasswordModal';
import { useUserActions } from './hooks/useUserAction';
import { useUserModals } from './hooks/useUserModals';
import { useUserPermissions } from './hooks/useUserPermissions';
import { useUserTableColumns } from './hooks/useUserTableColumn';
import type { UserSearchParams } from './types';

/**
 * 用户页面主组件
 */
const User: React.FC = () => {
  const { modal } = App.useApp();
  // 窗口管理hook
  const { modal: modalName, current, closeModal, openModal } = useUserModals();
  // 选中的行
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  // 表格数据总数
  const [total, setTotal] = useState<number>(0);
  // 查询参数
  const [searchParams, setSearchParams] = useState<UserSearchParams>({
    pageNum: 1,
    pageSize: 20,
  });
  // 权限列表
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
      setTotal(result?.totalRow || 0);
    }
  }, [searchParams.pageNum, result?.totalRow]);

  // 通用成功回调
  const handleSuccess = () => {
    setSelectedRowKeys([]);
    refetch();
  };

  // 用户操作hook
  const { deleteUsers, handleModalSave, assignRole } = useUserActions({
    currentRow: current,
    onSuccess: handleSuccess,
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
  const handleSelectionChange = (keys: Key[], _rows: UserModel[]) => {
    setSelectedRowKeys(keys as string[]);
  };

  // 批量删除
  const handleBatchDelete = (ids: string[]) => {
    if (!permissions.canDeleteUser) {
      modal.error({
        title: '权限不足',
        content: '您没有删除用户的权限，请联系管理员获取相应权限。',
      });
      return;
    }
    modal.confirm({
      title: '删除用户',
      icon: <ExclamationCircleFilled />,
      content: '确定删除该用户吗？数据删除后请在回收站中恢复！',
      okButtonProps: {
        danger: true,
        type: 'default',
      },
      cancelButtonProps: {
        type: 'primary',
      },
      onOk() {
        deleteUsers(ids);
      },
    });
  };

  // 处理角色分配确认
  const handleAssignRole = (targetKeys: string[]) => {
    if (current?.id) {
      assignRole(current.id, targetKeys);
    }
    closeModal();
  };

  // 获取表格列定义
  const columns = useUserTableColumns({
    currentRow: current,
    onSuccess: handleSuccess,
    openModal,
  });

  // 打开详情
  const handleOpenDetail = (record: UserModel) => {
    openModal('view', record);
  };

  return (
    <>
      <div className="h-full flex flex-col gap-2">
        {/* 用户搜索栏 */}
        <SearchForm onSearch={handleSearch} loading={isFetching} />
        {/* 用户数据表格 */}
        <ProTable<UserModel>
          title="用户列表"
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
          rowClassName={(record: UserModel) => (record.status === 0 ? 'opacity-60 bg-gray-50' : '')}
          onRow={(record: UserModel) => ({
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
      {/* 编辑/新增用户弹窗 */}
      <UserInfoModal
        open={modalName === 'add' || modalName === 'edit' || modalName === 'view'}
        onOk={handleModalSave}
        onCancel={closeModal}
        userInfo={current}
        action={modalName === 'add' ? 'add' : modalName === 'view' ? 'view' : 'edit'}
      />
      {/* 密码编辑弹窗 */}
      <UserPasswordModal open={modalName === 'password'} userInfo={current} onOk={handleSuccess} onClose={closeModal} />
      {/* 操作记录弹窗 */}
      <Operation open={modalName === 'actionLog'} userInfo={current} onCancel={closeModal} />
      {/* 回收站弹窗 */}
      <RecycleModal open={modalName === 'recycle'} onCancel={closeModal} onOk={closeModal} />
      {/* 角色分配表格穿梭框弹窗 */}
      <AssignRoleModal
        open={modalName === 'assignRole'}
        username={current?.username || ''}
        onCancel={closeModal}
        onOk={handleAssignRole}
      />
    </>
  );
};
export default User;
