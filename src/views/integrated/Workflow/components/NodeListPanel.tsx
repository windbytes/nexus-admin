import { SearchOutlined } from '@ant-design/icons';
import { Input, Tabs, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { getNodePluginsByCategory } from '../plugin/registry';
import type { WorkflowNodePlugin } from '../plugin/types';

const { Text } = Typography;

interface NodeListPanelProps {
  onAddNode: (plugin: WorkflowNodePlugin) => void;
}

/** 单条节点项：图标 + 名称，点击添加到画布 */
function NodeItem({ plugin, onAdd }: { plugin: WorkflowNodePlugin; onAdd: () => void }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        cursor: 'pointer',
        borderRadius: 6,
        width: '100%',
        border: 'none',
        background: 'transparent',
        textAlign: 'left',
        fontSize: 'inherit',
      }}
      className="workflow-node-list-item"
    >
      {typeof plugin.meta.icon === 'string' ? (
        <span style={{ fontSize: 20, width: 24, textAlign: 'center' }}>{plugin.meta.icon}</span>
      ) : (
        <span style={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {plugin.meta.icon}
        </span>
      )}
      <Text>{plugin.meta.name}</Text>
    </button>
  );
}

/** 按关键词过滤插件（匹配 name、description） */
function filterPlugins(plugins: WorkflowNodePlugin[], keyword: string): WorkflowNodePlugin[] {
  if (!keyword.trim()) {
    return plugins;
  }
  const k = keyword.trim().toLowerCase();
  return plugins.filter(
    (p) => p.meta.name.toLowerCase().includes(k) || (p.meta.description ?? '').toLowerCase().includes(k)
  );
}

/**
 * 添加节点 Popover 内容：节点 / 工具 标签 + 搜索 + 按分类展示的节点列表（动态来自插件注册表）
 */
export const NodeListPanel: React.FC<NodeListPanelProps> = ({ onAddNode }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const { tool, external } = getNodePluginsByCategory();

  const filteredTool = useMemo(() => filterPlugins(tool, searchKeyword), [tool, searchKeyword]);
  const filteredExternal = useMemo(() => filterPlugins(external, searchKeyword), [external, searchKeyword]);

  const nodeListContent = (
    <div style={{ width: 280 }}>
      <Input
        placeholder="搜索节点"
        prefix={<SearchOutlined />}
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        allowClear
        style={{ marginBottom: 12 }}
      />
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {filteredTool.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
              工具类型
            </Text>
            {filteredTool.map((plugin) => (
              <NodeItem key={plugin.meta.id} plugin={plugin} onAdd={() => onAddNode(plugin)} />
            ))}
          </div>
        )}
        {filteredExternal.length > 0 && (
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
              与外部交互类型
            </Text>
            {filteredExternal.map((plugin) => (
              <NodeItem key={plugin.meta.id} plugin={plugin} onAdd={() => onAddNode(plugin)} />
            ))}
          </div>
        )}
        {filteredTool.length === 0 && filteredExternal.length === 0 && <Text type="secondary">暂无匹配节点</Text>}
      </div>
    </div>
  );

  const tabItems = [
    { key: 'node', label: '节点', children: nodeListContent },
    { key: 'tool', label: '工具', children: nodeListContent },
  ];

  return <Tabs defaultActiveKey="node" size="small" items={tabItems} />;
};
