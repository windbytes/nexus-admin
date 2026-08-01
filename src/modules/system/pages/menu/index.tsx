import { ExclamationCircleFilled, ExportOutlined, ImportOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { App, Badge, Button, Dropdown, type MenuProps, Upload } from 'antd';
import { isEqual } from 'lodash-es';
import { type Key, useState } from 'react';
import { menuService } from '@/modules/system/api/menu';
import type { MenuModel } from '@/shared/api/system/menu/type';
import ProTable from '@/shared/components/pro/ProTable';
import MenuButtonDrawer from './components/MenuButtonDrawer';
import MenuInfoModal from './components/MenuInfoModal';
import SearchForm from './components/SearchForm';
import { useMenuActions } from './hooks/useMenuActions';
import { useMenuModals } from './hooks/useMenuModals';
import { useMenuPermissions } from './hooks/useMenuPermissions';
import { useMenuTableColumns } from './hooks/useMenuTableColumns';
import type { MenuSearchParams } from './types';

/**
 * 系统管理 - 菜单管理页面。
 *
 * 提供菜单树的查询、新增/编辑/查看、复制、状态切换、批量删除，以及 CSV 导入导出。
 * 路由 component 约定：`system/menu` → 本文件。
 *
 * @returns 菜单管理完整页面
 */
function Menu() {
  const { modal } = App.useApp();
  const {
    modal: modalName,
    editingMenu,
    parentMenu,
    copiedMenuData,
    openModal,
    closeModal,
    setCopiedData,
  } = useMenuModals();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useState<MenuSearchParams>({});
  const [buttonDrawerMenu, setButtonDrawerMenu] = useState<MenuModel | null>(null);
  const permissions = useMenuPermissions();

  const {
    isFetching,
    data: menuList,
    refetch,
  } = useQuery({
    queryKey: ['sys_menu', searchParams],
    queryFn: () =>
      menuService.getAllMenus({
        menuName: searchParams.name,
        menuType: searchParams.menuType,
        status: searchParams.status,
      }),
  });

  /**
   * 写操作成功：关闭弹窗、清空勾选并刷新列表。
   */
  function handleSuccess() {
    closeModal();
    setSelectedRowKeys([]);
    refetch();
  }

  const { deleteMenuBatch, handleModalSave, importMenus, exportMenus } = useMenuActions({
    currentRow: editingMenu,
    onSuccess: handleSuccess,
  });

  /**
   * 处理搜索提交；参数未变化时强制 refetch。
   * @param values - 搜索表单值
   */
  function handleSearch(values: MenuSearchParams) {
    if (isEqual(values, searchParams)) {
      refetch();
      return;
    }
    setSearchParams({ ...values });
  }

  /**
   * 表格行勾选变更。
   * @param keys - 选中行 key 列表
   */
  function handleSelectionChange(keys: Key[]) {
    setSelectedRowKeys(keys as string[]);
  }

  /**
   * 批量删除确认。
   * @param ids - 待删除菜单 ID
   */
  function handleBatchDelete(ids: string[]) {
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
  }

  const columns = useMenuTableColumns({
    currentRow: editingMenu,
    onSuccess: handleSuccess,
    openModal,
    setCopiedData,
    onConfigButtons: setButtonDrawerMenu,
  });

  /**
   * 双击行打开只读详情。
   * @param record - 菜单行
   */
  function handleOpenDetail(record: MenuModel) {
    openModal('view', record);
  }

  /**
   * Upload `beforeUpload`：校验权限后触发导入，并阻止 antd 默认上传。
   * @param file - 用户选择的文件
   * @returns `false` 或 `Upload.LIST_IGNORE`
   */
  function handleImport(file: File) {
    if (!permissions.canImportMenu) {
      modal.error({
        title: '权限不足',
        content: '您没有导入菜单的权限，请联系管理员获取相应权限。',
      });
      return Upload.LIST_IGNORE;
    }
    importMenus(file);
    return false;
  }

  /**
   * 导出菜单（全部或选中）。
   * @param type - `all` 按当前搜索条件；`selected` 按勾选行
   */
  function handleExport(type: 'all' | 'selected') {
    if (!permissions.canExportMenu) {
      modal.error({
        title: '权限不足',
        content: '您没有导出菜单的权限，请联系管理员获取相应权限。',
      });
      return;
    }
    exportMenus(type, type === 'selected' ? selectedRowKeys : undefined, type === 'all' ? searchParams : undefined);
  }

  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'all',
      label: '导出全部',
      onClick: () => handleExport('all'),
    },
    {
      key: 'selected',
      label: `导出选中${selectedRowKeys.length > 0 ? ` (${selectedRowKeys.length})` : ''}`,
      disabled: selectedRowKeys.length === 0,
      onClick: () => handleExport('selected'),
    },
  ];

  return (
    <>
      <div className="h-full flex flex-col gap-2">
        <SearchForm onSearch={handleSearch} loading={isFetching} />
        <ProTable<MenuModel>
          title="菜单列表"
          columns={columns}
          dataSource={menuList || []}
          loading={isFetching}
          rowKey="id"
          actionButtons={
            <div className="flex gap-2">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                disabled={!permissions.canAddMenu}
                onClick={() => openModal('add')}
              >
                新增菜单
              </Button>
              <Button
                danger
                onClick={() => handleBatchDelete(selectedRowKeys)}
                disabled={selectedRowKeys.length === 0 || !permissions.canDeleteMenu}
              >
                批量删除
              </Button>
              <Upload accept=".csv" showUploadList={false} beforeUpload={handleImport}>
                <Button icon={<ImportOutlined />} disabled={!permissions.canImportMenu}>
                  导入
                </Button>
              </Upload>
              <Dropdown menu={{ items: exportMenuItems }} disabled={!permissions.canExportMenu}>
                <Button icon={<ExportOutlined />} disabled={!permissions.canExportMenu}>
                  导出
                  {selectedRowKeys.length > 0 && <Badge count={selectedRowKeys.length} size="small" className="ml-1" />}
                </Button>
              </Dropdown>
            </div>
          }
          onRefresh={refetch}
          rowSelection={{
            type: 'checkbox' as const,
            checkStrictly: false,
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
          pagination={false}
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
      <MenuInfoModal
        open={modalName === 'add' || modalName === 'edit' || modalName === 'view'}
        onOk={handleModalSave}
        onClose={closeModal}
        menu={modalName === 'add' ? parentMenu || undefined : editingMenu || undefined}
        operation={modalName === 'add' ? 'add' : modalName === 'view' ? 'view' : 'edit'}
        copiedMenuData={copiedMenuData || undefined}
      />
      <MenuButtonDrawer
        open={!!buttonDrawerMenu}
        menu={buttonDrawerMenu}
        onClose={() => setButtonDrawerMenu(null)}
      />
    </>
  );
}

export default Menu;
