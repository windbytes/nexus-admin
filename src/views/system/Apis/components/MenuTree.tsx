import { Empty, Spin, Tree, type TreeProps } from 'antd';
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
    <div className="w-72 shrink-0 flex flex-col border border-gray-200 rounded bg-white">
      <div className="px-3 py-2 border-b border-gray-100 font-medium">菜单树</div>
      <div className="flex-1 overflow-auto p-2">
        <Spin spinning={loading}>
          {treeData.length > 0 ? (
            <Tree
              showLine
              blockNode
              treeData={treeData}
              onSelect={onSelect}
              defaultExpandAll
            />
          ) : (
            <Empty description="暂无菜单数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Spin>
      </div>
    </div>
  );
};

export default MenuTree;
