import { Alert, Button, Drawer, Spin } from 'antd';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { EndpointModel } from '@/services/integrated/endpoint/endpointApi';
import EndpointInfoCard from './components/EndpointInfoCard';
import TestResultCard from './components/TestResultCard';

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
  endpoint: EndpointModel | null;
  /** 关闭回调 */
  onClose: () => void;
  /** 测试函数 */
  onTest: (endpoint: EndpointModel) => Promise<TestResult>;
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
    if (!endpoint) {
      return;
    }

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

  return (
    <Drawer
      title="端点测试"
      placement="right"
      size={600}
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
          <EndpointInfoCard endpoint={endpoint} />

          {/* 测试结果 */}
          {testResult && <TestResultCard testResult={testResult} />}

          {/* 测试说明 */}
          {!testResult && (
            <Alert
              title="测试说明"
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
