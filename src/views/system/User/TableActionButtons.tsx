import { MyIcon } from '@/components/MyIcon';
import { usePermission } from '@/hooks/usePermission';
import {
  ColumnHeightOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Icon } from '@iconify/react';
import { App, Badge, Button, Dropdown, type MenuProps, Space, Tooltip, Upload } from 'antd';
import { useTranslation } from 'react-i18next';

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
      icon: <Icon icon="teenyicons:csv-outline" className="text-xl! block text-orange-400" />,
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
      icon: <Icon icon="vscode-icons:file-type-excel" className="text-xl! block" />,
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
      icon: <Icon icon="material-icon-theme:pdf" className="text-xl! block" />,
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
      icon: <MyIcon type="nexus-assigned" className="text-xl! block" />,
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
      icon: <Icon icon="fluent:status-24-regular" className="text-xl! block" />,
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
      icon: <Icon icon="hugeicons:reset-password" className="text-xl! block" />,
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
      icon: <Icon icon="fluent:delete-dismiss-24-filled" className="text-xl! block text-[#ff4d4f]" />,
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
    <div className="flex items-center justify-between mb-4">
      {/* 左侧主要操作按钮 */}
      <Space size="middle">
        {canAdd && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {t('common.operation.add')}
          </Button>
        )}

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
            <Button icon={<Icon icon="material-icon-theme:folder-import" className="text-xl! block" />}>
              {t('common.operation.import')}
            </Button>
          </Upload>
        )}

        {canBatchExport && (
          <Dropdown.Button
            menu={{ items: exportItems }}
            icon={<Icon icon="material-icon-theme:folder-export" className="text-xl! block" />}
          >
            {t('common.operation.export')}
          </Dropdown.Button>
        )}

        {/* 批量操作下拉菜单 */}
        <Dropdown menu={{ items: batchItems }} placement="bottomLeft">
          <Button
            icon={<Icon icon="fluent:options-24-regular" className="text-xl! block" />}
            disabled={selectedRows.length === 0}
          >
            批量操作
            {selectedRows.length > 0 && <Badge count={selectedRows.length} size="small" className="ml-1" />}
          </Button>
        </Dropdown>

        {/* 回收站按钮 - 移到左边 */}
        {canRecover && (
          <Button
            icon={<Icon icon="fa:recycle" className="text-xl! block text-green-500" />}
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
            icon={<Icon icon="fluent:column-edit-24-regular" className="text-lg block" />}
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
            icon={<ColumnHeightOutlined />}
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
