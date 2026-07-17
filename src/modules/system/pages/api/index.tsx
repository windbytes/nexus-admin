/**
 * @file 系统管理 - 系统接口维护
 * @description 左菜单树 + 右接口表格 + 表单弹窗；路由 component：`system/api`。
 */

import type { Key } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'antd';
import type { ApiModel } from '@/shared/api/system/api/type';
import ProTable from '@/shared/components/pro/ProTable';
import ApiFormModal from './components/ApiFormModal';
import MenuTree from './components/MenuTree';
import TableActionButtons from './components/TableActionButtons';
import { useApiActions, useApiData } from './hooks/useApiActions';
import { useApiModals } from './hooks/useApiModals';
import { useApiTableColumns } from './hooks/useApiTableColumns';
import { useMenuTreeData } from './hooks/useMenuTreeData';

/**
 * 系统接口维护：左菜单树 + 右接口表格 + 弹窗表单。
 *
 * @returns 接口管理完整页面
 */
function Apis() {
  const { formOpen, editingRecord, openForm, closeForm } = useApiModals();
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const { menuList, menuLoading, apiList, apiLoading, refetchApis } = useApiData(selectedMenuId);

  const { handleModalSave, handleAdd, handleDelete, handleBatchDelete } = useApiActions({
    selectedMenuId,
    selectedRowKeys,
    setSelectedRowKeys,
    openForm,
    closeForm,
    refetchApis,
  });
  const { t } = useTranslation();
  const menuTreeData = useMenuTreeData(menuList, t);
  const columns = useApiTableColumns({
    onEdit: openForm,
    onDelete: handleDelete,
    actionsDisabled: !selectedMenuId,
  });

  const sortedApiList = [...apiList].sort((a, b) => (a.path ?? '').localeCompare(b.path ?? ''));

  /**
   * @param keys - 选中菜单 key
   */
  function onMenuSelect(keys: Key[]) {
    setSelectedMenuId(keys?.length ? (keys[0] as string) : null);
    setSelectedRowKeys([]);
  }

  return (
    <>
      <div className="h-full flex gap-2">
        <MenuTree treeData={menuTreeData} loading={menuLoading} onSelect={onMenuSelect} />
        <div className="flex-1 min-w-0 flex flex-col">
          <ProTable<ApiModel>
            title="接口列表"
            columns={columns}
            dataSource={sortedApiList}
            loading={apiLoading}
            rowKey="id"
            locale={
              selectedMenuId
                ? undefined
                : {
                    emptyText: (
                      <Alert title="请先在左侧选择要配置接口的菜单（仅叶子/可点击页面）" type="warning" showIcon />
                    ),
                  }
            }
            actionButtons={
              <TableActionButtons
                selectedMenuId={selectedMenuId}
                onAdd={handleAdd}
                onBatchDelete={handleBatchDelete}
                onRefresh={refetchApis}
                selectedRowKeys={selectedRowKeys}
              />
            }
            onRefresh={refetchApis}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys ?? []),
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

      <ApiFormModal
        open={formOpen}
        menuId={selectedMenuId}
        record={editingRecord}
        onOk={handleModalSave}
        onClose={closeForm}
      />
    </>
  );
}

export default Apis;
