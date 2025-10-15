import type React from 'react';
import { Form, Input, Select, Button, Space } from 'antd';
import { SearchOutlined, RedoOutlined } from '@ant-design/icons';
import type { DriverSearchParams } from '@/services/resource/database/driverApi';
import { memo } from 'react';

interface DriverSearchFormProps {
  onSearch: (values: Omit<DriverSearchParams, 'pageNum' | 'pageSize'>) => void;
  loading?: boolean;
}

/**
 * 数据库类型选项
 */
const DATABASE_TYPE_OPTIONS = [
  { value: 'MySQL', label: 'MySQL' },
  { value: 'PostgreSQL', label: 'PostgreSQL' },
  { value: 'Oracle', label: 'Oracle' },
  { value: 'SQLServer', label: 'SQL Server' },
  { value: 'DB2', label: 'DB2' },
  { value: 'SQLite', label: 'SQLite' },
  { value: 'MariaDB', label: 'MariaDB' },
  { value: 'DM', label: '达梦' },
  { value: 'KingBase', label: '人大金仓' },
  { value: 'GBase', label: '南大通用' },
  { value: 'Other', label: '其他' },
];

/**
 * 驱动搜索表单组件
 */
const DriverSearchForm: React.FC<DriverSearchFormProps> = memo(({ onSearch, loading = false }) => {
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
            databaseType: undefined,
            status: undefined,
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Form.Item name="name" label="驱动名称" colon={false} className="mb-0">
              <Input allowClear autoComplete="off" placeholder="请输入驱动名称" />
            </Form.Item>

            <Form.Item name="databaseType" label="数据库类型" colon={false} className="mb-0">
              <Select allowClear placeholder="请选择数据库类型" options={DATABASE_TYPE_OPTIONS} />
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

            <Form.Item label=" " colon={false} className="mb-0">
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
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
});

DriverSearchForm.displayName = 'DriverSearchForm';

export default DriverSearchForm;
export { DATABASE_TYPE_OPTIONS };

