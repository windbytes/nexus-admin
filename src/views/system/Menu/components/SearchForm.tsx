import { RedoOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, Form, Input, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import type { MenuSearchParams } from '../types';

/**
 * 搜索表单属性
 */
interface SearchFormProps {
  onSearch: (values: MenuSearchParams) => void;
  loading: boolean;
}

/**
 * 搜索表单
 */
const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  /**
   * 重置
   */
  const handleReset = () => {
    form.resetFields();
    onSearch(form.getFieldsValue());
  };

  // 计算所有字段（包括基础字段和高级字段）
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

  // 操作按钮组件
  const ActionButtons = ({ className = '' }: { className?: string }) => (
    <div className={`flex gap-3 justify-end ${className}`}>
      <Button type="default" icon={<RedoOutlined />} onClick={handleReset}>
        {t('common.operation.reset')}
      </Button>
      <Button type="primary" htmlType="submit" loading={loading} icon={<SearchOutlined />}>
        {t('common.operation.search')}
      </Button>
    </div>
  );

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
        <Form form={form} onFinish={onSearch} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4`}>
            {/* 渲染所有字段 */}
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
};

export default SearchForm;
