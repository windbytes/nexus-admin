import {
  ColumnHeightOutlined,
  DownOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { App, Badge, Button, Divider, Dropdown, type MenuProps, Space, Tooltip, Upload } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  ColumnEdit24Regular,
  CsvOutline,
  DeleteDismiss24Filled,
  FileTypeExcel,
  FolderExport,
  FolderImport,
  PdfIcon,
  Recycle,
  ResetPasswordIcon,
  Status24Regular,
} from '@/components/icons';
import { MyIcon } from '@/components/MyIcon';
import { usePermission } from '@/hooks/usePermission';

interface TableActionButtonsProps {
  handleAdd: () => void;
  handleBatchDelete: () => void;
  refetch: () => void;
  selectedRows: any[];
}

// 表格操作按钮
const TableActionButtons: React.FC<TableActionButtonsProps> = ({
  handleAdd,
  handleBatchDelete,
  refetch,
  selectedRows,
}) => {
  const { message, modal } = App.useApp();
  const { t } = useTranslation();
  // 权限检查
  const canAdd = usePermission(['sys:user:add']);
  const canBatchDelete = usePermission(['sys:user:delete']);
  const canBatchImport = usePermission(['sys:user:import']);
  const canBatchExport = usePermission(['sys:user:export']);
  const canRecover = usePermission(['sys:user:recover']);
  const canBatchResetPassword = usePermission(['sys:user:resetPassword']);
  const canBatchAssignRole = usePermission(['sys:user:assignRole']);
  const canBatchUpdateStatus = usePermission(['sys:user:updateStatus']);
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

  // 批量操作选项 - 根据权限动态禁用
  const batchItems: MenuProps['items'] = [
    {
      key: 'assignRole',
      label: '批量分配角色',
      icon: <MyIcon type="nexus-assigned" className="text-sm! block" />,
      disabled: selectedRows.length === 0 || !canBatchAssignRole,
      onClick: () => {
        if (!canBatchAssignRole) {
          modal.error({
            title: '权限不足',
            content: '您没有批量分配用户角色的权限，请联系管理员获取相应权限。',
          });
          return;
        }
        modal.error({
          title: '功能暂未开放',
          content: '批量分配角色功能正在开发中，敬请期待。',
        });
      },
    },
    {
      key: 'updateStatus',
      label: '批量更新状态',
      icon: <Status24Regular className="text-sm! block" />,
      onClick: () => {
        if (!canBatchUpdateStatus) {
          modal.error({
            title: '权限不足',
            content: '您没有批量更新用户状态的权限，请联系管理员获取相应权限。',
          });
          return;
        }
        modal.error({
          title: '功能暂未开放',
          content: '批量更新状态功能正在开发中，敬请期待。',
        });
      },
    },
    {
      key: 'resetPassword',
      label: '批量重置密码',
      icon: <ResetPasswordIcon className="text-sm! block!" />,
      disabled: selectedRows.length === 0 || !canBatchResetPassword,
      onClick: () => {
        if (!canBatchResetPassword) {
          modal.error({
            title: '权限不足',
            content: '您没有批量重置用户密码的权限，请联系管理员获取相应权限。',
          });
          return;
        }
        modal.error({
          title: '功能暂未开放',
          content: '批量重置密码功能正在开发中，敬请期待。',
        });
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: '批量删除',
      icon: <DeleteDismiss24Filled className="text-sm! block! text-(--ant-color-error)" />,
      disabled: selectedRows.length === 0 || !canBatchDelete,
      onClick: () => {
        if (!canBatchDelete) {
          modal.error({
            title: '权限不足',
            content: '您没有批量删除用户的权限，请联系管理员获取相应权限。',
          });
          return;
        }
        handleBatchDelete();
      },
    },
  ];

  return (
    <div className="flex items-center justify-between">
      {/* 左侧主要操作按钮 */}
      <Space size="middle">
        {canBatchImport && (
          <Upload
            accept=".xlsx,.xls"
            showUploadList={false}
            action="/api/user/import"
            onChange={(info) => {
              if (info.file.status === 'done') {
                message.success('导入成功');
                refetch();
              } else if (info.file.status === 'error') {
                modal.error({
                  title: '导入失败',
                  content: '用户数据导入失败，请检查文件格式或联系技术支持。',
                });
              }
            }}
          >
            <Button icon={<FolderImport className="text-sm! block!" />}>{t('common.operation.import')}</Button>
          </Upload>
        )}

        {canBatchExport && (
          <Space.Compact>
            <Button icon={<FolderExport className="text-sm! block!" />}>{t('common.operation.export')}</Button>
            <Dropdown menu={{ items: exportItems }} placement="bottom">
              <Button icon={<DownOutlined />} />
            </Dropdown>
          </Space.Compact>
        )}

        {/* 批量操作下拉菜单 */}
        <Space.Compact>
          <Button disabled={selectedRows.length === 0} icon={<ColumnEdit24Regular className="text-sm! block!" />}>
            批量操作
            {selectedRows.length > 0 && <Badge count={selectedRows.length} size="small" className="ml-1" />}
          </Button>
          <Dropdown disabled={selectedRows.length === 0} menu={{ items: batchItems }} placement="bottom">
            <Button icon={<DownOutlined />} />
          </Dropdown>
        </Space.Compact>

        {/* 回收站按钮 - 移到左边 */}
        {canRecover && (
          <Button
            icon={<Recycle className="text-sm! block! text-green-500!" />}
            onClick={() => {
              modal.error({
                title: '功能暂未开放',
                content: '回收站功能正在开发中，敬请期待。',
              });
            }}
          >
            {t('common.operation.recycle')}
          </Button>
        )}
        {canAdd && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {t('common.operation.add')}
          </Button>
        )}
      </Space>
      <Divider orientation="vertical" />
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
