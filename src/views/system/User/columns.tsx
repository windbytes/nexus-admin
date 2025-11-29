import type { UserModel } from '@/services/system/user/type';
import { ManOutlined, WomanOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import { Button, Dropdown, Image, type MenuProps, Space, Switch, type TableProps, Tooltip } from 'antd';

/**
 * 获取表格列
 * @param handleEdit 编辑
 * @param handleDetail 详情
 * @param handleMore 更多
 * @param onStatusChange 状态变更回调
 * @param canUpdateStatus 是否有更新状态权限
 * @returns 表格列
 */
export const getColumns = (
  handleEdit: (record: UserModel) => void,
  handleDetail: (record: UserModel) => void,
  t: (key: string) => string,
  colorPrimary: string,
  handleMore: (record: UserModel) => MenuProps['items'],
  onStatusChange?: (record: UserModel, checked: boolean) => void,
  canUpdateStatus: boolean = false
): TableProps<UserModel>['columns'] => [
  {
    dataIndex: 'id',
    title: 'ID',
    key: 'id',
    hidden: true,
  },
  {
    dataIndex: 'username',
    title: '用户名',
    key: 'username',
    width: 140,
    align: 'left',
  },
  {
    dataIndex: 'realName',
    title: '真实姓名',
    key: 'realName',
    width: 120,
    align: 'left',
    render: (text: string) => <span className="font-medium">{text || '-'}</span>,
  },
  {
    dataIndex: 'sex',
    title: '性别',
    key: 'sex',
    width: 80,
    align: 'center',
    render: (text: number) => {
      if (text === 1) {
        return <ManOutlined className="text-blue-500!" />;
      } else if (text === 2) {
        return <WomanOutlined className="text-pink-500!" />;
      }
      return <span className="text-gray-400">-</span>;
    },
  },
  {
    dataIndex: 'avatar',
    title: '头像',
    key: 'avatar',
    width: 80,
    align: 'center',
    render: (text: string) => (
      <Image
        src={text}
        preview={false}
        width={18}
        fallback="data:image/png;base64,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"
        className="rounded-full"
      />
    ),
  },
  {
    dataIndex: 'birthday',
    title: '生日',
    key: 'birthday',
    width: 120,
    align: 'center',
  },
  {
    dataIndex: 'email',
    title: '邮箱',
    key: 'email',
    width: 120,
    align: 'center',
  },
  {
    dataIndex: 'status',
    title: '状态',
    key: 'status',
    width: 100,
    align: 'center',
    render: (text: number, record: UserModel) => {
      const isActive = text === 1;

      return (
        <div className="flex items-center justify-center">
          <Switch
            checked={isActive}
            checkedChildren="启用"
            unCheckedChildren="禁用"
            disabled={!canUpdateStatus}
            onChange={(checked) => {
              if (onStatusChange) {
                onStatusChange(record, checked);
              }
            }}
            className={isActive ? 'bg-green-500' : 'bg-gray-400'}
          />
        </div>
      );
    },
  },
  {
    title: '操作',
    width: 120,
    dataIndex: 'action',
    fixed: 'right',
    align: 'center',
    render: (_: any, record: UserModel) => (
      <Space size={0}>
        <Tooltip title={t('common.operation.detail')}>
          <Button
            type="text"
            icon={<Icon icon="ix:plant-details" style={{ color: colorPrimary }} className="text-xl block" />}
            onClick={() => handleDetail(record)}
          />
        </Tooltip>
        <Tooltip title={t('common.operation.edit')}>
          <Button
            type="text"
            icon={<Icon icon="fluent-color:calendar-edit-16" className="text-xl block" />}
            onClick={() => handleEdit(record)}
          />
        </Tooltip>
        <Dropdown menu={{ items: handleMore(record) ?? [] }} placement="bottomRight" trigger={['click']}>
          <Tooltip title={t('common.operation.more')}>
            <Button type="text" icon={<Icon icon="fluent:more-vertical-16-filled" className="text-xl block" />} />
          </Tooltip>
        </Dropdown>
      </Space>
    ),
  },
];
