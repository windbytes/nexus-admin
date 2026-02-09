import { Form, Input, InputNumber, Select } from 'antd';
import { REFRESH_MODE_OPTIONS } from '../../constants';

interface SourceConfigApiProps {
  disabled?: boolean;
}

/**
 * API 数据源配置：URL、方法、刷新方式与间隔
 */
const SourceConfigApi: React.FC<SourceConfigApiProps> = ({ disabled }) => (
  <>
    <Form.Item
      label="请求地址"
      name={['source', 'apiUrl']}
      rules={[{ required: true, message: '请输入 API 地址' }]}
    >
      <Input placeholder="如: https://api.example.com/dict" allowClear maxLength={500} disabled={disabled} />
    </Form.Item>
    <Form.Item label="HTTP 方法" name={['source', 'httpMethod']} initialValue="GET">
      <Select
        options={[
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
        ]}
        disabled={disabled}
      />
    </Form.Item>
    <Form.Item label="刷新方式" name={['source', 'refreshMode']} initialValue="AUTO">
      <Select
        options={REFRESH_MODE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
        disabled={disabled}
      />
    </Form.Item>
    <Form.Item label="刷新间隔(秒)" name={['source', 'refreshIntervalSec']}>
      <InputNumber placeholder="如 300" min={1} className="w-full" disabled={disabled} />
    </Form.Item>
  </>
);

export default SourceConfigApi;
