import { usePermission } from '@/hooks/usePermission';
import { DeleteOutlined, DownloadOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import { Button, Dropdown, Space, Upload } from 'antd';
import type React from 'react';

interface TableActionButtonsProps {
  onAdd: () => void;
  onBatchDelete: () => void;
  onRefresh: () => void;
  onImport?: (file: File) => void;
  onExport?: (type: 'all' | 'selected') => void;
  selectedRowKeys: React.Key[];
  loading?: boolean;
}

const TableActionButtons: React.FC<TableActionButtonsProps> = ({
  onAdd,
  onBatchDelete,
  onRefresh,
  onImport,
  onExport,
  selectedRowKeys,
  loading = false,
}) => {
  const hasSelection = selectedRowKeys.length > 0;

  // 权限判定
  const canAdd = usePermission(['sys:param:add']);
  const canDelete = usePermission(['sys:param:delete']);
  const canImport = usePermission(['sys:param:import']);
  const canExport = usePermission(['sys:param:export']);

  // 处理文件上传
  const handleFileUpload = (file: File) => {
    if (onImport) {
      onImport(file);
    }
    return false; // 阻止自动上传
  };

  // 导出菜单项
  const exportMenuItems = [
    {
      key: 'all',
      label: '导出全部',
      icon: <DownloadOutlined />,
      onClick: () => onExport?.('all'),
    },
    {
      key: 'selected',
      label: `导出选中 (${selectedRowKeys.length})`,
      icon: <DownloadOutlined />,
      disabled: !hasSelection,
      onClick: () => onExport?.('selected'),
    },
  ];

  return (
    <div className="flex items-center justify-start mb-4">
      <Space>
        {canAdd && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            新增
          </Button>
        )}

        {canDelete && (
          <Button icon={<DeleteOutlined />} onClick={onBatchDelete} disabled={!hasSelection} danger>
            批量删除
          </Button>
        )}

        {canImport && (
          <Upload accept=".xlsx,.xls,.csv" showUploadList={false} beforeUpload={handleFileUpload}>
            <Button icon={<Icon icon="material-icon-theme:folder-import" className="text-xl! block" />}>导入</Button>
          </Upload>
        )}

        {canExport && (
          <Dropdown.Button
            menu={{ items: exportMenuItems }}
            icon={<Icon icon="material-icon-theme:folder-export" className="text-xl! block" />}
            placement="bottomLeft"
          >
            导出
          </Dropdown.Button>
        )}

        <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
          刷新
        </Button>
      </Space>
    </div>
  );
};

export default TableActionButtons;
