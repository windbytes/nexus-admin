import {
  CheckCircleOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  ExportOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  ImportOutlined,
  KeyOutlined,
  PlusOutlined,
  RestOutlined,
} from '@ant-design/icons';
import { App, Badge, Button, Dropdown, type MenuProps, Space, Upload } from 'antd';
import type { Key } from 'react';
import { useTranslation } from 'react-i18next';
import { MyIcon } from '@/components/MyIcon';
import type { UserModel } from '@/services/system/user/type';
import type { ModalType } from '../hooks/useUserModals';
import { useUserPermissions } from '../hooks/useUserPermissions';

interface TableActionButtonsProps {
  handleBatchDelete: () => void;
  refetch: () => void;
  selectedRows: Key[];
  openModal: (name: ModalType, record?: UserModel) => void;
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
  const {
    canAdd,
    canDeleteUser,
    canBatchImport,
    canBatchExport,
    canRecover,
    canBatchResetPassword,
    canBatchAssignRole,
    canUpdateStatus,
  } = useUserPermissions();
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

  // 批量操作选项 - 根据权限动态禁用
  const batchItems: MenuProps['items'] = [
    {
      key: 'assignRole',
      label: '批量分配角色',
      icon: <MyIcon type="syndra-assigned" className="text-sm! block" />,
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
      icon: <CheckCircleOutlined className="text-sm! block" />,
      onClick: () => {
        if (!canUpdateStatus) {
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
      icon: <KeyOutlined className="text-sm! block!" />,
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
      icon: <DeleteOutlined className="text-sm! block! text-(--ant-color-error)" />,
      disabled: selectedRows.length === 0 || !canDeleteUser,
      onClick: () => {
        if (!canDeleteUser) {
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
    <div className="flex grow items-center justify-between">
      {/* 左侧主要操作按钮 */}
      <Space size="middle">
        <Button type="primary" icon={<PlusOutlined />} disabled={!canAdd} onClick={() => openModal('add')}>
          {t('common.operation.add')}
        </Button>
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
          <Button icon={<ImportOutlined className="block!" />} disabled={!canBatchImport}>
            {t('common.operation.import')}
          </Button>
        </Upload>

        <Space.Compact>
          <Button disabled={selectedRows.length === 0 || !canBatchExport} icon={<ExportOutlined className="block!" />}>
            {t('common.operation.export')}
            {selectedRows.length > 0 && <Badge count={selectedRows.length} size="small" className="ml-1" />}
          </Button>
          <Dropdown
            disabled={selectedRows.length === 0 || !canBatchExport}
            menu={{ items: exportItems }}
            placement="bottom"
          >
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

        {/* 回收站按钮 - 移到左边 */}
        <Button
          icon={<RestOutlined className="block! text-green-500!" />}
          disabled={!canRecover}
          onClick={() => openModal('recycle')}
        >
          {t('common.operation.recycle')}
        </Button>
      </Space>
    </div>
  );
};

export default TableActionButtons;
