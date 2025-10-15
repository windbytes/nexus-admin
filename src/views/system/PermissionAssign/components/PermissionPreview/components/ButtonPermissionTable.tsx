import { Table, Space, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useMemo, memo } from 'react';
import type React from 'react';
import type { TableProps } from 'antd';
import type { MenuModel } from '@/services/system/menu/type';

/**
 * 按钮权限表格组件Props
 */
interface ButtonPermissionTableProps {
  /** 按钮权限数据 */
  dataSource?: MenuModel[];
  /** 是否正在加载 */
  loading?: boolean;
}

/**
 * 按钮权限表格组件
 * 负责展示按钮权限详情
 */
const ButtonPermissionTable: React.FC<ButtonPermissionTableProps> = memo(({
  dataSource = [],
  loading = false,
}) => {
  /**
   * 按钮权限表格列定义
   */
  const columns: TableProps<MenuModel>['columns'] = useMemo(
    () => [
      {
        title: '按钮名称',
        dataIndex: 'name',
        key: 'name',
        render: (name: string) => (
          <Space>
            <UserOutlined className="text-orange-500" />
            <span className="font-medium">{name}</span>
          </Space>
        ),
      },
      {
        title: '权限标识',
        dataIndex: 'code',
        key: 'code',
        render: (code: string) => <Tag color="orange">{code}</Tag>,
      },
      {
        title: '所属菜单',
        dataIndex: 'parentMenuName',
        key: 'parentMenuName',
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
        emptyText: '暂无按钮权限',
      }}
    />
  );
});

ButtonPermissionTable.displayName = 'ButtonPermissionTable';

export default ButtonPermissionTable;
