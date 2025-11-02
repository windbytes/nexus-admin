import type { EndpointSearchParams } from '@/services/integrated/endpoint/endpointApi';
import { ENDPOINT_CATEGORIES, ENDPOINT_TYPE_OPTIONS } from '@/services/integrated/endpoint/endpointApi';
import { DownOutlined, RedoOutlined, SearchOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, Form, Input, Select, Space } from 'antd';
import type React from 'react';
import { memo, useState } from 'react';

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
  const [expanded, setExpanded] = useState(false);

  const handleSearch = () => {
    form.validateFields().then((values) => {
      onSearch(values);
    });
  };

  const handleReset = () => {
    form.resetFields();
    onSearch({});
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
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
          layout="horizontal"
        >
          {/* 第一行 - 始终显示 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Form.Item
              name="name"
              label="端点名称"
              colon={false}
              className="mb-0"
              labelCol={{ flex: '0 0 80px' }}
              wrapperCol={{ flex: '1' }}
            >
              <Input allowClear autoComplete="off" placeholder="请输入端点名称" />
            </Form.Item>

            <Form.Item
              name="code"
              label="端点编码"
              colon={false}
              className="mb-0"
              labelCol={{ flex: '0 0 80px' }}
              wrapperCol={{ flex: '1' }}
            >
              <Input allowClear autoComplete="off" placeholder="请输入端点编码" />
            </Form.Item>

            <Form.Item
              name="endpointType"
              label="端点类型"
              colon={false}
              className="mb-0"
              labelCol={{ flex: '0 0 80px' }}
              wrapperCol={{ flex: '1' }}
            >
              <Select allowClear placeholder="请选择端点类型" options={ENDPOINT_TYPE_OPTIONS as any} />
            </Form.Item>

            {/* 在大屏幕上，第一行可以显示4个，这里预留操作按钮的位置 */}
            <div className="hidden lg:flex items-center justify-end gap-2">
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
              <Button type="link" icon={expanded ? <UpOutlined /> : <DownOutlined />} onClick={toggleExpanded}>
                {expanded ? '收起' : '展开'}
              </Button>
            </div>
          </div>

          {/* 展开的额外条件 */}
          {expanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              <Form.Item
                name="category"
                label="端点分类"
                colon={false}
                className="mb-0"
                labelCol={{ flex: '0 0 80px' }}
                wrapperCol={{ flex: '1' }}
              >
                <Select allowClear placeholder="请选择端点分类" options={ENDPOINT_CATEGORIES as any} />
              </Form.Item>

              <Form.Item
                name="status"
                label="状态"
                colon={false}
                className="mb-0"
                labelCol={{ flex: '0 0 80px' }}
                wrapperCol={{ flex: '1' }}
              >
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
          )}

          {/* 小屏幕上的操作按钮 */}
          <div className="flex lg:hidden justify-between items-center mt-4">
            <Button
              type="link"
              icon={expanded ? <UpOutlined /> : <DownOutlined />}
              onClick={toggleExpanded}
              className="pl-0"
            >
              {expanded ? '收起' : '展开'}
            </Button>
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
