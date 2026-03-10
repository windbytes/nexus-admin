import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { Alert, Card, Space, Tag, Typography } from 'antd';
import type React from 'react';

const { Text, Paragraph } = Typography;

interface TestResult {
  status: 'success' | 'failed' | 'testing';
  message: string;
  responseTime?: number;
  details?: Record<string, any>;
  timestamp: string;
}

interface TestResultCardProps {
  testResult: TestResult;
}

/**
 * 测试结果卡片组件
 */
const TestResultCard: React.FC<TestResultCardProps> = ({ testResult }) => {
  /**
   * 渲染测试状态图标
   */
  const renderStatusIcon = () => {
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
    const statusConfig = {
      testing: { color: 'blue', text: '测试中' },
      success: { color: 'green', text: '成功' },
      failed: { color: 'red', text: '失败' },
    };

    const config = statusConfig[testResult.status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  return (
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
        <div className="text-gray-500 text-sm">测试时间: {new Date(testResult.timestamp).toLocaleString('zh-CN')}</div>

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
        {testResult.status === 'success' && <Alert message="连接测试成功，端点配置正确！" type="success" showIcon />}

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
  );
};

TestResultCard.displayName = 'TestResultCard';

export default TestResultCard;
