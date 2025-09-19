import { useQuery } from '@tanstack/react-query';
import { Table, Checkbox, Space, Tag } from 'antd';
import { useCallback, useMemo } from 'react';
import type React from 'react';
import { menuService } from '@/services/system/menu/menuApi';
import type { ColumnsType } from 'antd/es/table';

/**
 * 菜单权限树组件Props
 */
interface MenuPermissionTreeProps {
  checkedKeys: string[];
  onCheck: (checkedKeys: string[]) => void;
}

/**
 * 菜单数据类型
 */
interface MenuItem {
  id: string;
  name: string;
  parentId?: string;
  url?: string;
  component?: string;
  status: boolean;
  sortNo: number;
  createTime: string;
  updateTime: string;
  description?: string;
  children?: MenuItem[];
}

/**
 * 菜单权限树组件
 * 以树形表格结构展示菜单权限分配
 */
const MenuPermissionTree: React.FC<MenuPermissionTreeProps> = ({ checkedKeys, onCheck }) => {
  /**
   * 查询菜单树数据
   */
  const { data: menuList, isLoading } = useQuery({
    queryKey: ['menu-tree'],
    queryFn: () => menuService.getAllMenus({}),
  });

  /**
   * 构建树形表格数据
   */
  const tableData = useMemo(() => {
    if (!menuList) return [];

    const buildTreeData = (menus: MenuItem[], parentId?: string): MenuItem[] => {
      return menus
        .filter((menu) => menu.parentId === parentId)
        .map((menu) => ({
          ...menu,
          children: buildTreeData(menus, menu.id),
        }));
    };

    return buildTreeData(menuList);
  }, [menuList]);

  /**
   * 处理单个菜单选中
   * @param menuId 菜单ID
   * @param checked 是否选中
   */
  const handleMenuCheck = useCallback(
    (menuId: string, checked: boolean) => {
      if (checked) {
        onCheck([...checkedKeys, menuId]);
      } else {
        onCheck(checkedKeys.filter((key) => key !== menuId));
      }
    },
    [checkedKeys, onCheck],
  );

  /**
   * 处理全选/取消全选
   * @param checked 是否全选
   */
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        const allIds = getAllMenuIds(tableData);
        onCheck(allIds);
      } else {
        onCheck([]);
      }
    },
    [tableData, onCheck],
  );

  /**
   * 获取所有菜单ID（包括子菜单）
   * @param menus 菜单列表
   */
  const getAllMenuIds = (menus: MenuItem[]): string[] => {
    const ids: string[] = [];
    const traverse = (items: MenuItem[]) => {
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
   * 检查是否全选
   */
  const isAllSelected = useMemo(() => {
    if (tableData.length === 0) return false;
    const allIds = getAllMenuIds(tableData);
    return allIds.every((id) => checkedKeys.includes(id));
  }, [tableData, checkedKeys]);

  /**
   * 检查是否部分选中
   */
  const isIndeterminate = useMemo(() => {
    const allIds = getAllMenuIds(tableData);
    const selectedCount = allIds.filter((id) => checkedKeys.includes(id)).length;
    return selectedCount > 0 && selectedCount < allIds.length;
  }, [tableData, checkedKeys]);

  /**
   * 表格列定义
   */
  const columns: ColumnsType<MenuItem> = [
    {
      title: (
        <Checkbox
          checked={isAllSelected}
          indeterminate={isIndeterminate}
          onChange={(e) => handleSelectAll(e.target.checked)}
        >
          菜单名称
        </Checkbox>
      ),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: MenuItem) => (
        <Space>
          <Checkbox
            checked={checkedKeys.includes(record.id)}
            onChange={(e) => handleMenuCheck(record.id, e.target.checked)}
          />
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

  return (
    <div className="h-full">
      <Table
        columns={columns}
        dataSource={tableData}
        loading={isLoading}
        rowKey="id"
        pagination={false}
        size="small"
        scroll={{ y: 400 }}
        expandable={{
          defaultExpandAllRows: true,
          childrenColumnName: 'children',
        }}
        className="menu-permission-table"
      />
    </div>
  );
};

export default MenuPermissionTree;
