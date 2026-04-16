import { RedoOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, Form, Input, Select } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { SEARCH_FORM_GRID_LABEL_COL, SEARCH_FORM_GRID_WRAPPER_COL } from '@/constants/formLayout';
import { DATABASE_TYPE_FILTER_OPTIONS } from '../constants';
import type { ConnectionSearchParams } from '../types';

interface SearchFormProps {
  onSearch: (values: ConnectionSearchParams) => void;
  loading?: boolean;
}

/**
 * 连接列表筛选：名称、编码、库类型、启用状态。
 */
const SearchForm = memo(({ onSearch, loading = false }: SearchFormProps) => {
  const [form] = Form.useForm<ConnectionSearchParams>();
  const { t } = useTranslation();

  const handleReset = () => {
    form.resetFields();
    onSearch(form.getFieldsValue());
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Form: { itemMarginBottom: 0 },
        },
      }}
    >
      <Card className="shrink-0">
        <Form<ConnectionSearchParams>
          form={form}
          onFinish={(values) =>
            onSearch({
              ...values,
            })
          }
          labelCol={SEARCH_FORM_GRID_LABEL_COL}
          wrapperCol={SEARCH_FORM_GRID_WRAPPER_COL}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Form.Item name="name" label="连接名称" colon={false}>
              <Input placeholder="名称" allowClear autoComplete="off" />
            </Form.Item>
            <Form.Item name="code" label="连接编码" colon={false}>
              <Input placeholder="唯一编码" allowClear autoComplete="off" />
            </Form.Item>
            <Form.Item name="databaseType" label="数据库类型" colon={false}>
              <Select allowClear placeholder="类型" options={[...DATABASE_TYPE_FILTER_OPTIONS]} className="w-full" />
            </Form.Item>
            <Form.Item name="enabled" label="状态" colon={false}>
              <Select
                allowClear
                placeholder="启用状态"
                options={[
                  { value: true, label: '启用' },
                  { value: false, label: '停用' },
                ]}
              />
            </Form.Item>
          </div>
          <div className="mt-3 flex justify-end gap-3">
            <Button type="default" icon={<RedoOutlined />} onClick={handleReset}>
              {t('common.operation.reset')}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SearchOutlined />}>
              {t('common.operation.search')}
            </Button>
          </div>
        </Form>
      </Card>
    </ConfigProvider>
  );
});

SearchForm.displayName = 'ConnectionDatabaseSearchForm';

export default SearchForm;
