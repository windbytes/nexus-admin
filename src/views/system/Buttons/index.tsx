import { ExclamationCircleFilled } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { App } from 'antd';
import type { Key } from 'react';
import { useState } from 'react';
import ProTable from '@/components/ProTable';
import { menuService } from '@/services/system/menu/menuApi';
import { pageButtonService } from '@/services/system/pageButton/pageButtonApi';
import type { PageButtonModel } from '@/services/system/pageButton/type';
import ButtonFormModal from './components/ButtonFormModal';
import MenuTreePanel from './components/MenuTreePanel';
import TableActionButtons from './components/TableActionButtons';
import { useButtonActions } from './hooks/useButtonActions';
import { useButtonModals } from './hooks/useButtonModals';
import { useButtonTableColumns } from './hooks/useButtonTableColumns';

/**
 * 页面按钮配置模块：左菜单树 + 右按钮表格 + 弹窗表单
 */
const Buttons: React.FC = () => {
  const { modal } = App.useApp();
  const { modal: modalName, current, openModal, closeModal } = useButtonModals();
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const { data: menuList = [], isFetching: menuLoading } = useQuery({
    queryKey: ['sys_menu_buttons_tree'],
    queryFn: () => menuService.getAllMenus({}),
  });

  const {
    data: buttonList = [],
    isFetching: buttonLoading,
    refetch: refetchButtons,
  } = useQuery({
    queryKey: ['sys_page_button', selectedMenuId],
    queryFn: () => (selectedMenuId ? pageButtonService.queryByMenuId({ menuId: selectedMenuId }) : Promise.resolve([])),
    enabled: !!selectedMenuId,
  });

  const sortedButtonList = [...buttonList].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));

  const handleSuccess = () => {
    closeModal();
    setSelectedRowKeys([]);
    refetchButtons();
  };

  const { handleModalSave, batchDelete } = useButtonActions({
    currentRow: current,
    onSuccess: handleSuccess,
  });

  const columns = useButtonTableColumns({
    openModal,
    onSuccess: () => refetchButtons(),
    actionsDisabled: !selectedMenuId,
  });

  const handleMenuSelect = (menuId: string | null) => {
    setSelectedMenuId(menuId);
    setSelectedRowKeys([]);
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      modal.warning({ content: '请先勾选要删除的按钮' });
      return;
    }
    modal.confirm({
      title: '批量删除',
      icon: <ExclamationCircleFilled />,
      content: `确定删除选中的 ${selectedRowKeys.length} 个按钮吗？`,
      okButtonProps: { danger: true },
      onOk: () => {
        batchDelete(selectedRowKeys as string[]);
        setSelectedRowKeys([]);
      },
    });
  };

  const rightContent = (
    <ProTable<PageButtonModel>
      title="按钮列表"
      columns={columns}
      dataSource={sortedButtonList}
      loading={buttonLoading}
      rowKey="id"
      locale={selectedMenuId ? undefined : { emptyText: '请先在左侧选择要配置按钮的菜单（仅叶子/可点击页面）' }}
      actionButtons={
        <TableActionButtons
          selectedMenuId={selectedMenuId}
          selectedRowKeys={selectedRowKeys}
          onAdd={() => openModal('add')}
          onBatchDelete={handleBatchDelete}
          onRefresh={refetchButtons}
        />
      }
      onRefresh={refetchButtons}
      rowSelection={{
        type: 'checkbox',
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys || []),
      }}
      bordered
      pagination={false}
      scroll={{ x: 'max-content' }}
      cardClassNames={{
        root: 'grow min-h-0 flex flex-col',
        body: 'flex grow',
        table: {
          container: 'grow min-h-0 min-w-0',
          root: 'full-height-table',
        },
      }}
    />
  );

  return (
    <>
      <div className="h-full flex gap-2">
        <MenuTreePanel menuList={menuList} loading={menuLoading} onSelect={handleMenuSelect} />
        <div className="flex-1 min-w-0 flex flex-col">{rightContent}</div>
      </div>
      <ButtonFormModal
        open={modalName === 'add' || modalName === 'edit'}
        menuId={selectedMenuId}
        record={modalName === 'edit' ? current : null}
        onOk={handleModalSave}
        onClose={closeModal}
      />
    </>
  );
};

export default Buttons;
