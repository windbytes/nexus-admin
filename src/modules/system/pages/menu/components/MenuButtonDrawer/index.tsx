/**
 * @file 菜单按钮配置抽屉
 * @description 在菜单页行操作中打开，管理该菜单下的按钮（permType=1 权限点）。
 */

import { DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { App, Button, Drawer, Space, Table, Typography } from 'antd';
import { type Key, useMemo, useState } from 'react';
import { permissionService } from '@/modules/system/api/permission';
import type { MenuModel } from '@/shared/api/system/menu/type';
import type { PermissionModel } from '@/shared/api/system/permission/type';
import ButtonFormModal from './ButtonFormModal';
import { useMenuButtonActions } from './useMenuButtonActions';
import { useMenuButtonColumns } from './useMenuButtonColumns';
import { useMenuButtonPermissions } from './useMenuButtonPermissions';

export interface MenuButtonDrawerProps {
  open: boolean;
  /** 目标菜单（抽屉标题展示菜单名） */
  menu: MenuModel | null;
  onClose: () => void;
}

/**
 * 菜单按钮配置抽屉：按 menuId 分页拉取 permType=1 权限点，支持新增/编辑/删除/启停。
 *
 * @param props - 开关、目标菜单与关闭回调
 * @returns 抽屉 + 表格 + 表单弹窗
 */
function MenuButtonDrawer({ open, menu, onClose }: MenuButtonDrawerProps) {
  const { modal, message } = App.useApp();
  const { canAdd, canDelete } = useMenuButtonPermissions();
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Partial<PermissionModel> | null>(null);

  const menuId = menu?.id;

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['system', 'permission', 'menuButtons', menuId],
    queryFn: () =>
      permissionService.queryPermissionListPage({
        pageNum: 1,
        pageSize: 999,
        total: 0,
        menuId,
        permType: 1,
      }),
    enabled: open && !!menuId,
    select: (page) => page.records ?? [],
  });

  const buttons = useMemo(() => data ?? [], [data]);

  /**
   * 刷新表格并清空选中。
   */
  function refresh() {
    setSelectedRowKeys([]);
    refetch();
  }

  const { handleModalSave, batchDelete } = useMenuButtonActions({
    currentRow: editingRow,
    onSuccess: () => {
      setModalOpen(false);
      setEditingRow(null);
      refresh();
    },
  });

  const columns = useMenuButtonColumns({
    onEdit: (record) => {
      setEditingRow(record);
      setModalOpen(true);
    },
    onSuccess: refresh,
  });

  /**
   * 打开新增弹窗。
   */
  function openAdd() {
    setEditingRow(null);
    setModalOpen(true);
  }

  /**
   * 批量删除前二次确认。
   */
  function handleBatchDelete() {
    const ids = selectedRowKeys.map(String);
    if (ids.length === 0) {
      return;
    }
    modal.confirm({
      title: '批量删除',
      content: `确定删除选中的 ${ids.length} 个按钮吗？`,
      okButtonProps: { danger: true },
      onOk: () => batchDelete(ids),
    });
  }

  return (
    <Drawer
      title={
        <Space size={8}>
          <span>按钮配置</span>
          {menu && (
            <Typography.Text type="secondary" style={{ fontWeight: 400 }}>
              {menu.name}
            </Typography.Text>
          )}
        </Space>
      }
      open={open}
      width={720}
      onClose={() => {
        message.destroy();
        onClose();
      }}
      destroyOnHidden
    >
      <div className="flex flex-col gap-3">
        <Space>
          <Button type="primary" icon={<PlusOutlined />} disabled={!canAdd || !menuId} onClick={openAdd}>
            新增按钮
          </Button>
          <Button danger icon={<DeleteOutlined />} disabled={!canDelete || selectedRowKeys.length === 0} onClick={handleBatchDelete}>
            批量删除
          </Button>
          <Button icon={<ReloadOutlined />} onClick={refresh} loading={isFetching}>
            刷新
          </Button>
        </Space>
        <Table<PermissionModel>
          rowKey="id"
          size="small"
          loading={isFetching}
          columns={columns}
          dataSource={buttons}
          pagination={false}
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        />
      </div>
      {menuId && (
        <ButtonFormModal
          open={modalOpen}
          menuId={menuId}
          record={editingRow}
          onOk={handleModalSave}
          onClose={() => {
            setModalOpen(false);
            setEditingRow(null);
          }}
        />
      )}
    </Drawer>
  );
}

export default MenuButtonDrawer;
