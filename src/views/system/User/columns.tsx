import { DownOutlined, ManOutlined, WomanOutlined } from '@ant-design/icons';
import { Button, Dropdown, type MenuProps, Switch, type TableProps } from 'antd';
import type { UserModel } from '@/services/system/user/type';

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
  t: (key: string) => string,
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
    render: (text: string) => <span>{text || '-'}</span>,
  },
  {
    dataIndex: 'sex',
    title: '性别',
    key: 'sex',
    width: 80,
    align: 'center',
    sorter: (a: UserModel, b: UserModel) => a.sex.localeCompare(b.sex),
    render: (text: number) => {
      if (text === 1) {
        return (
          <span>
            <ManOutlined className="text-blue-500! mr-1" />男
          </span>
        );
      } else if (text === 2) {
        return (
          <span>
            <WomanOutlined className="text-pink-500! mr-1" />女
          </span>
        );
      }
      return <span className="text-gray-400">-</span>;
    },
  },
  {
    dataIndex: 'birthday',
    title: '生日',
    key: 'birthday',
    width: 120,
    align: 'center',
    render: (text: string) => {
      if (text) {
        return text;
      }
      return <span className="text-gray-400">--</span>;
    },
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
    title: '创建日期',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 120,
    align: 'center',
    sorter: (a: UserModel, b: UserModel) => a.createTime.localeCompare(b.createTime),
  },
  {
    title: '操作',
    width: 90,
    dataIndex: 'action',
    fixed: 'right',
    align: 'center',
    render: (_, record: UserModel) => (
      <>
        <Button size="small" type="link" onClick={() => handleEdit(record)}>
          {t('common.operation.edit')}
        </Button>
        <Dropdown menu={{ items: handleMore(record) ?? [] }} placement="bottom" trigger={['hover']}>
          <Button size="small" type="link" icon={<DownOutlined />} iconPlacement="end">
            {t('common.operation.more')}
          </Button>
        </Dropdown>
      </>
    ),
  },
];
