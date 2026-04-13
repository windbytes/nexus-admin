import { RedoOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, Form, Input, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { SEARCH_FORM_GRID_LABEL_COL, SEARCH_FORM_GRID_WRAPPER_COL } from '@/constants/formLayout';
import { DICT_TYPE_OPTIONS } from '../constants';
import type { DictSearchParams } from '../types';

interface SearchFormProps {
  onSearch: (values: DictSearchParams) => void;
  loading: boolean;
}

/**
 * 字典列表检索表单：上面检索、下面表格布局中的检索区域
 */
const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const handleReset = () => {
    form.resetFields();
    onSearch(form.getFieldsValue());
  };

  return (
    <ConfigProvider
      theme={{
        components: { Form: { itemMarginBottom: 0 } },
      }}
    >
      <Card className="mb-4">
        <Form
          form={form}
          onFinish={onSearch}
          labelCol={SEARCH_FORM_GRID_LABEL_COL}
          wrapperCol={SEARCH_FORM_GRID_WRAPPER_COL}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Form.Item name="dictCode" label="字典编码">
              <Input placeholder="请输入字典编码" allowClear autoComplete="off" />
            </Form.Item>
            <Form.Item name="dictName" label="字典名称">
              <Input placeholder="请输入字典名称" allowClear autoComplete="off" />
            </Form.Item>
            <Form.Item name="dictType" label="字典类型">
              <Select
                allowClear
                placeholder="请选择类型"
                className="rounded-md w-full"
                options={DICT_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
              />
            </Form.Item>
            <Form.Item name="enabled" label="状态">
              <Select
                allowClear
                placeholder="请选择状态"
                className="rounded-md w-full"
                options={[
                  { value: true, label: '启用' },
                  { value: false, label: '停用' },
                ]}
              />
            </Form.Item>
            <div className="flex gap-3 items-end justify-end col-span-full sm:col-span-2 md:col-span-1">
              <Button type="default" icon={<RedoOutlined />} onClick={handleReset}>
                {t('common.operation.reset')}
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} icon={<SearchOutlined />}>
                {t('common.operation.search')}
              </Button>
            </div>
          </div>
        </Form>
      </Card>
    </ConfigProvider>
  );
};

export default SearchForm;
