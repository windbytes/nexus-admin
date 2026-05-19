import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  ExportOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  ImportOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { App, Badge, Button, Dropdown, type MenuProps, Space, Upload } from 'antd';
import type { Key } from 'react';
import { useTranslation } from 'react-i18next';
import type { PermissionModel } from '@/services/system/permission/type';
import type { ModalType } from '../hooks/usePermissionModals';
import { usePermissionPermissions } from '../hooks/usePermissionPermissions';

interface TableActionButtonsProps {
  /** 批量删除处理函数 */
  handleBatchDelete: () => void;
  /** 刷新数据 */
  refetch: () => void;
  /** 选中的行keys */
  selectedRows: Key[];
  /** 打开弹窗 */
  openModal: (name: ModalType, record?: PermissionModel) => void;
}

/**
 * 表格操作按钮组件
 */
const TableActionButtons: React.FC<TableActionButtonsProps> = ({
  handleBatchDelete,
  refetch,
  selectedRows,
  openModal,
}) => {
  const { message, modal } = App.useApp();
  const { t } = useTranslation();
  const { canAdd, canDelete, canImport, canExport } = usePermissionPermissions();

  /**
   * 导出选项菜单
   */
  const exportItems: MenuProps['items'] = [
    {
      key: 'csv',
      label: '导出为CSV',
      icon: <FileTextOutlined className="text-sm! block! text-orange-400" />,
      onClick: () => {
        modal.info({
          title: '功能开发中',
          content: '导出CSV功能正在开发中，敬请期待。',
        });
      },
    },
    {
      key: 'excel',
      label: '导出为Excel',
      icon: <FileExcelOutlined className="text-sm! block!" />,
      onClick: () => {
        modal.info({
          title: '功能开发中',
          content: '导出Excel功能正在开发中，敬请期待。',
        });
      },
    },
  ];

  /**
   * 批量操作选项菜单
   */
  const batchItems: MenuProps['items'] = [
    {
      key: 'delete',
      label: '批量删除',
      icon: <DeleteOutlined className="text-sm! block! text-(--ant-color-error)" />,
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

  /**
   * 处理导入文件变化
   */
  const handleImportChange = (info: { file: { status?: string } }) => {
    if (info.file.status === 'done') {
      message.success('导入成功');
      refetch();
    } else if (info.file.status === 'error') {
      modal.error({
        title: '导入失败',
        content: '权限点数据导入失败，请检查文件格式或联系技术支持。',
      });
    }
  };

  return (
    <div className="flex grow items-center justify-between">
      <Space size="middle">
        {/* 新增按钮 */}
        <Button type="primary" icon={<PlusOutlined />} disabled={!canAdd} onClick={() => openModal('add')}>
          {t('common.operation.add')}
        </Button>

        {/* 导入按钮 */}
        <Upload
          accept=".xlsx,.xls"
          showUploadList={false}
          action="/api/system/permission/import"
          onChange={handleImportChange}
        >
          <Button icon={<ImportOutlined className="block!" />} disabled={!canImport}>
            {t('common.operation.import')}
          </Button>
        </Upload>

        {/* 导出按钮 */}
        <Space.Compact>
          <Button disabled={selectedRows.length === 0 || !canExport} icon={<ExportOutlined className="block!" />}>
            {t('common.operation.export')}
            {selectedRows.length > 0 && <Badge count={selectedRows.length} size="small" className="ml-1" />}
          </Button>
          <Dropdown disabled={selectedRows.length === 0 || !canExport} menu={{ items: exportItems }} placement="bottom">
            <Button icon={<DownOutlined />} />
          </Dropdown>
        </Space.Compact>

        {/* 批量操作下拉菜单 */}
        <Space.Compact>
          <Button disabled={selectedRows.length === 0} icon={<EditOutlined className="block!" />}>
            批量操作
            {selectedRows.length > 0 && <Badge count={selectedRows.length} size="small" className="ml-1" />}
          </Button>
          <Dropdown disabled={selectedRows.length === 0} menu={{ items: batchItems }} placement="bottom">
            <Button icon={<DownOutlined />} />
          </Dropdown>
        </Space.Compact>
      </Space>
    </div>
  );
};

export default TableActionButtons;
