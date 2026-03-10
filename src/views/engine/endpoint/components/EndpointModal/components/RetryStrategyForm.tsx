import { Divider, Form, InputNumber, Space, Switch } from 'antd';
import type React from 'react';

interface RetryStrategyFormProps {
  /** 是否启用指数退避 */
  useExponentialBackoff: boolean | undefined;
}

/**
 * 重试策略表单组件
 */
const RetryStrategyForm: React.FC<RetryStrategyFormProps> = ({ useExponentialBackoff }) => {
  return (
    <>
      <Divider titlePlacement="start">重试策略</Divider>
      <Form.Item
        label="重试次数"
        tooltip="最大重试次数"
        rules={[{ required: true, message: '请输入重试次数', max: 10, min: 1 }]}
      >
        <Space.Compact className="w-full">
          <Form.Item name={['config', 'retryStrategy', 'maximumRedeliveries']} noStyle>
            <InputNumber className="w-full!" placeholder="请输入重试次数" min={1} max={10} step={1} />
          </Form.Item>
          <Space.Addon>次</Space.Addon>
        </Space.Compact>
      </Form.Item>
      <Form.Item
        label="初始延迟"
        tooltip="初始延迟时间"
        rules={[{ required: true, message: '请输入初始延迟', max: 10000, min: 50 }]}
      >
        <Space.Compact className="w-full">
          <Form.Item name={['config', 'retryStrategy', 'redeliveryDelay']} noStyle>
            <InputNumber className="w-full!" placeholder="请输入初始延迟" min={50} max={10000} step={1000} />
          </Form.Item>
          <Space.Addon>ms</Space.Addon>
        </Space.Compact>
      </Form.Item>
      <Form.Item
        name={['config', 'retryStrategy', 'useExponentialBackoff']}
        label="启用指数退避"
        valuePropName="checked"
      >
        <Switch checkedChildren="是" unCheckedChildren="否" />
      </Form.Item>
      <Form.Item
        label="退避倍数"
        tooltip="退避倍数"
        rules={[{ required: useExponentialBackoff, message: '请输入退避倍数', max: 10, min: 1 }]}
      >
        <Space.Compact className="w-full">
          <Form.Item name={['config', 'retryStrategy', 'backOffMultiplier']} noStyle>
            <InputNumber
              disabled={!useExponentialBackoff}
              className="w-full!"
              placeholder="请输入退避倍数"
              min={1}
              max={10}
              step={1}
            />
          </Form.Item>
          <Space.Addon>倍</Space.Addon>
        </Space.Compact>
      </Form.Item>
      <Form.Item
        label="最大延迟"
        tooltip="最大延迟时间"
        rules={[{ required: true, message: '请输入最大延迟', max: 60000, min: 50 }]}
      >
        <Space.Compact className="w-full">
          <Form.Item name={['config', 'retryStrategy', 'maximumRedeliveryDelay']} noStyle>
            <InputNumber className="w-full!" placeholder="请输入最大延迟" min={50} max={60000} step={1000} />
          </Form.Item>
          <Space.Addon>ms</Space.Addon>
        </Space.Compact>
      </Form.Item>
    </>
  );
};

RetryStrategyForm.displayName = 'RetryStrategyForm';

export default RetryStrategyForm;
