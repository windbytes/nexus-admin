import { ExclamationCircleFilled } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { App, Card, Divider } from 'antd';
import { isEqual } from 'lodash-es';
import type React from 'react';
import { type Key, useEffect, useState } from 'react';
import type { UserModel } from '@/services/system/user/type';
import { userService } from '@/services/system/user/userApi';
import AssignRoleModal from './components/AssignRoleModal';
import Operation from './components/Operation';
import RecycleModal from './components/RecycleModal';
import SearchForm from './components/SearchForm';
import TableActionButtons from './components/TableActionButtons';
import UserInfoModal from './components/UserInfoModal';
import UserPasswordModal from './components/UserPasswordModal';
import UserTable from './components/UserTable';
import { useUserActions } from './hooks/useUserAction';
import { useUserModals } from './hooks/useUserModals';
import { useUserPermissions } from './hooks/useUserPermissions';
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
  const { deleteUsers, handleModalSave } = useUserActions({
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
    // 调用接口分配角色
    console.log('分配角色ID集合：', targetKeys);
    // 关闭窗口
    closeModal();
  };

  return (
    <>
      <div className="h-full flex flex-col gap-2">
        {/* 用户搜索栏 */}
        <SearchForm onSearch={handleSearch} loading={isFetching} />
        {/* 用户数据表格 */}
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
                handleBatchDelete={() => handleBatchDelete(selectedRowKeys)}
                refetch={refetch}
                selectedRows={selectedRowKeys}
                openModal={openModal}
              />
            </div>
          }
        >
          <UserTable
            datasource={result?.records || []}
            loading={isFetching}
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
          />
        </Card>
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
        dataSource={[]}
        userRoleIds={[]}
        onCancel={closeModal}
        onOk={handleAssignRole}
      />
    </>
  );
};
export default User;
