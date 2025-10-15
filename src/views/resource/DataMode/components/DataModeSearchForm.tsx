import type React from 'react';
import { Form, Input, Select, Button, Space } from 'antd';
import { SearchOutlined, RedoOutlined } from '@ant-design/icons';
import type { DataModeSearchParams } from '@/services/resource/datamode/dataModeApi';
import { DATA_MODE_CATEGORIES } from '@/services/resource/datamode/dataModeApi';
import { memo } from 'react';

interface DataModeSearchFormProps {
  onSearch: (values: Omit<DataModeSearchParams, 'pageNum' | 'pageSize'>) => void;
  loading?: boolean;
}

/**
 * 数据来源选项
 */
const DATA_SOURCE_OPTIONS = [
  { value: 'database', label: '数据库查询' },
  { value: 'json', label: 'JSON文本' },
  { value: 'file', label: '文件上传' },
];

/**
 * 数据模式搜索表单组件
 */
const DataModeSearchForm: React.FC<DataModeSearchFormProps> = memo(({ onSearch, loading = false }) => {
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-4">
        <Form
          form={form}
          initialValues={{
            name: '',
            code: '',
            category: undefined,
            dataSource: undefined,
            status: undefined,
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Form.Item name="name" label="模式名称" colon={false} className="mb-0">
              <Input allowClear autoComplete="off" placeholder="请输入模式名称" />
            </Form.Item>

            <Form.Item name="code" label="模式编码" colon={false} className="mb-0">
              <Input allowClear autoComplete="off" placeholder="请输入模式编码" />
            </Form.Item>

            <Form.Item name="category" label="分类" colon={false} className="mb-0">
              <Select allowClear placeholder="请选择分类" options={DATA_MODE_CATEGORIES} />
            </Form.Item>

            <Form.Item name="dataSource" label="数据来源" colon={false} className="mb-0">
              <Select allowClear placeholder="请选择数据来源" options={DATA_SOURCE_OPTIONS} />
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

          <div className="flex justify-end mt-4">
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
      </div>
    </div>
  );
});

DataModeSearchForm.displayName = 'DataModeSearchForm';

export default DataModeSearchForm;

