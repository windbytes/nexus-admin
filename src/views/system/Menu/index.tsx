import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { App, Button } from 'antd';
import { isEqual } from 'lodash-es';
import type React from 'react';
import { type Key, useState } from 'react';
import ProTable from '@/components/ProTable';
import { menuService } from '@/services/system/menu/menuApi';
import type { MenuModel } from '@/services/system/menu/type';
import MenuInfoModal from './components/MenuInfoModal';
import SearchForm from './components/SearchForm';
import { useMenuActions } from './hooks/useMenuActions';
import { useMenuModals } from './hooks/useMenuModals';
import { useMenuPermissions } from './hooks/useMenuPermissions';
import { useMenuTableColumns } from './hooks/useMenuTableColumns';
import type { MenuSearchParams } from './types';

/**
 * 菜单管理页面主组件
 */
const Menu: React.FC = () => {
  const { modal } = App.useApp();
  // 窗口管理hook
  const {
    modal: modalName,
    current,
    editingMenu,
    parentMenu,
    copiedMenuData,
    openModal,
    closeModal,
    setCopiedData,
  } = useMenuModals();
  // 选中的行
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  // 查询参数
  const [searchParams, setSearchParams] = useState<MenuSearchParams>({
    pageNum: 1,
    pageSize: 20,
  });
  // 权限列表
  const permissions = useMenuPermissions();

  // 查询菜单数据
  const {
    isFetching,
    data: menuList,
    refetch,
  } = useQuery({
    queryKey: ['sys_menu', searchParams],
    queryFn: () => menuService.getAllMenus({ name: searchParams.name }),
  });

  // 通用成功回调
  const handleSuccess = () => {
    // 关闭窗口
    closeModal();
    setSelectedRowKeys([]);
    refetch();
  };

  // 菜单操作hook
  const { deleteMenuBatch, handleModalSave } = useMenuActions({
    currentRow: editingMenu,
    onSuccess: handleSuccess,
  });

  // 处理搜索
  const handleSearch = (values: MenuSearchParams) => {
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
    setSearchParams((prev: MenuSearchParams) => ({ ...prev, ...search }));
  };

  // 处理行选择变化
  const handleSelectionChange = (keys: Key[], _rows: MenuModel[]) => {
    setSelectedRowKeys(keys as string[]);
  };

  // 批量删除
  const handleBatchDelete = (ids: string[]) => {
    if (!permissions.canDeleteMenu) {
      modal.error({
        title: '权限不足',
        content: '您没有删除菜单的权限，请联系管理员获取相应权限。',
      });
      return;
    }
    modal.confirm({
      title: '删除菜单',
      icon: <ExclamationCircleFilled />,
      content: '确定删除选中的菜单吗？数据删除后将无法恢复！',
      okButtonProps: {
        danger: true,
        type: 'default',
      },
      cancelButtonProps: {
        type: 'primary',
      },
      onOk() {
        deleteMenuBatch(ids);
      },
    });
  };

  // 获取表格列定义
  const columns = useMenuTableColumns({
    currentRow: current,
    onSuccess: handleSuccess,
    openModal,
    setCopiedData,
  });

  // 打开详情
  const handleOpenDetail = (record: MenuModel) => {
    openModal('view', record);
  };

  return (
    <>
      <div className="h-full flex flex-col gap-2">
        {/* 菜单搜索栏 */}
        <SearchForm onSearch={handleSearch} loading={isFetching} />
        {/* 菜单数据表格 */}
        <ProTable<MenuModel>
          title="菜单列表"
          columns={columns}
          dataSource={menuList || []}
          loading={isFetching}
          rowKey="id"
          actionButtons={
            <div className="flex gap-2">
              {permissions.canAddMenu && (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('add')}>
                  新增菜单
                </Button>
              )}
              {permissions.canDeleteMenu && (
                <Button
                  danger
                  onClick={() => handleBatchDelete(selectedRowKeys)}
                  disabled={selectedRowKeys.length === 0}
                >
                  批量删除
                </Button>
              )}
            </div>
          }
          onRefresh={refetch}
          rowSelection={{
            type: 'checkbox' as const,
            selectedRowKeys,
            onChange: handleSelectionChange,
          }}
          expandable={{
            defaultExpandAllRows: false,
            childrenColumnName: 'children',
          }}
          rowClassName={(record: MenuModel) => (record.status === false ? 'opacity-60 bg-gray-50' : '')}
          onRow={(record: MenuModel) => ({
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
      {/* 编辑/新增菜单弹窗 */}
      <MenuInfoModal
        open={modalName === 'add' || modalName === 'edit' || modalName === 'view'}
        onOk={handleModalSave}
        onClose={closeModal}
        menu={modalName === 'add' ? parentMenu || undefined : editingMenu || undefined}
        operation={modalName === 'add' ? 'add' : modalName === 'view' ? 'view' : 'edit'}
        copiedMenuData={copiedMenuData || undefined}
      />
    </>
  );
};

export default Menu;
