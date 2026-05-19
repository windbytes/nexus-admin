import {
  DeleteOutlined,
  DownOutlined,
  ExportOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  ImportOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { App, Badge, Button, Dropdown, type MenuProps, Space } from 'antd';
import type { Key } from 'react';
import { useTranslation } from 'react-i18next';
import type { ModalType } from '../hooks/useEndpointModals';
import { useEndpointPermissions } from '../hooks/useEndpointPermissions';

interface TableActionButtonsProps {
  handleBatchDelete: () => void;
  refetch: () => void;
  selectedRows: Key[];
  openModal: (name: ModalType, record?: any, initial?: any) => void;
}

// 表格操作按钮
const TableActionButtons: React.FC<TableActionButtonsProps> = ({
  handleBatchDelete,
  refetch,
  selectedRows,
  openModal,
}) => {
  const { message, modal } = App.useApp();
  const { t } = useTranslation();
  // 权限检查
  const { canAddEndpoint, canDeleteEndpoint, canImportEndpoint, canExportEndpoint } = useEndpointPermissions();

  // 导出选项
  const exportItems: MenuProps['items'] = [
    {
      key: 'csv',
      label: '导出为CSV',
      icon: <FileTextOutlined className="text-sm! block! text-orange-400" />,
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
      icon: <FileExcelOutlined className="text-sm! block!" />,
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
      icon: <FilePdfOutlined className="text-sm! block" />,
      onClick: () => {
        modal.error({
          title: '功能暂未开放',
          content: '导出PDF功能正在开发中，敬请期待。',
        });
      },
    },
  ];

  return (
    <div className="flex grow items-center justify-between">
      {/* 左侧主要操作按钮 */}
      <Space size="middle">
        {canAddEndpoint && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('add')}>
            {t('common.operation.add')}
          </Button>
        )}
        {canImportEndpoint && (
          <Button
            icon={<ImportOutlined className="block!" />}
            onClick={() => {
              message.info('导入功能开发中...');
            }}
          >
            {t('common.operation.import')}
          </Button>
        )}

        {canExportEndpoint && (
          <Space.Compact>
            <Button disabled={selectedRows.length === 0} icon={<ExportOutlined className="block!" />}>
              {t('common.operation.export')}
              {selectedRows.length > 0 && <Badge count={selectedRows.length} size="small" className="ml-1" />}
            </Button>
            <Dropdown disabled={selectedRows.length === 0} menu={{ items: exportItems }} placement="bottom">
              <Button icon={<DownOutlined />} />
            </Dropdown>
          </Space.Compact>
        )}

        {canDeleteEndpoint && (
          <Button
            type="default"
            danger
            icon={<DeleteOutlined className="text-sm! block! text-(--ant-color-error)!" />}
            disabled={selectedRows.length === 0}
            onClick={handleBatchDelete}
          >
            {t('common.operation.delete')}
          </Button>
        )}
      </Space>
    </div>
  );
};

export default TableActionButtons;
