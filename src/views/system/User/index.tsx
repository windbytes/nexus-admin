import { MyIcon } from '@/components/MyIcon';
import { usePermission } from '@/hooks/usePermission';
import type { UserModel } from '@/services/system/user/type';
import { userService } from '@/services/system/user/userApi';
import { usePreferencesStore } from '@/stores/store';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { App, Card, Table } from 'antd';
import { isEqual } from 'lodash-es';
import type React from 'react';
import { useMemo, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getColumns } from './columns';
import Operation from './Operation';
import SearchForm from './SearchForm';
import TableActionButtons from './TableActionButtons';
import type { UserSearchParams } from './types';
import UserInfoModal from './UserInfoModal';
import UserPasswordModal from './UserPasswordModal';

/**
 * 用户管理
 */
const User: React.FC = () => {
  const { modal, message } = App.useApp();
  const colorPrimary = usePreferencesStore((state) => state.preferences.theme.colorPrimary);
  const { t } = useTranslation();

  // 权限检查
  const canUpdatePassword = usePermission(['sys:user:updatePassword']);
  const canAssignRole = usePermission(['sys:user:assignRole']);
  const canUpdateStatus = usePermission(['sys:user:updateStatus']);
  const canViewOperationLog = usePermission(['sys:user:viewOperationLog']);
  const canDeleteUser = usePermission(['sys:user:delete']);
  // 合并状态
  const [state, dispatch] = useReducer(
    (prev: any, action: any) => ({
      ...prev,
      ...action,
    }),
    {
      // 编辑窗口的打开状态
      openEditModal: false,
      // 修改密码弹窗的打开状态
      openPasswordModal: false,
      // 操作记录弹窗的打开状态
      openOperationModal: false,
      // 当前编辑的行数据
      currentRow: null,
      // 当前选中的行数据
      selectedRows: [],
      // 当前操作
      action: '',
    }
  );

  // 查询参数（包含分页参数）
  const [searchParams, setSearchParams] = useState<UserSearchParams>({
    pageNum: 1,
    pageSize: 20,
  });

  // 查询用户数据
  const {
    isLoading,
    data: result,
    refetch,
  } = useQuery({
    queryKey: ['sys_users', searchParams],
    queryFn: () => userService.queryUserListPage({ ...searchParams }),
  });

  // 选中的行
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<UserModel[]>([]);

  // 表格数据
  const data = result?.records || [];
  const total = result?.totalRow || 0;

  // 处理导入
  const handleImport = () => {
    modal.error({
      title: '功能暂未开放',
      content: '用户数据导入功能正在开发中，敬请期待。',
    });
  };

  // 处理导出
  const handleExport = () => {
    modal.error({
      title: '功能暂未开放',
      content: '用户数据导出功能正在开发中，敬请期待。',
    });
  };

  // 处理回收站
  const handleRecycleBin = () => {
    modal.error({
      title: '功能暂未开放',
      content: '回收站功能正在开发中，敬请期待。',
    });
  };

  // 处理列设置
  const handleColumns = () => {
    modal.error({
      title: '功能暂未开放',
      content: '表格列设置功能正在开发中，敬请期待。',
    });
  };

  // 处理表格大小
  const handleTableSize = () => {
    modal.error({
      title: '功能暂未开放',
      content: '表格大小调整功能正在开发中，敬请期待。',
    });
  };

  // 处理表格密度
  const handleTableDensity = () => {
    modal.error({
      title: '功能暂未开放',
      content: '表格密度调整功能正在开发中，敬请期待。',
    });
  };

  // 处理表格设置
  const handleTableSettings = () => {
    modal.error({
      title: '功能暂未开放',
      content: '表格设置功能正在开发中，敬请期待。',
    });
  };

  // 处理删除数据
  const logicDeleteUserMutation = useMutation({
    mutationFn: (ids: string[]) => userService.logicDeleteUsers(ids),
    onSuccess: () => {
      dispatch({
        selectedRows: [],
      });
      refetch();
    },
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

  // 处理编辑
  const handleEdit = (record: UserModel) => {
    dispatch({
      openEditModal: true,
      currentRow: record,
      action: 'edit',
    });
  };

  // 处理详情
  const handleDetail = (record: UserModel) => {
    dispatch({
      openEditModal: true,
      currentRow: record,
      action: 'view',
    });
  };

  // 处理新增
  const handleAdd = () => {
    dispatch({
      openEditModal: true,
      currentRow: null,
      action: 'add',
    });
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    modal.confirm({
      title: '确定要删除选中的用户吗？',
      icon: <ExclamationCircleFilled />,
      content: '此操作将删除选中的用户，删除后可在回收站中进行恢复，是否继续？',
      onOk() {
        const ids = state.selectedRows.map((row: Partial<UserModel>) => row.id);
        // 调用批量删除接口(逻辑删除)
        logicDeleteUserMutation.mutate(ids);
      },
    });
  };

  // 更新用户mutation
  const updateUserMutation = useMutation({
    mutationFn: (values: Partial<UserModel>) => userService.updateUser({ id: state.currentRow.id, ...values }),
    onSuccess: () => {
      dispatch({
        openEditModal: false,
      });
      refetch();
    },
  });

  // 新增用户mutation
  const createUserMutation = useMutation({
    mutationFn: (values: Partial<UserModel>) => userService.createUser(values),
    onSuccess: () => {
      dispatch({
        openEditModal: false,
      });
      refetch();
    },
  });

  // 处理表单提交
  const handleModalOk = (values: Partial<UserModel>) => {
    if (state.currentRow?.id) {
      updateUserMutation.mutate(values);
    } else {
      createUserMutation.mutate(values);
    }
  };

  // 关闭密码编辑弹窗
  const closePasswordModal = () => {
    dispatch({
      openPasswordModal: false,
    });
  };

  // 表格操作列中的更多操作
  // 处理状态变更
  const handleStatusChange = (record: UserModel, checked: boolean) => {
    if (!canUpdateStatus) {
      modal.error({
        title: '权限不足',
        content: '您没有更新用户状态的权限，请联系管理员获取相应权限。',
      });
      return;
    }

    const newStatus = checked ? 1 : 0;
    userService
      .updateBatchUserStatus([record.id], newStatus)
      .then(() => {
        message.success(`用户状态已${checked ? '启用' : '禁用'}`);
        refetch();
      })
      .catch(() => {
        modal.error({
          title: '状态更新失败',
          content: '用户状态更新失败，请检查网络连接或联系技术支持。',
        });
      });
  };

  const columns = useMemo(
    () =>
      getColumns(
        handleEdit,
        handleDetail,
        t,
        colorPrimary,
        (record) => [
          {
            key: 'updatePwd',
            label: '修改密码',
            icon: <Icon icon="fluent:password-reset-48-regular" className="text-xl! block text-orange-300" />,
            disabled: !canUpdatePassword,
            onClick: () => {
              if (!canUpdatePassword) {
                modal.error({
                  title: '权限不足',
                  content: '您没有修改用户密码的权限，请联系管理员获取相应权限。',
                });
                return;
              }
              /* 打开密码编辑弹窗 */
              dispatch({
                openPasswordModal: true,
                currentRow: record,
              });
            },
          },
          {
            key: 'assignRole',
            label: '分配角色',
            icon: <MyIcon type="nexus-assigned" className="text-xl! block" />,
            disabled: !canAssignRole,
            onClick: () => {
              if (!canAssignRole) {
                modal.error({
                  title: '权限不足',
                  content: '您没有分配用户角色的权限，请联系管理员获取相应权限。',
                });
                return;
              }
              modal.error({
                title: '功能暂未开放',
                content: '分配角色功能正在开发中，敬请期待。',
              });
            },
          },

          {
            key: 'operation',
            label: '操作记录',
            icon: <Icon icon="fluent-color:history-48" className="text-xl! block" />,
            disabled: !canViewOperationLog,
            onClick: () => {
              if (!canViewOperationLog) {
                modal.error({
                  title: '权限不足',
                  content: '您没有查看用户操作记录的权限，请联系管理员获取相应权限。',
                });
                return;
              }
              // 打开操作记录弹窗
              dispatch({
                openOperationModal: true,
                currentRow: record,
              });
            },
          },
          {
            key: 'delete',
            label: t('common.operation.delete'),
            icon: <Icon icon="fluent:delete-dismiss-24-filled" className="text-xl! block text-[#ff4d4f]!" />,
            disabled: !canDeleteUser,
            onClick: () => {
              if (!canDeleteUser) {
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
                onOk() {
                  logicDeleteUserMutation.mutate([record.id]);
                },
              });
            },
          },
        ],
        handleStatusChange,
        canUpdateStatus
      ),
    [handleStatusChange, canUpdateStatus]
  );

  return (
    <div className="user-management-container h-full flex flex-col gap-2">
      {/* 搜索表单 */}
      <SearchForm onSearch={handleSearch} isLoading={isLoading} />

      {/* 用户列表 */}
      <Card
        className="flex-1 min-h-0 flex flex-col"
        title={
          <div className="flex items-center justify-between">
            <span>用户列表</span>
            <span className="text-sm text-gray-500">已选择 {selectedRowKeys.length} 项</span>
          </div>
        }
        styles={{
          body: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
          },
        }}
      >
        <TableActionButtons
          handleAdd={handleAdd}
          handleBatchDelete={handleBatchDelete}
          refetch={refetch}
          selectedRows={selectedRows}
        />
        <div className="flex-1 min-h-0">
          <Table
            bordered
            columns={columns || []}
            dataSource={data}
            rowKey="id"
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys,
              onChange: (keys, rows) => {
                setSelectedRowKeys(keys as string[]);
                setSelectedRows(rows);
              },
            }}
            pagination={{
              current: searchParams.pageNum,
              pageSize: searchParams.pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
              onChange: (page, pageSize) => {
                setSearchParams((prev) => ({
                  ...prev,
                  pageNum: page,
                  pageSize: pageSize || prev.pageSize,
                }));
              },
            }}
            loading={isLoading}
            size="middle"
            scroll={{ y: 'calc(100vh - 400px)' }}
            rowClassName={(record) => (record.status === 0 ? 'opacity-60 bg-gray-50' : '')}
            className="h-full"
          />
        </div>
      </Card>

      {/* 编辑弹窗 */}
      <UserInfoModal
        visible={state.openEditModal}
        onOk={handleModalOk}
        onCancel={() => {
          dispatch({
            openEditModal: false,
            currentRow: null,
          });
        }}
        userInfo={state.currentRow}
        action={state.action}
      />

      {/* 密码编辑弹窗 */}
      <UserPasswordModal
        open={state.openPasswordModal}
        userInfo={state.currentRow}
        onClose={closePasswordModal}
        onOk={closePasswordModal}
      />

      {/* 操作记录弹窗 */}
      <Operation
        userInfo={state.currentRow}
        visible={state.openOperationModal}
        onCancel={() => {
          dispatch({
            openOperationModal: false,
          });
        }}
      />
    </div>
  );
};

export default User;
