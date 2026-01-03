import type { DescriptionsProps } from 'antd';
import { Popconfirm, Switch, Tag } from 'antd';
import type { MenuModel } from '@/services/system/menu/type';
import { MENU_TYPE } from '../../../constants';

interface MenuDescriptionItemsProps {
  menu: MenuModel | null;
  onToggleStatus: (id: string, status: boolean) => void;
  canEditMenu: boolean;
}

/**
 * 菜单描述项生成函数
 */
const MenuDescriptionItems = ({
  menu,
  onToggleStatus,
  canEditMenu,
}: MenuDescriptionItemsProps): DescriptionsProps['items'] => {
  const items: DescriptionsProps['items'] = [
    {
      key: '1',
      label: '菜单类型',
      children: (() => {
        switch (menu?.menuType) {
          case MENU_TYPE.TOP_LEVEL:
            return <Tag color="red">目录</Tag>;
          case MENU_TYPE.SUB_MENU:
            return <Tag color="green">子菜单</Tag>;
          case MENU_TYPE.SUB_ROUTE:
            return <Tag color="blue">子路由</Tag>;
          case MENU_TYPE.PERMISSION_BUTTON:
            return <Tag color="orange">权限按钮</Tag>;
          default:
            return '';
        }
      })(),
    },
    {
      key: '2',
      label: '菜单状态',
      children: (
        <Popconfirm
          title="切换菜单状态"
          description={`确定${menu?.status ? '禁用' : '启用'}菜单吗？`}
          onConfirm={() => {
            if (menu?.id) {
              onToggleStatus(menu.id, !menu.status);
            }
          }}
        >
          <Switch size="small" checked={menu?.status} disabled={!canEditMenu} />
        </Popconfirm>
      ),
    },
    {
      key: '3',
      label: '菜单名称',
      children: menu?.name,
    },
    {
      key: '4',
      label: '组件路径',
      children: menu?.component,
    },
    {
      key: '5',
      label: '路由名称',
      children: menu?.componentName,
    },
    {
      key: '6',
      label: '路由路径',
      children: menu?.url,
    },
    {
      key: '7',
      label: '路由参数',
      children: JSON.stringify(menu?.routeQuery ? menu.routeQuery : '{}'),
    },
    {
      key: '8',
      label: '菜单排序',
      children: menu?.sortNo,
    },
    {
      key: '9',
      label: '是否隐藏',
      children: <Tag color={menu?.hidden ? 'red' : 'green'}>{menu?.hidden ? '是' : '否'}</Tag>,
    },
    {
      key: '10',
      label: '是否缓存',
      children: <Tag color={menu?.keepAlive ? 'green' : 'red'}>{menu?.keepAlive ? '是' : '否'}</Tag>,
    },
  ];

  return items;
};

export default MenuDescriptionItems;
