/**
 * @file 系统管理 - 页面按钮配置
 * @description 左菜单树 + 右按钮表格 + 表单弹窗；路由 component：`system/button`。
 */

import { ExclamationCircleFilled } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Alert, App } from 'antd';
import type { Key } from 'react';
import { useState } from 'react';
import { menuService } from '@/modules/system/api/menu';
import { pageButtonService } from '@/modules/system/api/pageButton';
import type { PageButtonModel } from '@/shared/api/system/pageButton/type';
import ProTable from '@/shared/components/pro/ProTable';
import ButtonFormModal from './components/ButtonFormModal';
import MenuTreePanel from './components/MenuTreePanel';
import TableActionButtons from './components/TableActionButtons';
import { useButtonActions } from './hooks/useButtonActions';
import { useButtonModals } from './hooks/useButtonModals';
import { useButtonPermissions } from './hooks/useButtonPermissions';
import { useButtonTableColumns } from './hooks/useButtonTableColumns';

/**
 * 页面按钮配置模块：左菜单树 + 右按钮表格 + 弹窗表单。
 *
 * @returns 按钮管理完整页面
 */
function Buttons() {
  const { modal } = App.useApp();
  const { modal: modalName, current, openModal, closeModal } = useButtonModals();
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const permissions = useButtonPermissions();

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

  /**
   * 写操作成功：关闭弹窗、清空勾选并刷新列表。
   */
  function handleSuccess() {
    closeModal();
    setSelectedRowKeys([]);
    refetchButtons();
  }

  const { handleModalSave, batchDelete } = useButtonActions({
    currentRow: current,
    onSuccess: handleSuccess,
  });

  const columns = useButtonTableColumns({
    openModal,
    onSuccess: () => refetchButtons(),
    actionsDisabled: !selectedMenuId,
  });

  /**
   * @param menuId - 选中的菜单 ID
   */
  function handleMenuSelect(menuId: string | null) {
    setSelectedMenuId(menuId);
    setSelectedRowKeys([]);
  }

  /**
   * 批量删除确认。
   */
  function handleBatchDelete() {
    if (!permissions.canBatchDelete) {
      modal.error({
        title: '权限不足',
        content: '您没有批量删除按钮的权限，请联系管理员获取相应权限。',
      });
      return;
    }
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
  }

  return (
    <>
      <div className="h-full flex gap-2">
        <MenuTreePanel menuList={menuList} loading={menuLoading} onSelect={handleMenuSelect} />
        <div className="flex-1 min-w-0 flex flex-col">
          <ProTable<PageButtonModel>
            title="按钮列表"
            columns={columns}
            dataSource={sortedButtonList}
            loading={buttonLoading}
            rowKey="id"
            locale={
              selectedMenuId
                ? undefined
                : {
                    emptyText: (
                      <Alert title="请先在左侧选择要配置按钮的菜单（仅叶子/可点击页面）" type="warning" showIcon />
                    ),
                  }
            }
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
        </div>
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
}

export default Buttons;
