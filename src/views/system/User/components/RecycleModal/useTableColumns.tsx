import { ManOutlined, WomanOutlined } from '@ant-design/icons';
import { Button, type TableProps } from 'antd';
import type { UserModel } from '@/services/system/user/type';

/**
 * 表格列配置属性
 */
interface UseTableColumnsProps {
  onRestore: (id: string) => void;
}

/**
 * 回收站表格列配置 Hook
 */
export const useTableColumns = ({ onRestore }: UseTableColumnsProps) => {
  const columns: TableProps<UserModel>['columns'] = [
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
      width: 100,
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
      dataIndex: 'email',
      title: '邮箱',
      key: 'email',
      width: 150,
      align: 'left',
      render: (text: string) => <span>{text || '-'}</span>,
    },
    {
      dataIndex: 'phone',
      title: '手机号',
      key: 'phone',
      width: 120,
      align: 'left',
      render: (text: string) => <span>{text || '-'}</span>,
    },
    {
      title: '创建日期',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
      align: 'center',
    },
    {
      title: '删除日期',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 150,
      align: 'center',
    },
    {
      title: '操作',
      width: 100,
      dataIndex: 'action',
      fixed: 'end',
      align: 'center',
      render: (_, record: UserModel) => (
        <Button
          size="small"
          type="link"
          classNames={{ content: 'text-(--ant-color-primary)' }}
          onClick={() => onRestore(record.id)}
        >
          恢复
        </Button>
      ),
    },
  ];

  return columns;
};
