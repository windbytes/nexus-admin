import type { Endpoint, EndpointFormData } from '@/services/integrated/endpoint/endpointApi';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { App } from 'antd';
import { useCallback } from 'react';

interface EndpointHandlersOptions {
  modalActions: {
    openAdd: () => void;
    openEdit: (record: Endpoint) => void;
    openClone: (record: Endpoint) => void;
  };
  drawerActions: {
    openDetail: (record: Endpoint) => void;
    openTest: (record: Endpoint) => void;
    openVersion: (record: Endpoint) => void;
    openLog: (record: Endpoint) => void;
  };
  selectionActions: {
    setSelection: (selectedRowKeys: React.Key[], selectedRows: Endpoint[]) => void;
    clearSelection: () => void;
  };
  mutations: {
    deleteEndpoint: { mutate: (id: string) => void };
    batchDeleteEndpoint: { mutate: (ids: string[]) => void };
    exportConfig: { mutate: (params: { id: string; name: string }) => void };
    updateStatus: { mutate: (data: EndpointFormData) => void };
  };
  selectedData: {
    selectedRowKeys: React.Key[];
    selectedRows: Endpoint[];
  };
}

/**
 * 端点操作处理器Hook
 * 整合所有表格、按钮和抽屉的操作处理逻辑
 */
export const useEndpointHandlers = ({
  modalActions,
  drawerActions,
  selectionActions,
  mutations,
  selectedData,
}: EndpointHandlersOptions) => {
  const { modal, message } = App.useApp();

  /**
   * 表格操作处理器
   */
  const tableHandlers = {
    onView: useCallback((record: Endpoint) => {
      drawerActions.openDetail(record);
    }, [drawerActions]),

    onEdit: useCallback(
      (record: Endpoint) => {
        modalActions.openEdit(record);
      },
      [modalActions]
    ),

    onClone: useCallback(
      (record: Endpoint) => {
        modalActions.openClone(record);
      },
      [modalActions]
    ),

    onDelete: useCallback(
      (record: Endpoint) => {
        modal.confirm({
          title: '确认删除',
          icon: <ExclamationCircleOutlined />,
          content: `确定要删除端点"${record.name}"吗？此操作不可恢复。`,
          okText: '确定',
          okType: 'danger',
          cancelText: '取消',
          onOk: () => {
            mutations.deleteEndpoint.mutate(record.id);
          },
        });
      },
      [modal, mutations.deleteEndpoint]
    ),

    onExport: useCallback(
      (record: Endpoint) => {
        mutations.exportConfig.mutate({
          id: record.id,
          name: record.name,
        });
      },
      [mutations.exportConfig]
    ),

    onTest: useCallback(
      (record: Endpoint) => {
        drawerActions.openTest(record);
      },
      [drawerActions]
    ),

    onVersion: useCallback(
      (record: Endpoint) => {
        drawerActions.openVersion(record);
      },
      [drawerActions]
    ),

    onLog: useCallback(
      (record: Endpoint) => {
        drawerActions.openLog(record);
      },
      [drawerActions]
    ),

    onStatusChange: useCallback(
      (record: Endpoint, checked: boolean) => {
        mutations.updateStatus.mutate({
          ...record,
          status: checked,
        });
      },
      [mutations.updateStatus]
    ),

    onSelectionChange: useCallback(
      (selectedRowKeys: React.Key[], selectedRows: Endpoint[]) => {
        selectionActions.setSelection(selectedRowKeys, selectedRows);
      },
      [selectionActions]
    ),
  };

  /**
   * 操作按钮处理器
   */
  const actionHandlers = {
    onAdd: useCallback(() => {
      modalActions.openAdd();
    }, [modalActions]),

    onBatchDelete: useCallback(() => {
      if (selectedData.selectedRowKeys.length === 0) {
        message.warning('请先选择要删除的端点！');
        return;
      }

      modal.confirm({
        title: '确认批量删除',
        icon: <ExclamationCircleOutlined />,
        content: `确定要删除选中的 ${selectedData.selectedRowKeys.length} 个端点吗？此操作不可恢复。`,
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          mutations.batchDeleteEndpoint.mutate(selectedData.selectedRowKeys as string[]);
        },
      });
    }, [selectedData.selectedRowKeys, modal, message, mutations.batchDeleteEndpoint]),

    onImport: useCallback(() => {
      message.info('导入功能开发中...');
    }, [message]),

    onBatchExport: useCallback(() => {
      if (selectedData.selectedRowKeys.length === 0) {
        message.warning('请先选择要导出的端点！');
        return;
      }

      // 逐个导出选中的端点
      selectedData.selectedRows.forEach((record) => {
        mutations.exportConfig.mutate({
          id: record.id,
          name: record.name,
        });
      });
    }, [selectedData.selectedRowKeys, selectedData.selectedRows, message, mutations.exportConfig]),

    onRefresh: undefined as any, // 需要外部传入refetch函数
  };

  return {
    tableHandlers,
    actionHandlers,
  };
};

