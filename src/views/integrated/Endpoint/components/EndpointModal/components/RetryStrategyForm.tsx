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
        name="maximumRedeliveries"
        label="重试次数"
        tooltip="最大重试次数"
        rules={[{ required: true, message: '请输入重试次数' }]}
      >
        <Space.Compact>
          <InputNumber className="w-full" placeholder="请输入重试次数" min={1} max={10} step={1} />
          <Space.Addon>次</Space.Addon>
        </Space.Compact>
      </Form.Item>
      <Form.Item
        name="redeliveryDelay"
        label="初始延迟"
        tooltip="初始延迟时间"
        rules={[{ required: true, message: '请输入初始延迟' }]}
      >
        <Space.Compact>
          <InputNumber className="w-full" placeholder="请输入初始延迟" min={50} max={10000} step={1000} />
          <Space.Addon>ms</Space.Addon>
        </Space.Compact>
      </Form.Item>
      <Form.Item name="useExponentialBackoff" label="启用指数退避" valuePropName="checked">
        <Switch checkedChildren="是" unCheckedChildren="否" />
      </Form.Item>
      <Form.Item
        name="backOffMultiplier"
        label="退避倍数"
        tooltip="退避倍数"
        rules={[{ required: useExponentialBackoff, message: '请输入退避倍数' }]}
      >
        <Space.Compact>
          <InputNumber
            disabled={!useExponentialBackoff}
            className="w-full"
            placeholder="请输入退避倍数"
            min={1}
            max={10}
            step={1}
          />
          <Space.Addon>倍</Space.Addon>
        </Space.Compact>
      </Form.Item>
      <Form.Item
        name="maximumRedeliveryDelay"
        label="最大延迟"
        tooltip="最大延迟时间"
        rules={[{ required: true, message: '请输入最大延迟' }]}
      >
        <Space.Compact>
          <InputNumber className="w-full" placeholder="请输入最大延迟" min={50} max={60000} step={1000} />
          <Space.Addon>ms</Space.Addon>
        </Space.Compact>
      </Form.Item>
    </>
  );
};

RetryStrategyForm.displayName = 'RetryStrategyForm';

export default RetryStrategyForm;
