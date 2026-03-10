import { Card, Empty, Spin, Tree, type TreeProps } from 'antd';
import type { DataNode } from 'antd/es/tree';
import type { Key } from 'react';
import { useTranslation } from 'react-i18next';
import type { MenuModel } from '@/services/system/menu/type';
import { buildMenuTreeData } from '../../constants';

interface MenuTreePanelProps {
  menuList: MenuModel[];
  loading?: boolean;
  onSelect?: (menuId: string | null) => void;
}

/**
 * 左侧菜单树面板（仅叶子/可点击页面可选）
 */
const MenuTreePanel: React.FC<MenuTreePanelProps> = ({ menuList, loading, onSelect }) => {
  const { t } = useTranslation();
  const treeData: DataNode[] = buildMenuTreeData(menuList, t);

  const handleSelect: TreeProps['onSelect'] = (keys: Key[]) => {
    onSelect?.(keys?.length ? (keys[0] as string) : null);
  };

  return (
    <Card
      className="w-72 shrink-0 flex flex-col h-full"
      classNames={{ body: 'flex-1 overflow-auto p-2 min-h-0' }}
      title="菜单树"
    >
      <Spin spinning={loading}>
        {treeData.length > 0 ? (
          <Tree showLine blockNode treeData={treeData} onSelect={handleSelect} defaultExpandAll />
        ) : (
          <Empty description="暂无菜单数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Spin>
    </Card>
  );
};

export default MenuTreePanel;
