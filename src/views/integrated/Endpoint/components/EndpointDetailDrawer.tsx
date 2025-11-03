import type { Endpoint } from '@/services/integrated/endpoint/endpointApi';
import { ENDPOINT_TYPE_OPTIONS } from '@/services/integrated/endpoint/endpointApi';
import { Card, Descriptions, Divider, Drawer, Space, Tag, Typography } from 'antd';
import type React from 'react';

const { Text, Paragraph } = Typography;

interface EndpointDetailDrawerProps {
  /** 是否显示 */
  open: boolean;
  /** 端点信息 */
  endpoint: Endpoint | null;
  /** 关闭回调 */
  onClose: () => void;
}

/**
 * 端点详情抽屉组件
 */
const EndpointDetailDrawer: React.FC<EndpointDetailDrawerProps> = ({ open, endpoint, onClose }) => {
  if (!endpoint) return null;

  /**
   * 获取端点类型名称
   */
  const getEndpointTypeName = (type: string): string => {
    const option = ENDPOINT_TYPE_OPTIONS.find((opt) => opt.value === type);
    return option?.label || type;
  };

  /**
   * 获取端点类型颜色
   */
  const getEndpointTypeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      http: 'blue',
      database: 'green',
      webservice: 'purple',
      file: 'orange',
      timer: 'cyan',
      mq: 'magenta',
    };
    return colorMap[type] || 'default';
  };

  /**
   * 渲染配置信息
   */
  const renderConfigInfo = () => {
    if (!endpoint.config) {
      return <Text type="secondary">暂无配置信息</Text>;
    }

    return (
      <Paragraph>
        <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto max-h-96">
          {JSON.stringify(endpoint.config, null, 2)}
        </pre>
      </Paragraph>
    );
  };

  /**
   * 渲染标签
   */
  const renderTags = () => {
    if (!endpoint.tags || endpoint.tags.length === 0) {
      return <Text type="secondary">无标签</Text>;
    }

    return (
      <Space wrap>
        {endpoint.tags.map((tag, index) => (
          <Tag key={index}>{tag}</Tag>
        ))}
      </Space>
    );
  };

  return (
    <Drawer title="端点详情" placement="right" width={720} open={open} onClose={onClose}>
      <div className="flex flex-col gap-4">
        {/* 基础信息 */}
        <Card title="基础信息" size="small">
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="端点名称" span={2}>
              <Text strong>{endpoint.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="端点类型">
              <Tag color={getEndpointTypeColor(endpoint.endpointType)}>
                {getEndpointTypeName(endpoint.endpointType)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="端点分类">
              {endpoint.category || <Text type="secondary">未分类</Text>}
            </Descriptions.Item>
            <Descriptions.Item label="模式">{endpoint.mode || <Text type="secondary">-</Text>}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={endpoint.status ? 'green' : 'red'}>{endpoint.status ? '启用' : '禁用'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>
              {endpoint.description || <Text type="secondary">无描述</Text>}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 配置信息 */}
        <Card title="配置信息" size="small">
          {renderConfigInfo()}
        </Card>

        {/* 标签信息 */}
        <Card title="标签" size="small">
          {renderTags()}
        </Card>

        {/* 备注信息 */}
        {endpoint.remark && (
          <Card title="备注" size="small">
            <Paragraph>{endpoint.remark}</Paragraph>
          </Card>
        )}

        <Divider />

        {/* 系统信息 */}
        <Card title="系统信息" size="small">
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="创建时间">
              {endpoint.createTime ? new Date(endpoint.createTime).toLocaleString('zh-CN') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {endpoint.updateTime ? new Date(endpoint.updateTime).toLocaleString('zh-CN') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建人">{endpoint.createBy || '-'}</Descriptions.Item>
            <Descriptions.Item label="更新人">{endpoint.updateBy || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Drawer>
  );
};

export default EndpointDetailDrawer;
