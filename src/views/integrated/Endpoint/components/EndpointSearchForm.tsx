import type { EndpointSearchParams } from '@/services/integrated/endpoint/endpointApi';
import { ENDPOINT_CATEGORIES, ENDPOINT_TYPE_OPTIONS } from '@/services/integrated/endpoint/endpointApi';
import { RedoOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, Form, Input, Select, Space } from 'antd';
import type React from 'react';
import { memo } from 'react';

interface EndpointSearchFormProps {
  /** 搜索回调 */
  onSearch: (values: Omit<EndpointSearchParams, 'pageNum' | 'pageSize'>) => void;
  /** 加载状态 */
  loading?: boolean;
}

/**
 * 端点搜索表单组件
 */
const EndpointSearchForm: React.FC<EndpointSearchFormProps> = memo(({ onSearch, loading = false }) => {
  const [form] = Form.useForm();
  const handleSearch = () => {
    form.validateFields().then((values) => {
      onSearch(values);
    });
  };

  const handleReset = () => {
    form.resetFields();
    onSearch({});
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Form: {
            itemMarginBottom: 0,
          },
        },
      }}
    >
      <Card>
        <Form
          form={form}
          initialValues={{
            name: '',
            code: '',
            endpointType: undefined,
            category: undefined,
            status: undefined,
          }}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Form.Item name="name" label="端点名称" colon={false} className="mb-0">
              <Input allowClear autoComplete="off" placeholder="请输入端点名称" />
            </Form.Item>

            <Form.Item name="code" label="端点编码" colon={false} className="mb-0">
              <Input allowClear autoComplete="off" placeholder="请输入端点编码" />
            </Form.Item>

            <Form.Item name="endpointType" label="端点类型" colon={false} className="mb-0">
              <Select allowClear placeholder="请选择端点类型" options={ENDPOINT_TYPE_OPTIONS as any} />
            </Form.Item>

            <Form.Item name="category" label="端点分类" colon={false} className="mb-0">
              <Select allowClear placeholder="请选择端点分类" options={ENDPOINT_CATEGORIES as any} />
            </Form.Item>

            <Form.Item name="status" label="状态" colon={false} className="mb-0">
              <Select
                allowClear
                placeholder="请选择状态"
                options={[
                  { value: true, label: '启用' },
                  { value: false, label: '禁用' },
                ]}
              />
            </Form.Item>
          </div>

          <div className="flex justify-end">
            <Space>
              <Button type="default" icon={<RedoOutlined />} onClick={handleReset}>
                重置
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SearchOutlined />}
                onClick={handleSearch}
                className="bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600"
              >
                搜索
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </ConfigProvider>
  );
});

EndpointSearchForm.displayName = 'EndpointSearchForm';

export default EndpointSearchForm;
