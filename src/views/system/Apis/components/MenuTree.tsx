import { Card, Empty, Spin, Tree, type TreeProps } from 'antd';
import type { DataNode } from 'antd/es/tree';

interface MenuTreeProps {
  treeData: DataNode[];
  loading: boolean;
  onSelect: TreeProps['onSelect'];
}

/**
 * 左侧菜单树
 */
const MenuTree: React.FC<MenuTreeProps> = ({ treeData, loading, onSelect }) => {
  return (
    <Card
      className="w-72 shrink-0 flex flex-col h-full"
      classNames={{ body: 'flex-1 overflow-auto p-2 min-h-0' }}
      title="菜单树"
    >
      <Spin spinning={loading}>
        {treeData.length > 0 ? (
          <Tree showLine blockNode treeData={treeData} onSelect={onSelect} defaultExpandAll />
        ) : (
          <Empty description="暂无菜单数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Spin>
    </Card>
  );
};

export default MenuTree;
