import { DownOutlined, RedoOutlined, SearchOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, Form, Input, Select, Space } from 'antd';
import type React from 'react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ENDPOINT_CATEGORIES, ENDPOINT_TYPE_OPTIONS } from '@/services/engine/endpoint/types';
import type { EndpointSearchParams } from '../types';

interface SearchFormProps {
  onSearch: (values: Omit<EndpointSearchParams, 'pageNum' | 'pageSize'>) => void;
  loading: boolean;
}

/**
 * 搜索表单
 * @param onSearch 搜索回调
 * @returns 搜索表单
 */
const SearchForm: React.FC<SearchFormProps> = memo(({ onSearch, loading = false }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  /**
   * 重置
   */
  const handleReset = () => {
    form.resetFields();
    onSearch({});
  };

  /**
   * 展开/收起高级搜索
   */
  const toggleAdvanced = () => {
    setExpanded(!expanded);
  };

  /**
   * 搜索
   */
  const handleSearch = () => {
    form.validateFields().then((values) => {
      onSearch(values);
    });
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
      <Card className="mb-4">
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
          {/* 基础搜索 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
              <Select allowClear placeholder="请选择端点类型" options={ENDPOINT_TYPE_OPTIONS} />
            </Form.Item>

            <div className="hidden lg:flex items-center justify-end gap-2">
              <Button type="default" icon={<RedoOutlined />} onClick={handleReset}>
                {t('common.operation.reset')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                {t('common.operation.search')}
              </Button>
              <Button type="link" icon={expanded ? <UpOutlined /> : <DownOutlined />} onClick={toggleAdvanced}>
                {expanded ? '收起' : '展开'}
              </Button>
            </div>
          </div>

          {/* 高级搜索 */}
          {expanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Form.Item
                name="category"
                label="端点分类"
                colon={false}
                className="mb-0"
                labelCol={{ flex: '0 0 80px' }}
                wrapperCol={{ flex: '1' }}
              >
                <Select allowClear placeholder="请选择端点分类" options={ENDPOINT_CATEGORIES} />
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
              onClick={toggleAdvanced}
              className="pl-0"
            >
              {expanded ? '收起' : '展开'}
            </Button>
            <Space>
              <Button type="default" icon={<RedoOutlined />} onClick={handleReset}>
                {t('common.operation.reset')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                {t('common.operation.search')}
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </ConfigProvider>
  );
});

SearchForm.displayName = 'SearchForm';

export default SearchForm;
