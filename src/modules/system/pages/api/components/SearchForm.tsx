/**
 * @file 接口注册表搜索表单
 */

import { RedoOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, Form, Input, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ApiSearchParams } from '@/shared/api/system/api/type';
import { SEARCH_FORM_GRID_LABEL_COL, SEARCH_FORM_GRID_WRAPPER_COL } from '@/shared/constants/formLayout';
import { METHOD_OPTIONS } from '../constants';

interface SearchFormProps {
  onSearch: (values: Partial<ApiSearchParams>) => void;
  loading: boolean;
}

/**
 * 接口注册表顶部搜索表单。
 *
 * @param props - 搜索回调与 loading
 */
function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  function handleReset() {
    form.resetFields();
    onSearch(form.getFieldsValue());
  }

  const allFields = [
    {
      name: 'apiName',
      label: '接口名称',
      component: <Input placeholder="请输入接口名称" allowClear autoComplete="off" />,
    },
    {
      name: 'path',
      label: '接口路径',
      component: <Input placeholder="请输入接口路径" allowClear autoComplete="off" />,
    },
    {
      name: 'method',
      label: '请求方法',
      component: <Select allowClear placeholder="请选择请求方法" options={METHOD_OPTIONS} />,
    },
    {
      name: 'isPublic',
      label: '是否公开',
      component: (
        <Select
          allowClear
          placeholder="请选择"
          options={[
            { value: true, label: '白名单（免认证）' },
            { value: false, label: '需鉴权' },
          ]}
        />
      ),
    },
  ];

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
          onFinish={onSearch}
          labelCol={SEARCH_FORM_GRID_LABEL_COL}
          wrapperCol={SEARCH_FORM_GRID_WRAPPER_COL}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {allFields.map((field) => (
              <Form.Item key={field.name} name={field.name} label={field.label} colon={false}>
                {field.component}
              </Form.Item>
            ))}
            <div className="flex gap-3 justify-end items-end">
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
}

export default SearchForm;
