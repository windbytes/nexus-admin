/**
 * 节点列表面板
 * 按分类（TRIGGER/PROCESSOR/CONNECTOR/CONTROL）展示可用节点插件，支持搜索过滤
 * 用于「添加节点」与「更改节点」的 submenu 内容
 */
import { SearchOutlined } from '@ant-design/icons';
import { Input, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../constants';
import { getNodePluginsByCategory } from '../plugin/registry';
import type { WorkflowNodePlugin } from '../plugin/types';

const { Text } = Typography;

/** NodeListPanel 组件 Props */
interface NodeListPanelProps {
  /** 选择节点后的回调 */
  onAddNode: (plugin: WorkflowNodePlugin) => void;
}

/** 单条节点项：图标 + 名称，点击触发 onAdd */
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
 * 添加节点 Popover 内容：按四分类（TRIGGER/PROCESSOR/CONNECTOR/CONTROL）展示节点列表
 */
export const NodeListPanel: React.FC<NodeListPanelProps> = ({ onAddNode }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const { TRIGGER, PROCESSOR, CONNECTOR, CONTROL } = getNodePluginsByCategory();

  const filtered = useMemo(
    () => ({
      TRIGGER: filterPlugins(TRIGGER, searchKeyword),
      PROCESSOR: filterPlugins(PROCESSOR, searchKeyword),
      CONNECTOR: filterPlugins(CONNECTOR, searchKeyword),
      CONTROL: filterPlugins(CONTROL, searchKeyword),
    }),
    [TRIGGER, PROCESSOR, CONNECTOR, CONTROL, searchKeyword]
  );

  const hasAny =
    filtered.TRIGGER.length > 0 ||
    filtered.PROCESSOR.length > 0 ||
    filtered.CONNECTOR.length > 0 ||
    filtered.CONTROL.length > 0;

  return (
    <div style={{ width: 240 }}>
      <Input
        placeholder="搜索节点"
        prefix={<SearchOutlined />}
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        allowClear
        style={{ marginBottom: 12 }}
      />
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {CATEGORY_ORDER.map(
          (cat) =>
            filtered[cat].length > 0 && (
              <div key={cat} style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                  {CATEGORY_LABELS[cat]}
                </Text>
                {filtered[cat].map((plugin) => (
                  <NodeItem key={plugin.meta.id} plugin={plugin} onAdd={() => onAddNode(plugin)} />
                ))}
              </div>
            )
        )}
        {!hasAny && <Text type="secondary">暂无匹配节点</Text>}
      </div>
    </div>
  );
};
