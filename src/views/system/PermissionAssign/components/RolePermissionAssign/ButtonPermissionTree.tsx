import { useQuery } from '@tanstack/react-query';
import { Table, Spin, Empty, Tag } from 'antd';
import { useMemo, memo } from 'react';
import type React from 'react';
import { permissionButtonService } from '@/services/system/permission/PermissionButton/permissionButtonApi';
import type { ColumnsType } from 'antd/es/table';
import type { MenuModel } from '@/services/system/menu/type';
import { addIcon } from '@/utils/optimized-icons';
import { useTranslation } from 'react-i18next';

// 菜单类型枚举
const MenuType = {
  TOP_LEVEL: 0,
  SUB_MENU: 1,
  SUB_ROUTE: 2,
  PERMISSION_BUTTON: 3,
} as const;
type MenuType = (typeof MenuType)[keyof typeof MenuType];

/**
 * 按钮权限树组件Props
 */
interface ButtonPermissionTreeProps {
  checkedKeys: string[];
  onCheck: (checkedKeys: string[]) => void;
}

/**
 * 按钮权限表格组件
 * 以表格树结构展示按钮权限分配，只允许选中菜单类型为3的按钮
 */
const ButtonPermissionTree: React.FC<ButtonPermissionTreeProps> = memo(({ checkedKeys, onCheck }) => {
  const { t } = useTranslation();

  /**
   * 查询权限按钮列表
   */
  const { data: menuList, isLoading } = useQuery({
    queryKey: ['permission-buttons'],
    queryFn: () => permissionButtonService.getButtonList({}),
  });

  /**
   * 获取所有按钮菜单ID（只包括菜单类型为3的项）
   * @param menus 菜单列表
   */
  const getAllButtonIds = (menus: MenuModel[]): string[] => {
    const ids: string[] = [];
    const traverse = (items: MenuModel[]) => {
      items.forEach((item) => {
        if (item.menuType === MenuType.PERMISSION_BUTTON) {
          ids.push(item.id);
        }
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
      title: '按钮名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: MenuModel) => (
        <div className="flex items-center space-x-2">
          {record.icon && addIcon(record.icon)}
          <span className="font-medium">{t(name)}</span>
          {record.menuType === MenuType.PERMISSION_BUTTON && (
            <Tag color="blue">按钮</Tag>
          )}
        </div>
      ),
    },
    {
      title: '按钮编码',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Tag color="purple">{code || '-'}</Tag>,
    },
    {
      title: '菜单路径',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => <Tag color="green">{url || '-'}</Tag>,
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
   * Table 行选择配置 - 只允许选中菜单类型为3（按钮）的行
   */
  const rowSelection = useMemo(() => ({
    selectedRowKeys: checkedKeys,
    onChange: (selectedRowKeys: React.Key[]) => {
      onCheck(selectedRowKeys as string[]);
    },
    onSelectAll: (selected: boolean) => {
      if (selected) {
        // 全选时，只选择所有按钮类型的菜单
        const allButtonIds = getAllButtonIds(menuList || []);
        onCheck(allButtonIds);
      } else {
        // 取消全选时，清空所有选择
        onCheck([]);
      }
    },
    getCheckboxProps: (record: MenuModel) => ({
      name: record.name,
      // 只允许选中菜单类型为3的行
      disabled: record.menuType !== MenuType.PERMISSION_BUTTON,
    }),
  }), [checkedKeys, menuList, onCheck]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!menuList || menuList.length === 0) {
    return <Empty description="暂无按钮权限数据" image={Empty.PRESENTED_IMAGE_SIMPLE} className="mt-8" />;
  }

  return (
    <Table<MenuModel>
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
      className="h-full mt-4 button-permission-table"
    />
  );
});

export default ButtonPermissionTree;
