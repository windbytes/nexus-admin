import {
  ColumnHeightOutlined,
  DeleteOutlined,
  DownloadOutlined,
  DownOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { App, Badge, Button, Dropdown, type MenuProps, Space, Tooltip, Upload } from 'antd';

import type React from 'react';
import { ColumnEdit24Regular, FolderExport, FolderImport } from '@/components/icons';
import type { SysParam } from '@/services/system/params';
import type { ModalType } from '../hooks/useParamModals';
import { useParamPermissions } from '../hooks/useParamPermissions';

interface TableActionButtonsProps {
  handleBatchDelete: () => void;
  refetch: () => void;
  selectedRows: React.Key[];
  openModal: (name: ModalType, record?: SysParam) => void;
  onImport?: (file: File) => void;
  onExport?: (type: 'all' | 'selected') => void;
}

// 表格操作按钮
const TableActionButtons: React.FC<TableActionButtonsProps> = ({
  handleBatchDelete,
  refetch,
  selectedRows,
  openModal,
  onImport,
  onExport,
}) => {
  // 权限检查
  const { canAdd, canDelete, canImport, canExport } = useParamPermissions();
  const { modal } = App.useApp();

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
        {canAdd && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('add')}>
            新增
          </Button>
        )}
        {canImport && (
          <Upload accept=".xlsx,.xls,.csv" showUploadList={false} beforeUpload={handleFileUpload}>
            <Button icon={<FolderImport className="block!" />}>导入</Button>
          </Upload>
        )}

        {canExport && (
          <Space.Compact>
            <Button disabled={selectedRows.length === 0} icon={<FolderExport className="block!" />}>
              导出
              {selectedRows.length > 0 && <Badge count={selectedRows.length} size="small" className="ml-1" />}
            </Button>
            <Dropdown disabled={selectedRows.length === 0} menu={{ items: exportItems }} placement="bottom">
              <Button icon={<DownOutlined />} />
            </Dropdown>
          </Space.Compact>
        )}

        {canDelete && (
          <Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={selectedRows.length === 0} danger>
            批量删除
            {selectedRows.length > 0 && <Badge count={selectedRows.length} size="small" className="ml-1" />}
          </Button>
        )}
      </Space>
      {/* 右侧表格工具按钮 */}
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
