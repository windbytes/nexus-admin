import { ReloadOutlined } from '@ant-design/icons';
import { Button, Card, type InputRef, Table } from 'antd';
import type React from 'react';
import { useEffect, useRef } from 'react';
import type { MenuModel } from '@/services/system/menu/type';
import { useMenuPermissions } from '../../hooks/useMenuPermissions';
import { useTableColumns } from './components/TableColumns';
import TableFooter from './components/TableFooter';
import { useMenuInterfacePermission } from './hooks/useMenuInterfacePermission';

export type MenuInterfacePermissionProps = {
  menu?: MenuModel;
};

/**
 * 菜单接口权限组件
 */
const MenuInterfacePermission: React.FC<MenuInterfacePermissionProps> = ({ menu }) => {
  const permissions = useMenuPermissions();
  const codeInputRef = useRef<InputRef | null>(null);
  const remarkInputRef = useRef<InputRef | null>(null);

  const {
    state,
    isFetching,
    savePermissionMutation,
    updateState,
    handleRefresh,
    handleTableChange,
    handleAdd,
    handleEdit,
    handleCancelEdit,
    handleConfirmEdit,
    handleDelete,
  } = useMenuInterfacePermission(menu);

  // 监听错误状态变化，自动聚焦到第一个错误输入框
  useEffect(() => {
    if (Object.keys(state.errors).length > 0) {
      requestAnimationFrame(() => {
        if (state.errors.code) {
          codeInputRef.current?.focus();
        } else if (state.errors.remark) {
          remarkInputRef.current?.focus();
        }
      });
    }
  }, [state.errors]);

  // 更新表单字段
  const handleUpdateForm = (
    updates: Partial<{ code: string; remark: string; path: string; method: string; name: string }>
  ) => {
    updateState({
      editForm: { ...state.editForm, ...updates },
    });
  };

  // 获取表格列定义
  const columns = useTableColumns({
    state: {
      editingId: state.editingId,
      editForm: state.editForm,
      errors: state.errors,
    },
    hasEditPermission: permissions.canEditInterfacePermission,
    hasDeletePermission: permissions.canDeleteInterfacePermission,
    isPending: savePermissionMutation.isPending,
    codeInputRef,
    remarkInputRef,
    onUpdateForm: handleUpdateForm,
    onConfirmEdit: handleConfirmEdit,
    onCancelEdit: handleCancelEdit,
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <Card
      className="flex-1 max-h-full flex flex-col min-w-0"
      title="接口权限列表"
      styles={{ body: { flex: 1, maxHeight: 0 } }}
      extra={
        <Button
          color="default"
          variant="outlined"
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={isFetching}
        >
          刷新
        </Button>
      }
    >
      <Table
        columns={columns}
        loading={isFetching}
        dataSource={state.permissionList}
        rowKey="id"
        pagination={{
          current: state.pagination.current,
          pageSize: state.pagination.pageSize,
          total: state.pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
        scroll={{ x: 'max-content', y: 'calc(100vh - 740px)' }}
        size="middle"
        bordered
        footer={() => (
          <TableFooter
            menu={menu}
            hasUnsavedData={!!state.editingId}
            hasAddPermission={permissions.canAddInterfacePermission}
            onAdd={handleAdd}
          />
        )}
      />
    </Card>
  );
};

export default MenuInterfacePermission;
