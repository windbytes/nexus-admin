import { DownOutlined, RedoOutlined, SearchOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, Form, Input, Select } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SEARCH_FORM_GRID_LABEL_COL, SEARCH_FORM_GRID_WRAPPER_COL } from '@/constants/formLayout';
import { DICT_TYPE_OPTIONS } from '../constants';
import type { DictSearchParams } from '../types';

interface SearchFormProps {
  onSearch: (values: DictSearchParams) => void;
  loading: boolean;
}

/**
 * 字典列表检索表单：默认三项 + 第四格操作区（含展开），展开后显示「状态」等，布局与用户管理检索一致
 */
const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleReset = () => {
    form.resetFields();
    onSearch(form.getFieldsValue());
  };

  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };

  const allFields = [
    {
      name: 'dictCode',
      label: '字典编码',
      component: <Input placeholder="请输入字典编码" allowClear autoComplete="off" />,
    },
    {
      name: 'dictName',
      label: '字典名称',
      component: <Input placeholder="请输入字典名称" allowClear autoComplete="off" />,
    },
    {
      name: 'dictType',
      label: '字典类型',
      component: (
        <Select
          allowClear
          placeholder="请选择类型"
          className="rounded-md"
          options={DICT_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
        />
      ),
    },
    ...(showAdvanced
      ? [
          {
            name: 'enabled',
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
        ]
      : []),
  ];

  const fieldsPerRow = 4;
  const totalFields = allFields.length;
  const fieldsInLastRow = totalFields % fieldsPerRow;
  const shouldPlaceButtonInLastRow = fieldsInLastRow > 0 && fieldsInLastRow < fieldsPerRow;
  const shouldPlaceButtonInNewRow = fieldsInLastRow === 0;

  const ActionButtons = ({ className = '' }: { className?: string }) => (
    <div className={`flex gap-3 justify-end ${className}`}>
      <Button type="default" icon={<RedoOutlined />} onClick={handleReset}>
        {t('common.operation.reset')}
      </Button>
      <Button type="primary" htmlType="submit" loading={loading} icon={<SearchOutlined />}>
        {t('common.operation.search')}
      </Button>
      <Button
        type="link"
        onClick={toggleAdvanced}
        classNames={{ content: 'text-(--ant-color-primary) flex items-center gap-1' }}
      >
        {showAdvanced ? (
          <UpOutlined className="text-(--ant-color-primary)!" />
        ) : (
          <DownOutlined className="text-(--ant-color-primary)!" />
        )}
        {showAdvanced ? '收起' : '展开'}
      </Button>
    </div>
  );

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
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 ${showAdvanced ? 'mb-4' : ''}`}>
            {allFields.map((field) => (
              <Form.Item key={field.name} name={field.name} label={field.label} colon={false}>
                {field.component}
              </Form.Item>
            ))}

            {!showAdvanced && <ActionButtons className="items-end" />}

            {showAdvanced && shouldPlaceButtonInLastRow && <ActionButtons className="items-end" />}
          </div>

          {showAdvanced && shouldPlaceButtonInNewRow && <ActionButtons />}
        </Form>
      </Card>
    </ConfigProvider>
  );
};

export default SearchForm;
