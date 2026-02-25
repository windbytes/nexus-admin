/**
 * 添加节点 / 真实节点列表
 * 按端点大类分组：工具类型、与外部交互类型
 */
import { Button, List, Space, Typography } from 'antd';
import {
  CommentOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { getNodePluginsByCategory } from '../plugin/registry';
import type { WorkflowNodePlugin } from '../plugin/types';

const { Text } = Typography;

interface NodeListPanelProps {
  onAddNode: (plugin: WorkflowNodePlugin) => void;
  onAddComment?: () => void;
  onRun?: () => void;
  onImportDSL?: () => void;
  onExportDSL?: () => void;
}

export const NodeListPanel: React.FC<NodeListPanelProps> = ({
  onAddNode,
  onAddComment,
  onRun,
  onImportDSL,
  onExportDSL,
}) => {
  const { tool, external } = getNodePluginsByCategory();

  const renderPluginItem = (plugin: WorkflowNodePlugin) => (
    <List.Item
      key={plugin.meta.id}
      style={{ cursor: 'pointer' }}
      onClick={() => onAddNode(plugin)}
      extra={
        <Button type="text" size="small" icon={<PlusOutlined />}>
          添加
        </Button>
      }
    >
      <Space>
        {typeof plugin.meta.icon === 'string' ? (
          <span style={{ fontSize: 18 }}>{plugin.meta.icon}</span>
        ) : (
          plugin.meta.icon
        )}
        <div>
          <Text strong>{plugin.meta.name}</Text>
          <br />
          {plugin.meta.description && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {plugin.meta.description}
            </Text>
          )}
        </div>
      </Space>
    </List.Item>
  );

  return (
    <div style={{ width: 280 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <Text strong>添加节点</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            真实节点列表
          </Text>
        </div>

        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            工具类型
          </Text>
          <List size="small" dataSource={tool} renderItem={renderPluginItem} bordered />
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            与外部交互类型
          </Text>
          <List size="small" dataSource={external} renderItem={renderPluginItem} bordered />
        </div>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Button block icon={<CommentOutlined />} onClick={onAddComment}>
            添加注释
          </Button>
          <Button block icon={<PlayCircleOutlined />} onClick={onRun}>
            运行
          </Button>
          <Button block icon={<UploadOutlined />} onClick={onImportDSL}>
            导入 DSL
          </Button>
          <Button block icon={<DownloadOutlined />} onClick={onExportDSL}>
            导出 DSL
          </Button>
        </Space>
      </Space>
    </div>
  );
};
