/**
 * 左侧病历分类与模板树
 * 使用 Ant Design Tree 展示静态数据，后续可接入接口
 */
import { Tree } from 'antd';
import type { Key } from 'react';
import type { TemplateTreeNode } from '../../types';

interface TemplateTreeProps {
  treeData: TemplateTreeNode[];
  selectedKeys?: Key[];
  onSelect?: (selectedKeys: Key[], info: { node: TemplateTreeNode }) => void;
  className?: string;
}

const TemplateTree: React.FC<TemplateTreeProps> = ({ treeData, selectedKeys = [], onSelect, className = '' }) => {
  return (
    <div className={`flex h-full flex-col overflow-hidden ${className}`}>
      <div className="border-b border-gray-200 px-3 py-2 text-sm font-medium text-gray-700">病历模板</div>
      <div className="flex-1 overflow-auto p-2">
        <Tree
          showLine
          defaultExpandAll
          selectedKeys={selectedKeys}
          treeData={treeData as any}
          onSelect={(keys, info) => onSelect?.(keys as Key[], { node: info.node as TemplateTreeNode })}
          className="bg-transparent"
        />
      </div>
    </div>
  );
};

export default TemplateTree;
