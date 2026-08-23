/**
 * @file 系统管理 - 接口管理
 * @description 左接口权限分组树 + 右接口注册表（分页/CRUD/扫描同步）；路由 component：`system/api`。
 */

import { DeleteOutlined, PlusOutlined, ReloadOutlined, ScanOutlined } from '@ant-design/icons';
import { App, Button } from 'antd';
import { isEqual } from 'lodash-es';
import { type Key, useEffect, useState } from 'react';
import type { ApiModel, ApiSearchParams } from '@/shared/api/system/api/type';
import ProTable from '@/shared/components/pro/ProTable';
import ApiFormModal from './components/ApiFormModal';
import PermissionGroupTree from './components/PermissionGroupTree';
import SearchForm from './components/SearchForm';
import { useApiActions, useApiPageData, usePermissionTreeData } from './hooks/useApiActions';
import { useApiPermissions } from './hooks/useApiPermissions';
import { useApiTableColumns } from './hooks/useApiTableColumns';

/**
 * 接口管理完整页面。
 *
 * @returns 分组树 + 注册表 + 表单弹窗
 */
function Apis() {
  const { modal } = App.useApp();
  const permissions = useApiPermissions();
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Partial<ApiModel> | null>(null);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useState<ApiSearchParams>({
    pageNum: 1,
    pageSize: 20,
  });

  const { tree, treeLoading, refetchTree } = usePermissionTreeData();
  const { apiList, totalRow, apiLoading, refetchApis } = useApiPageData(searchParams, total);
  const { handleModalSave, handleDelete, handleBatchDelete, handleScan, scanning } = useApiActions({
    selectedRowKeys,
    setSelectedRowKeys,
    closeForm: () => {
      setFormOpen(false);
      setEditingRecord(null);
    },
    refetchApis,
  });

  useEffect(() => {
    if (searchParams.pageNum === 1) {
      setTotal(totalRow);
    }
  }, [searchParams.pageNum, totalRow]);

  /**
   * @param values - 搜索表单值
   */
  function handleSearch(values: Partial<ApiSearchParams>) {
    const search = { ...values, pageNum: 1, pageSize: searchParams.pageSize };
    if (isEqual(search, searchParams)) {
      refetchApis();
      return;
    }
    setSearchParams((prev) => ({ ...prev, ...search, pageNum: 1 }));
  }

  /**
   * 点选左侧权限点：设置 permId 过滤并回到第一页。
   * @param permId - 接口权限点 ID；`null` 清除过滤
   */
  function handleSelectPerm(permId: string | null) {
    setSelectedRowKeys([]);
    setSearchParams((prev) => ({ ...prev, permId: permId ?? undefined, pageNum: 1 }));
  }

  /**
   * @param page - 页码
   * @param pageSize - 每页条数
   */
  function handlePageChange(page: number, pageSize?: number) {
    setSearchParams((prev) => ({
      ...prev,
      pageNum: page,
      pageSize: pageSize || prev.pageSize,
    }));
  }

  /**
   * 打开新增弹窗。
   */
  function handleAdd() {
    if (!permissions.canAdd) {
      modal.error({ title: '权限不足', content: '您没有新增接口的权限，请联系管理员获取相应权限。' });
      return;
    }
    setEditingRecord(null);
    setFormOpen(true);
  }

  const columns = useApiTableColumns({
    onEdit: (record) => {
      setEditingRecord(record);
      setFormOpen(true);
    },
    onDelete: handleDelete,
  });

  return (
    <>
      <div className="h-full flex gap-2">
        <PermissionGroupTree
          tree={tree}
          loading={treeLoading}
          defaultSelectedKey={tree[0]?.id ?? null}
          onSelectPerm={handleSelectPerm}
          onTreeChanged={refetchTree}
        />
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <SearchForm onSearch={handleSearch} loading={apiLoading} />
          <ProTable<ApiModel>
            title="接口注册表"
            columns={columns}
            dataSource={apiList}
            loading={apiLoading}
            rowKey="id"
            actionButtons={
              <div className="flex gap-2">
                <Button type="primary" icon={<PlusOutlined />} disabled={!permissions.canAdd} onClick={handleAdd}>
                  新增
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  disabled={selectedRowKeys.length === 0 || !permissions.canBatchDelete}
                  onClick={handleBatchDelete}
                >
                  批量删除
                </Button>
                <Button
                  icon={<ScanOutlined />}
                  disabled={!permissions.canScan}
                  loading={scanning}
                  onClick={() => {
                    if (!permissions.canScan) {
                      modal.error({ title: '权限不足', content: '您没有扫描同步的权限，请联系管理员获取相应权限。' });
                      return;
                    }
                    handleScan();
                  }}
                >
                  扫描同步
                </Button>
                <Button icon={<ReloadOutlined />} onClick={() => refetchApis()}>
                  刷新
                </Button>
              </div>
            }
            onRefresh={refetchApis}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys ?? []),
            }}
            bordered
            pagination={{
              current: searchParams.pageNum,
              pageSize: searchParams.pageSize,
              total: totalRow,
              showSizeChanger: true,
              showTotal: (count) => `共 ${count} 条`,
              onChange: handlePageChange,
            }}
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
        record={editingRecord}
        permTree={tree}
        onOk={handleModalSave}
        onClose={() => {
          setFormOpen(false);
          setEditingRecord(null);
        }}
      />
    </>
  );
}

export default Apis;
