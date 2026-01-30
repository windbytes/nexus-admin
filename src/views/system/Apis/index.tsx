import type { Key } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProTable from '@/components/ProTable';
import type { ApiModel } from '@/services/system/api/type';
import ApiFormModal from './components/ApiFormModal';
import MenuTree from './components/MenuTree';
import TableActionButtons from './components/TableActionButtons';
import { useApiActions, useApiData } from './hooks/useApiActions';
import { useApiModals } from './hooks/useApiModals';
import { useApiTableColumn } from './hooks/useApiTableColumn';
import { useMenuTreeData } from './hooks/useMenuTreeData';

/**
 * 系统接口维护：左菜单树 + 右接口表格 + 弹窗表单
 */
const Apis: React.FC = () => {
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
  const columns = useApiTableColumn({
    onEdit: openForm,
    onDelete: handleDelete,
    actionsDisabled: !selectedMenuId,
  });

  const sortedApiList = [...apiList].sort((a, b) => (a.path ?? '').localeCompare(b.path ?? ''));

  const onMenuSelect = (keys: Key[]) => {
    setSelectedMenuId(keys?.length ? (keys[0] as string) : null);
    setSelectedRowKeys([]);
  };

  const rightContent = (
    <ProTable<ApiModel>
      title="接口列表"
      columns={columns}
      dataSource={sortedApiList}
      loading={apiLoading}
      rowKey="id"
      locale={selectedMenuId ? undefined : { emptyText: '请先在左侧选择要配置接口的菜单（仅叶子/可点击页面）' }}
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
  );

  return (
    <>
      <div className="h-full flex gap-2">
        <MenuTree treeData={menuTreeData} loading={menuLoading} onSelect={onMenuSelect} />
        <div className="flex-1 min-w-0 flex flex-col">{rightContent}</div>
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
};

export default Apis;
