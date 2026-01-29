import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Badge, Button, Dropdown, type MenuProps, Space, Upload } from 'antd';
import type { Key } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnEdit24Regular,
  CsvOutline,
  DeleteDismiss24Filled,
  FileTypeExcel,
  FolderExport,
  FolderImport,
  PdfIcon,
} from '@/components/icons';
import type { PermissionModel } from '@/services/system/permission/type';
import type { ModalType } from '../hooks/usePermissionModals';
import { usePermissionPermissions } from '../hooks/usePermissionPermissions';

interface TableActionButtonsProps {
  handleBatchDelete: () => void;
  refetch: () => void;
  selectedRows: Key[];
  openModal: (name: ModalType, record?: PermissionModel) => void;
}

/**
 * 表格操作按钮
 */
const TableActionButtons: React.FC<TableActionButtonsProps> = ({
  handleBatchDelete,
  refetch,
  selectedRows,
  openModal,
}) => {
  const { message, modal } = App.useApp();
  const { t } = useTranslation();
  // 权限检查
  const { canAdd, canDelete, canBatchImport, canBatchExport } = usePermissionPermissions();

  // 导出选项
  const exportItems: MenuProps['items'] = [
    {
      key: 'csv',
      label: '导出为CSV',
      icon: <CsvOutline className="text-sm! block! text-orange-400" />,
      onClick: () => {
        modal.error({
          title: '功能暂未开放',
          content: '导出CSV功能正在开发中，敬请期待。',
        });
      },
    },
    {
      key: 'excel',
      label: '导出为Excel',
      icon: <FileTypeExcel className="text-sm! block!" />,
      onClick: () => {
        modal.error({
          title: '功能暂未开放',
          content: '导出Excel功能正在开发中，敬请期待。',
        });
      },
    },
    {
      key: 'pdf',
      label: '导出为PDF',
      icon: <PdfIcon className="text-sm! block" />,
      onClick: () => {
        modal.error({
          title: '功能暂未开放',
          content: '导出PDF功能正在开发中，敬请期待。',
        });
      },
    },
  ];

  // 批量操作选项
  const batchItems: MenuProps['items'] = [
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: '批量删除',
      icon: <DeleteDismiss24Filled className="text-sm! block! text-(--ant-color-error)" />,
      disabled: selectedRows.length === 0 || !canDelete,
      onClick: () => {
        if (!canDelete) {
          modal.error({
            title: '权限不足',
            content: '您没有批量删除权限点的权限，请联系管理员获取相应权限。',
          });
          return;
        }
        handleBatchDelete();
      },
    },
  ];

  return (
    <div className="flex grow items-center justify-between">
      {/* 左侧主要操作按钮 */}
      <Space size="middle">
        {canAdd && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('add')}>
            {t('common.operation.add')}
          </Button>
        )}
        {canBatchImport && (
          <Upload
            accept=".xlsx,.xls"
            showUploadList={false}
            action="/api/permission/import"
            onChange={(info) => {
              if (info.file.status === 'done') {
                message.success('导入成功');
                refetch();
              } else if (info.file.status === 'error') {
                modal.error({
                  title: '导入失败',
                  content: '权限点数据导入失败，请检查文件格式或联系技术支持。',
                });
              }
            }}
          >
            <Button icon={<FolderImport className="block!" />}>{t('common.operation.import')}</Button>
          </Upload>
        )}

        {canBatchExport && (
          <Space.Compact>
            <Button disabled={selectedRows.length === 0} icon={<FolderExport className="block!" />}>
              {t('common.operation.export')}
              {selectedRows.length > 0 && <Badge count={selectedRows.length} size="small" className="ml-1" />}
            </Button>
            <Dropdown disabled={selectedRows.length === 0} menu={{ items: exportItems }} placement="bottom">
              <Button icon={<DownOutlined />} />
            </Dropdown>
          </Space.Compact>
        )}

        {/* 批量操作下拉菜单 */}
        {selectedRows.length > 0 && (
          <Space.Compact>
            <Button disabled={selectedRows.length === 0} icon={<ColumnEdit24Regular className="block!" />}>
              批量操作
              {selectedRows.length > 0 && <Badge count={selectedRows.length} size="small" className="ml-1" />}
            </Button>
            <Dropdown disabled={selectedRows.length === 0} menu={{ items: batchItems }} placement="bottom">
              <Button icon={<DownOutlined />} />
            </Dropdown>
          </Space.Compact>
        )}
      </Space>
    </div>
  );
};

export default TableActionButtons;
