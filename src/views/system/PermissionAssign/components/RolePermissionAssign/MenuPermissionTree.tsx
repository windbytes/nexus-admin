import { useQuery } from '@tanstack/react-query';
import { Table, Checkbox, Space, Tag } from 'antd';
import { useCallback, useMemo, memo } from 'react';
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
        const allIds = getAllMenuIds(menuList || []);
        onCheck(allIds);
      } else {
        onCheck([]);
      }
    },
    [menuList, onCheck],
  );

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
   * 检查是否全选
   */
  const isAllSelected = useMemo(() => {
    if (menuList?.length === 0) return false;
    const allIds = getAllMenuIds(menuList || []);
    return allIds.every((id) => checkedKeys.includes(id));
  }, [menuList, checkedKeys]);

  /**
   * 检查是否部分选中
   */
  const isIndeterminate = useMemo(() => {
    const allIds = getAllMenuIds(menuList || []);
    const selectedCount = allIds.filter((id) => checkedKeys.includes(id)).length;
    return selectedCount > 0 && selectedCount < allIds.length;
  }, [menuList, checkedKeys]);

  /**
   * 表格列定义
   */
  const columns: ColumnsType<MenuModel> = [
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
      render: (name: string, record: MenuModel) => (
        <Space>
          <Checkbox
            checked={checkedKeys.includes(record.id)}
            onChange={(e) => handleMenuCheck(record.id, e.target.checked)}
          />
          <span className="font-medium">{t(name)}</span>
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
        dataSource={menuList || []}
        loading={isLoading}
        rowKey="id"
        pagination={false}
        size="small"
        scroll={{ y: 'calc(100vh - 520px)' }}
        expandable={{
          defaultExpandAllRows: true,
          childrenColumnName: 'children',
        }}
        className="menu-permission-table"
      />
    </div>
  );
});

MenuPermissionTree.displayName = 'MenuPermissionTree';

export default MenuPermissionTree;
