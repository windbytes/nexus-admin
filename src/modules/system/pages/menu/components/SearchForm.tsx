import { RedoOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, Form, Input, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { SEARCH_FORM_GRID_LABEL_COL, SEARCH_FORM_GRID_WRAPPER_COL } from '@/shared/constants/formLayout';
import type { MenuSearchParams } from '../types';

interface SearchFormProps {
  /**
   * 点击查询或重置后回调。
   * @param values - 表单当前值（name / status / menuType）
   */
  onSearch: (values: MenuSearchParams) => void;
  /** 查询按钮 loading，通常绑定列表请求的 `isFetching` */
  loading: boolean;
}

/**
 * 菜单列表顶部搜索表单（名称 / 状态 / 类型）。
 *
 * @param props - 搜索回调与 loading 状态
 * @returns 搜索 Card
 */
function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  /**
   * 重置所有字段并立即按空条件重新查询。
   */
  function handleReset() {
    form.resetFields();
    onSearch(form.getFieldsValue());
  }

  const allFields = [
    {
      name: 'name',
      label: '菜单名称',
      component: <Input placeholder="请输入菜单名称" allowClear autoComplete="off" />,
    },
    {
      name: 'status',
      label: '状态',
      component: (
        <Select
          allowClear
          placeholder="请选择状态"
          className="rounded-md"
          options={[
            { value: true, label: '启用' },
            { value: false, label: '停用' },
          ]}
        />
      ),
    },
    {
      name: 'menuType',
      label: '菜单类型',
      component: (
        <Select
          allowClear
          placeholder="请选择菜单类型"
          options={[
            { value: 0, label: '目录' },
            { value: 1, label: '子菜单' },
            { value: 2, label: '子路由' },
            { value: 3, label: '权限按钮' },
          ]}
        />
      ),
    },
  ];

  function ActionButtons({ className = '' }: { className?: string }) {
    return (
      <div className={`flex gap-3 justify-end ${className}`}>
        <Button type="default" icon={<RedoOutlined />} onClick={handleReset}>
          {t('common.operation.reset')}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading} icon={<SearchOutlined />}>
          {t('common.operation.search')}
        </Button>
      </div>
    );
  }

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
            <ActionButtons className="items-end" />
          </div>
        </Form>
      </Card>
    </ConfigProvider>
  );
}

export default SearchForm;
