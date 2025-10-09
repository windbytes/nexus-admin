import { useQuery } from '@tanstack/react-query';
import { Table, Tag } from 'antd';
import { useMemo, memo } from 'react';
import type React from 'react';
import { menuService } from '@/services/system/menu/menuApi';
import type { ColumnsType } from 'antd/es/table';
import type { MenuModel } from '@/services/system/menu/type';
import { useTranslation } from 'react-i18next';

/**
 * 菜单权限树组件Props
 */
interface MenuPermissionTreeProps {
  checkedKeys: string[];
  onCheck: (checkedKeys: string[]) => void;
}

/**
 * 菜单权限树组件
 * 以树形表格结构展示菜单权限分配
 */
const MenuPermissionTree: React.FC<MenuPermissionTreeProps> = memo(({ checkedKeys, onCheck }) => {
  const { t } = useTranslation();
  /**
   * 查询菜单树数据
   */
  const { data: menuList, isLoading } = useQuery({
    queryKey: ['menu-tree'],
    queryFn: () => menuService.getAllMenus({}),
  });


  /**
   * 获取所有菜单ID（包括子菜单）
   * @param menus 菜单列表
   */
  const getAllMenuIds = (menus: MenuModel[]): string[] => {
    const ids: string[] = [];
    const traverse = (items: MenuModel[]) => {
      items.forEach((item) => {
        ids.push(item.id);
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        }
      });
    };
    traverse(menus);
    return ids;
  };


  /**
   * 表格列定义
   */
  const columns: ColumnsType<MenuModel> = [
    {
      title: '菜单名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <span className="font-medium">{t(name)}</span>
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
      render: (component: string) => component || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) => <Tag color={status ? 'green' : 'red'}>{status ? '启用' : '禁用'}</Tag>,
    },
    {
      title: '排序',
      dataIndex: 'sortNo',
      key: 'sortNo',
      width: 80,
    },
  ];

  /**
   * Table 行选择配置
   */
  const rowSelection = useMemo(() => ({
    selectedRowKeys: checkedKeys,
    onChange: (selectedRowKeys: React.Key[]) => {
      onCheck(selectedRowKeys as string[]);
    },
    onSelectAll: (selected: boolean) => {
      if (selected) {
        // 全选时，选择所有菜单（包括子菜单）
        const allIds = getAllMenuIds(menuList || []);
        onCheck(allIds);
      } else {
        // 取消全选时，清空所有选择
        onCheck([]);
      }
    },
    getCheckboxProps: (record: MenuModel) => ({
      name: record.name,
    }),
  }), [checkedKeys, menuList, onCheck]);

  return (
      <Table
        columns={columns}
        dataSource={menuList || []}
        loading={isLoading}
        rowKey="id"
        rowSelection={rowSelection}
        pagination={false}
        bordered
        scroll={{ x: 'max-content', y: 'calc(100vh - 536px)' }}
        expandable={{
          defaultExpandAllRows: true,
          childrenColumnName: 'children',
        }}
        className="h-full mt-4 menu-permission-table"
      />
  );
});

export default MenuPermissionTree;
