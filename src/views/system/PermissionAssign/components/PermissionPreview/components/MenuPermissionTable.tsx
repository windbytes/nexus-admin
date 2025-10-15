import { Table, Space, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useMemo, memo } from 'react';
import type React from 'react';
import type { TableProps } from 'antd';
import type { MenuModel } from '@/services/system/menu/type';

/**
 * 菜单权限表格组件Props
 */
interface MenuPermissionTableProps {
  /** 菜单权限数据 */
  dataSource?: MenuModel[];
  /** 是否正在加载 */
  loading?: boolean;
}

/**
 * 菜单权限表格组件
 * 负责展示菜单权限详情
 */
const MenuPermissionTable: React.FC<MenuPermissionTableProps> = memo(({
  dataSource = [],
  loading = false,
}) => {
  /**
   * 菜单权限表格列定义
   */
  const columns: TableProps<MenuModel>['columns'] = useMemo(
    () => [
      {
        title: '菜单名称',
        dataIndex: 'name',
        key: 'name',
        render: (name: string) => (
          <Space>
            <UserOutlined className="text-blue-500" />
            <span className="font-medium">{name}</span>
          </Space>
        ),
      },
      {
        title: '菜单路径',
        dataIndex: 'url',
        key: 'url',
        render: (url: string) => <Tag color="blue">{url || '-'}</Tag>,
      },
      {
        title: '组件路径',
        dataIndex: 'component',
        key: 'component',
        ellipsis: true,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status: boolean) => <Tag color={status ? 'green' : 'red'}>{status ? '启用' : '禁用'}</Tag>,
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
      size="middle"
      bordered
      scroll={{ y: 300 }}
      locale={{
        emptyText: '暂无菜单权限',
      }}
    />
  );
});

MenuPermissionTable.displayName = 'MenuPermissionTable';

export default MenuPermissionTable;
