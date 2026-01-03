import {
  ColumnHeightOutlined,
  DownOutlined,
  ImportOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { App, Badge, Button, Dropdown, type MenuProps, Space, Tooltip, Upload } from 'antd';
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
import type { RoleModel } from '@/services/system/role/type';
import type { ModalType } from '../hooks/useRoleModal';
import { useRolePermissions } from '../hooks/useRolePermissions';

interface TableActionButtonsProps {
  handleBatchDelete: () => void;
  refetch: () => void;
  selectedRows: Key[];
  openModal: (name: ModalType, record?: RoleModel) => void;
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

  return (
    <div className="flex grow items-center justify-between">
      {/* 左侧主要操作按钮 */}
      <Space size="middle">
        {canAddRole && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('add')}>
            {t('common.operation.add')}
          </Button>
        )}
        {canImportRole && (
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
            <Button icon={<FolderImport className="block!" />}>{t('common.operation.import')}</Button>
          </Upload>
        )}

        {canExportRole && (
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

        {canDeleteRole && (
          <Button
            type="default"
            danger
            icon={<DeleteDismiss24Filled className="text-sm! block! text-(--ant-color-error)!" />}
            disabled={selectedRows.length === 0}
            onClick={handleBatchDelete}
          >
            {t('common.operation.delete')}
          </Button>
        )}
      </Space>
      {/* 右侧表格工具按钮 */}
      <Space size="small">
        <Tooltip title="刷新数据">
          <Button
            icon={<ReloadOutlined />}
            type="text"
            onClick={refetch}
            className="text-gray-500 hover:text-blue-500"
          />
        </Tooltip>

        <Tooltip title="列设置">
          <Button
            icon={<ColumnEdit24Regular className="text-sm block!" />}
            type="text"
            onClick={() =>
              modal.error({
                title: '功能暂未开放',
                content: '表格列设置功能正在开发中，敬请期待。',
              })
            }
            className="text-gray-500 hover:text-blue-500"
          />
        </Tooltip>

        <Tooltip title="表格大小">
          <Button
            icon={<ColumnHeightOutlined className="text-sm block" />}
            type="text"
            onClick={() =>
              modal.error({
                title: '功能暂未开放',
                content: '表格大小调整功能正在开发中，敬请期待。',
              })
            }
            className="text-gray-500 hover:text-blue-500"
          />
        </Tooltip>

        <Tooltip title="表格密度">
          <Button
            icon={<UnorderedListOutlined />}
            type="text"
            onClick={() =>
              modal.error({
                title: '功能暂未开放',
                content: '表格密度调整功能正在开发中，敬请期待。',
              })
            }
            className="text-gray-500 hover:text-blue-500"
          />
        </Tooltip>

        <Tooltip title="表格设置">
          <Button
            icon={<SettingOutlined />}
            type="text"
            onClick={() =>
              modal.error({
                title: '功能暂未开放',
                content: '表格设置功能正在开发中，敬请期待。',
              })
            }
            className="text-gray-500 hover:text-blue-500"
          />
        </Tooltip>
      </Space>
    </div>
  );
};

export default TableActionButtons;

