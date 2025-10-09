import { Table, Space, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useMemo, memo } from 'react';
import type React from 'react';
import type { TableProps } from 'antd';

/**
 * 接口权限表格组件Props
 */
interface InterfacePermissionTableProps {
  /** 接口权限数据 */
  dataSource?: any[];
  /** 是否正在加载 */
  loading?: boolean;
}

/**
 * 接口权限表格组件
 * 负责展示接口权限详情
 */
const InterfacePermissionTable: React.FC<InterfacePermissionTableProps> = memo(({
  dataSource = [],
  loading = false,
}) => {
  /**
   * 接口权限表格列定义
   */
  const columns: TableProps<any>['columns'] = useMemo(
    () => [
      {
        title: '接口编码',
        dataIndex: 'code',
        key: 'code',
        render: (code: string) => (
          <Space>
            <UserOutlined className="text-purple-500" />
            <Tag color="purple">{code}</Tag>
          </Space>
        ),
      },
      {
        title: '接口描述',
        dataIndex: 'remark',
        key: 'remark',
        ellipsis: true,
      },
      {
        title: '关联按钮',
        dataIndex: 'buttonName',
        key: 'buttonName',
        render: (buttonName: string) => buttonName || '-',
      },
    ],
    [],
  );

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      rowKey="id"
      pagination={false}
      size="small"
      scroll={{ y: 300 }}
      locale={{
        emptyText: '暂无接口权限',
      }}
    />
  );
});

InterfacePermissionTable.displayName = 'InterfacePermissionTable';

export default InterfacePermissionTable;
