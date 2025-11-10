import type { SysParamSearchParams } from '@/services/system/params';
import { CATEGORY_OPTIONS } from '@/services/system/params';
import { DownOutlined, RedoOutlined, SearchOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, Form, Input, Select, Space } from 'antd';
import type React from 'react';

interface SearchFormProps {
  onSearch: (values: SysParamSearchParams) => void;
  loading?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
  expanded?: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading = false, onToggleExpand, expanded = false }) => {
  const [form] = Form.useForm();

  const handleSearch = () => {
    form.validateFields().then((values) => {
      onSearch(values);
    });
  };

  const handleReset = () => {
    form.resetFields();
  };

  const handleToggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand(!expanded);
    }
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
            category: '',
          }}
          labelCol={{ span: 4 }}
        >
          {/* 基础搜索条件 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Form.Item name="name" label="名称" colon={false} className="mb-0">
              <Input allowClear autoComplete="off" placeholder="请输入参数名称" />
            </Form.Item>

            <Form.Item name="code" label="编码" colon={false} className="mb-0">
              <Input allowClear autoComplete="off" placeholder="请输入参数键值" />
            </Form.Item>

            <Form.Item name="category" label="分类" colon={false} className="mb-0">
              <Select allowClear placeholder="请选择参数分类" options={CATEGORY_OPTIONS} />
            </Form.Item>
            <Form.Item name="status" label="状态" colon={false} className="mb-0">
              <Select
                allowClear
                placeholder="请选择状态"
                options={[
                  { value: 1, label: '启用' },
                  { value: 0, label: '禁用' },
                ]}
              />
            </Form.Item>
          </div>

          {/* 高级搜索条件 */}
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Form.Item name="dataType" label="类型" colon={false} className="mb-0">
                <Select
                  allowClear
                  placeholder="请选择类型"
                  options={[
                    { value: 'STRING', label: '字符串' },
                    { value: 'NUMBER', label: '数字' },
                    { value: 'BOOLEAN', label: '布尔值' },
                    { value: 'DATE', label: '日期' },
                    { value: 'JSON', label: 'JSON' },
                  ]}
                />
              </Form.Item>

              <Form.Item name="required" label="必填" colon={false} className="mb-0">
                <Select
                  allowClear
                  placeholder="请选择必填"
                  options={[
                    { value: true, label: '是' },
                    { value: false, label: '否' },
                  ]}
                />
              </Form.Item>
            </div>
          </div>

          {/* 操作按钮区域 */}
          <div className="flex justify-end">
            <Space>
              <Button type="link" icon={expanded ? <UpOutlined /> : <DownOutlined />} onClick={handleToggleExpand}>
                {expanded ? '收起' : '展开'}
              </Button>
              <Button type="default" icon={<RedoOutlined />} onClick={handleReset}>
                重置
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SearchOutlined />}
                onClick={handleSearch}
                className="bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600"
              >
                搜索
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </ConfigProvider>
  );
};

export default SearchForm;
