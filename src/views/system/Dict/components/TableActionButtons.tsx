import { DeleteOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { Badge, Button, Dropdown, type MenuProps, Space, Upload } from 'antd';
import type { Key } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderExport, FolderImport } from '@/components/icons';
import type { DictModel } from '@/services/system/dict/type.d';
import type { DictModalType } from '../hooks/useDictModals';
import { useDictPermissions } from '../hooks/useDictPermissions';

interface TableActionButtonsProps {
  openModal: (name: DictModalType, record?: DictModel) => void;
  selectedRowKeys: Key[];
  onBatchDelete: () => void;
  onImport: (file: File) => void;
  onExport: (type: 'all' | 'selected') => void;
}

/**
 * 字典列表表格上方操作区：新增、刷新、导入、导出、批量删除
 */
const TableActionButtons: React.FC<TableActionButtonsProps> = ({
  openModal,
  selectedRowKeys,
  onBatchDelete,
  onImport,
  onExport,
}) => {
  const { t } = useTranslation();
  const { canAdd, canDelete, canImport, canExport } = useDictPermissions();

  const handleFileUpload = (file: File) => {
    onImport(file);
    return false;
  };

  const exportItems: MenuProps['items'] = [
    { key: 'all', label: '导出全部', icon: <DownloadOutlined />, onClick: () => onExport('all') },
    {
      key: 'selected',
      label: `导出选中 (${selectedRowKeys.length})`,
      icon: <DownloadOutlined />,
      disabled: selectedRowKeys.length === 0,
      onClick: () => onExport('selected'),
    },
  ];

  return (
    <div className="flex grow items-center justify-between">
      <Space size="middle">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          disabled={!canAdd}
          onClick={() => openModal('add')}
        >
          {t('common.operation.add')}
        </Button>
        <Upload accept=".csv,.xlsx,.xls" showUploadList={false} beforeUpload={handleFileUpload}>
          <Button icon={<FolderImport className="block!" />} disabled={!canImport}>
            导入
          </Button>
        </Upload>
        <Dropdown menu={{ items: exportItems }} placement="bottom" disabled={!canExport}>
          <Button icon={<FolderExport className="block!" />} disabled={!canExport}>
            导出
            {selectedRowKeys.length > 0 && <Badge count={selectedRowKeys.length} size="small" className="ml-1" />}
          </Button>
        </Dropdown>
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={onBatchDelete}
          disabled={selectedRowKeys.length === 0 || !canDelete}
        >
          批量删除
          {selectedRowKeys.length > 0 && <Badge count={selectedRowKeys.length} size="small" className="ml-1" />}
        </Button>
      </Space>
    </div>
  );
};

export default TableActionButtons;
