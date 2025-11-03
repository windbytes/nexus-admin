import type { Endpoint } from '@/services/integrated/endpoint/endpointApi';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Descriptions, Drawer, Space, Spin, Tag, Typography } from 'antd';
import type React from 'react';
import { useEffect, useState } from 'react';

const { Text, Paragraph } = Typography;

interface TestResult {
  status: 'success' | 'failed' | 'testing';
  message: string;
  responseTime?: number;
  details?: Record<string, any>;
  timestamp: string;
}

interface EndpointTestDrawerProps {
  /** 是否显示 */
  open: boolean;
  /** 当前端点信息 */
  endpoint: Endpoint | null;
  /** 关闭回调 */
  onClose: () => void;
  /** 测试函数 */
  onTest: (endpoint: Endpoint) => Promise<TestResult>;
}

/**
 * 端点测试抽屉组件
 */
const EndpointTestDrawer: React.FC<EndpointTestDrawerProps> = ({ open, endpoint, onClose, onTest }) => {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testing, setTesting] = useState(false);

  /**
   * 执行测试
   */
  const handleTest = async () => {
    if (!endpoint) return;

    setTesting(true);
    setTestResult({
      status: 'testing',
      message: '正在测试连接...',
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await onTest(endpoint);
      setTestResult(result);
    } catch (error: any) {
      setTestResult({
        status: 'failed',
        message: error.message || '测试失败',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setTesting(false);
    }
  };

  /**
   * 重置测试结果
   */
  useEffect(() => {
    if (open && endpoint) {
      setTestResult(null);
    }
  }, [open, endpoint]);

  /**
   * 渲染测试状态图标
   */
  const renderStatusIcon = () => {
    if (!testResult) return null;

    switch (testResult.status) {
      case 'testing':
        return <LoadingOutlined className="text-blue-500 text-2xl" />;
      case 'success':
        return <CheckCircleOutlined className="text-green-500 text-2xl" />;
      case 'failed':
        return <CloseCircleOutlined className="text-red-500 text-2xl" />;
    }
  };

  /**
   * 渲染测试结果标签
   */
  const renderStatusTag = () => {
    if (!testResult) return null;

    const statusConfig = {
      testing: { color: 'blue', text: '测试中' },
      success: { color: 'green', text: '成功' },
      failed: { color: 'red', text: '失败' },
    };

    const config = statusConfig[testResult.status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  return (
    <Drawer
      title="端点测试"
      placement="right"
      width={600}
      open={open}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>关闭</Button>
          <Button type="primary" loading={testing} onClick={handleTest} disabled={!endpoint}>
            {testResult ? '重新测试' : '开始测试'}
          </Button>
        </div>
      }
    >
      {endpoint && (
        <div className="flex flex-col gap-4">
          {/* 端点基本信息 */}
          <Card title="端点信息" size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="名称">{endpoint.name}</Descriptions.Item>
              <Descriptions.Item label="类型">{endpoint.endpointType}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={endpoint.status ? 'green' : 'red'}>{endpoint.status ? '启用' : '禁用'}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 测试结果 */}
          {testResult && (
            <Card
              title={
                <Space>
                  <span>测试结果</span>
                  {renderStatusTag()}
                </Space>
              }
              size="small"
            >
              <div className="flex flex-col gap-4">
                {/* 状态图标和消息 */}
                <div className="flex items-center gap-3">
                  {renderStatusIcon()}
                  <div className="flex-1">
                    <Text strong>{testResult.message}</Text>
                    {testResult.responseTime !== undefined && (
                      <div className="text-gray-500 text-sm mt-1">响应时间: {testResult.responseTime}ms</div>
                    )}
                  </div>
                </div>

                {/* 测试时间 */}
                <div className="text-gray-500 text-sm">
                  测试时间: {new Date(testResult.timestamp).toLocaleString('zh-CN')}
                </div>

                {/* 测试详情 */}
                {testResult.details && (
                  <div>
                    <Text strong className="block mb-2">
                      详细信息:
                    </Text>
                    <Alert
                      message={
                        <Paragraph className="mb-0">
                          <pre className="text-xs overflow-auto max-h-60 m-0">
                            {JSON.stringify(testResult.details, null, 2)}
                          </pre>
                        </Paragraph>
                      }
                      type={testResult.status === 'success' ? 'success' : 'error'}
                    />
                  </div>
                )}

                {/* 成功提示 */}
                {testResult.status === 'success' && (
                  <Alert message="连接测试成功，端点配置正确！" type="success" showIcon />
                )}

                {/* 失败建议 */}
                {testResult.status === 'failed' && (
                  <Alert
                    message="测试失败建议"
                    description={
                      <ul className="mb-0 pl-4">
                        <li>检查端点配置是否正确</li>
                        <li>确认目标服务是否可访问</li>
                        <li>验证认证信息是否有效</li>
                        <li>查看网络连接是否正常</li>
                      </ul>
                    }
                    type="warning"
                    showIcon
                  />
                )}
              </div>
            </Card>
          )}

          {/* 测试说明 */}
          {!testResult && (
            <Alert
              message="测试说明"
              description={
                <ul className="mb-0 pl-4">
                  <li>测试将验证端点连接是否正常</li>
                  <li>测试不会修改任何数据</li>
                  <li>测试可能需要几秒钟时间</li>
                  <li>请确保端点配置正确后再进行测试</li>
                </ul>
              }
              type="info"
              showIcon
            />
          )}

          {/* 加载中状态 */}
          {testing && (
            <div className="flex justify-center items-center py-8">
              <Spin size="large" tip="正在测试连接，请稍候..." />
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
};

export default EndpointTestDrawer;
