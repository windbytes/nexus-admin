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
import { App, Badge, Button, Dropdown, type MenuProps, Space, Upload } from 'antd';
import type { Key } from 'react';
import { useTranslation } from 'react-i18next';
import type { RoleModel } from '@/services/system/role/type';
import type { ModalType } from '../hooks/useRoleModal';
import { useRolePermissions } from '../hooks/useRolePermissions';

interface TableActionButtonsProps {
  handleBatchDelete: () => void;
  refetch: () => void;
  selectedRows: Key[];
  openModal: (name: ModalType, record?: Partial<RoleModel>) => void;
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
  const { canAddRole, canDeleteRole, canImportRole, canExportRole } = useRolePermissions();

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
        <Button type="primary" icon={<PlusOutlined />} disabled={!canAddRole} onClick={() => openModal('add')}>
          {t('common.operation.add')}
        </Button>
        <Upload
          accept=".xlsx,.xls"
          showUploadList={false}
          action="/api/role/import"
          onChange={(info) => {
            if (info.file.status === 'done') {
              message.success('导入成功');
              refetch();
            } else if (info.file.status === 'error') {
              modal.error({
                title: '导入失败',
                content: '角色数据导入失败，请检查文件格式或联系技术支持。',
              });
            }
          }}
        >
          <Button icon={<ImportOutlined className="block!" />} disabled={!canImportRole}>
            {t('common.operation.import')}
          </Button>
        </Upload>

        <Space.Compact>
          <Button disabled={selectedRows.length === 0 || !canExportRole} icon={<ExportOutlined className="block!" />}>
            {t('common.operation.export')}
            {selectedRows.length > 0 && <Badge count={selectedRows.length} size="small" className="ml-1" />}
          </Button>
          <Dropdown
            disabled={selectedRows.length === 0 || !canExportRole}
            menu={{ items: exportItems }}
            placement="bottom"
          >
            <Button icon={<DownOutlined />} />
          </Dropdown>
        </Space.Compact>

        <Button
          type="default"
          danger
          icon={<DeleteOutlined className="text-sm! block! text-(--ant-color-error)!" />}
          disabled={selectedRows.length === 0 || !canDeleteRole}
          onClick={handleBatchDelete}
        >
          {t('common.operation.batchDelete')}
          {selectedRows.length > 0 && <Badge count={selectedRows.length} size="small" className="ml-1" />}
        </Button>
      </Space>
    </div>
  );
};

export default TableActionButtons;
