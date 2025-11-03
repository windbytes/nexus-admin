import type { Endpoint } from '@/services/integrated/endpoint/endpointApi';
import { CheckCircleOutlined, ExclamationCircleOutlined, RollbackOutlined } from '@ant-design/icons';
import { Button, Drawer, Empty, List, Modal, Space, Tag, Typography, message } from 'antd';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

const { Text, Paragraph } = Typography;

interface VersionRecord {
  id: string;
  version: string;
  config: any;
  description: string;
  createTime: string;
  createBy: string;
  isCurrent: boolean;
}

interface EndpointVersionDrawerProps {
  /** 是否显示 */
  open: boolean;
  /** 端点信息 */
  endpoint: Endpoint | null;
  /** 关闭回调 */
  onClose: () => void;
  /** 恢复版本回调 */
  onRestore?: (endpoint: Endpoint, version: VersionRecord) => Promise<void>;
}

/**
 * 端点配置版本管理抽屉
 */
const EndpointVersionDrawer: React.FC<EndpointVersionDrawerProps> = ({ open, endpoint, onClose, onRestore }) => {
  const [versions, setVersions] = useState<VersionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  /**
   * 加载版本历史（模拟数据）
   */
  const loadVersions = useCallback(() => {
    if (!endpoint) return;

    setLoading(true);
    // 模拟API请求
    setTimeout(() => {
      const mockVersions: VersionRecord[] = [
        {
          id: '1',
          version: 'v1.3.0',
          config: endpoint.config,
          description: '当前版本',
          createTime: new Date().toISOString(),
          createBy: '管理员',
          isCurrent: true,
        },
        {
          id: '2',
          version: 'v1.2.0',
          config: { ...endpoint.config, updated: true },
          description: '优化配置参数',
          createTime: new Date(Date.now() - 86400000).toISOString(),
          createBy: '管理员',
          isCurrent: false,
        },
        {
          id: '3',
          version: 'v1.1.0',
          config: { ...endpoint.config, legacy: true },
          description: '修复连接问题',
          createTime: new Date(Date.now() - 172800000).toISOString(),
          createBy: '开发者',
          isCurrent: false,
        },
        {
          id: '4',
          version: 'v1.0.0',
          config: { basic: true },
          description: '初始版本',
          createTime: new Date(Date.now() - 604800000).toISOString(),
          createBy: '开发者',
          isCurrent: false,
        },
      ];
      setVersions(mockVersions);
      setLoading(false);
    }, 500);
  }, [endpoint]);

  /**
   * 恢复到指定版本
   */
  const handleRestore = useCallback(
    (version: VersionRecord) => {
      if (!endpoint || !onRestore) return;

      Modal.confirm({
        title: '确认恢复版本',
        icon: <ExclamationCircleOutlined />,
        content: (
          <div>
            <p>确定要恢复到版本 {version.version} 吗？</p>
            <p className="text-gray-500 text-sm">恢复后当前配置将被替换，但会保存为新版本。</p>
          </div>
        ),
        okText: '确定',
        okType: 'primary',
        cancelText: '取消',
        onOk: async () => {
          setRestoring(true);
          try {
            await onRestore(endpoint, version);
            message.success('版本恢复成功！');
            loadVersions(); // 重新加载版本列表
          } catch (error: any) {
            message.error(`版本恢复失败：${error.message}`);
          } finally {
            setRestoring(false);
          }
        },
      });
    },
    [endpoint, onRestore, loadVersions]
  );

  /**
   * 查看版本详情
   */
  const handleViewDetail = useCallback((version: VersionRecord) => {
    Modal.info({
      title: `版本 ${version.version} 配置详情`,
      width: 720,
      content: (
        <div className="mt-4">
          <Paragraph>
            <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(version.config, null, 2)}
            </pre>
          </Paragraph>
        </div>
      ),
      okText: '关闭',
    });
  }, []);

  /**
   * 加载版本历史
   */
  useEffect(() => {
    if (open && endpoint) {
      loadVersions();
    }
  }, [open, endpoint, loadVersions]);

  return (
    <Drawer
      title={`版本管理 - ${endpoint?.name || ''}`}
      placement="right"
      width={600}
      open={open}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4">
        {/* 版本列表 */}
        {versions.length > 0 ? (
          <List
            loading={loading}
            dataSource={versions}
            renderItem={(version) => (
              <List.Item
                key={version.id}
                className={version.isCurrent ? 'bg-blue-50' : ''}
                actions={[
                  <Button
                    key="view"
                    type="link"
                    size="small"
                    onClick={() => handleViewDetail(version)}
                  >
                    查看
                  </Button>,
                  !version.isCurrent && onRestore && (
                    <Button
                      key="restore"
                      type="link"
                      size="small"
                      icon={<RollbackOutlined />}
                      loading={restoring}
                      onClick={() => handleRestore(version)}
                    >
                      恢复
                    </Button>
                  ),
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{version.version}</Text>
                      {version.isCurrent && (
                        <Tag icon={<CheckCircleOutlined />} color="success">
                          当前版本
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    <div className="flex flex-col gap-1">
                      <Text type="secondary">{version.description}</Text>
                      <Text type="secondary" className="text-xs">
                        {new Date(version.createTime).toLocaleString('zh-CN')} · {version.createBy}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          !loading && <Empty description="暂无版本历史" />
        )}
      </div>
    </Drawer>
  );
};

export default EndpointVersionDrawer;

