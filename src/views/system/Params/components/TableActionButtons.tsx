import {
  DeleteOutlined,
  DownloadOutlined,
  DownOutlined,
  ExportOutlined,
  ImportOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Badge, Button, Dropdown, type MenuProps, Space, Upload } from 'antd';

import type React from 'react';
import type { SysParam } from '@/services/system/params';
import type { ModalType } from '../hooks/useParamModals';
import { useParamPermissions } from '../hooks/useParamPermissions';

interface TableActionButtonsProps {
  handleBatchDelete: () => void;
  selectedRows: React.Key[];
  openModal: (name: ModalType, record?: SysParam) => void;
  onImport?: (file: File) => void;
  onExport?: (type: 'all' | 'selected') => void;
}

// 表格操作按钮
const TableActionButtons: React.FC<TableActionButtonsProps> = ({
  handleBatchDelete,
  selectedRows,
  openModal,
  onImport,
  onExport,
}) => {
  // 权限检查
  const { canAdd, canDelete, canImport, canExport } = useParamPermissions();

  // 处理文件上传
  const handleFileUpload = (file: File) => {
    if (onImport) {
      onImport(file);
    }
    return false; // 阻止自动上传
  };

  // 导出选项
  const exportItems: MenuProps['items'] = [
    {
      key: 'all',
      label: '导出全部',
      icon: <DownloadOutlined />,
      onClick: () => onExport?.('all'),
    },
    {
      key: 'selected',
      label: `导出选中 (${selectedRows.length})`,
      icon: <DownloadOutlined />,
      disabled: selectedRows.length === 0,
      onClick: () => onExport?.('selected'),
    },
  ];

  return (
    <div className="flex grow items-center justify-between">
      {/* 左侧主要操作按钮 */}
      <Space size="middle">
        <Button type="primary" icon={<PlusOutlined />} disabled={!canAdd} onClick={() => openModal('add')}>
          新增
        </Button>
        <Upload accept=".xlsx,.xls,.csv" showUploadList={false} beforeUpload={handleFileUpload}>
          <Button icon={<ImportOutlined className="block!" />} disabled={!canImport}>
            导入
          </Button>
        </Upload>

        <Space.Compact>
          <Button disabled={selectedRows.length === 0 || !canExport} icon={<ExportOutlined className="block!" />}>
            导出
            {selectedRows.length > 0 && <Badge count={selectedRows.length} size="small" className="ml-1" />}
          </Button>
          <Dropdown disabled={selectedRows.length === 0 || !canExport} menu={{ items: exportItems }} placement="bottom">
            <Button icon={<DownOutlined />} />
          </Dropdown>
        </Space.Compact>

        <Button
          icon={<DeleteOutlined />}
          onClick={handleBatchDelete}
          disabled={selectedRows.length === 0 || !canDelete}
          danger
        >
          批量删除
          {selectedRows.length > 0 && <Badge count={selectedRows.length} size="small" className="ml-1" />}
        </Button>
      </Space>
    </div>
  );
};

export default TableActionButtons;
