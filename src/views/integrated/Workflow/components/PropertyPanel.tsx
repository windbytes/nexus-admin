/**
 * 右侧属性配置面板
 * 根据选中节点类型渲染对应插件的 ConfigPanel
 */
import { Drawer, Empty, Typography } from 'antd';
import { getNodePlugin } from '../plugin/registry';
import { useWorkflowStore } from '../store/workflowStore';

const { Text } = Typography;

interface PropertyPanelProps {
  open: boolean;
  onClose: () => void;
  width?: number;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ open, onClose, width = 300 }) => {
  const { nodes, selectedNodeId, setNodes } = useWorkflowStore();
  const node = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;
  const plugin = node?.data?.pluginId ? getNodePlugin(node.data.pluginId as string) : null;

  const handleChange = (patch: Record<string, unknown>) => {
    if (!selectedNodeId) {
      return;
    }
    setNodes((prev) => prev.map((n) => (n.id === selectedNodeId ? { ...n, data: { ...n.data, ...patch } } : n)));
  };

  if (!selectedNodeId) {
    return null;
  }

  return (
    <Drawer
      title="属性配置"
      placement="right"
      open={open}
      onClose={onClose}
      size={width}
      destroyOnHidden
      styles={{ body: { paddingTop: 16 } }}
    >
      {!node && <Empty description={<Text type="secondary">选中一个节点以配置属性</Text>} />}
      {node && !plugin && <Empty description={<Text type="secondary">未找到该节点类型的配置</Text>} />}
      {node && plugin && (
        <plugin.ConfigPanel
          nodeId={selectedNodeId}
          data={node.data as import('../types').WorkflowNodeData}
          onChange={handleChange}
        />
      )}
    </Drawer>
  );
};
