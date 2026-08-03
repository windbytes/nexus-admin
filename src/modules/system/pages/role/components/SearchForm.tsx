/**
 * @file 角色列表搜索表单
 */

import { DownOutlined, RedoOutlined, SearchOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, DatePicker, Form, Input, Select } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { RoleSearchParams } from '@/shared/api/system/role/type';
import { SEARCH_FORM_GRID_LABEL_COL, SEARCH_FORM_GRID_WRAPPER_COL } from '@/shared/constants/formLayout';

interface SearchFormProps {
  onSearch: (values: RoleSearchParams) => void;
  loading: boolean;
}

const BASE_FIELDS = [
  {
    name: 'roleCode',
    label: '角色编码',
    component: <Input placeholder="请输入角色编码" allowClear autoComplete="off" />,
  },
  {
    name: 'roleName',
    label: '角色名称',
    component: <Input placeholder="请输入角色名称" allowClear autoComplete="off" />,
  },
  {
    name: 'status',
    label: '状态',
    component: (
      <Select
        allowClear
        placeholder="请选择状态"
        options={[
          { value: 1, label: '正常' },
          { value: 0, label: '停用' },
        ]}
      />
    ),
  },
];

const ADVANCED_FIELDS = [
  {
    name: 'roleType',
    label: '角色类型',
    component: (
      <Select
        allowClear
        placeholder="请选择角色类型"
        options={[
          { value: 0, label: '系统角色' },
          { value: 1, label: '普通角色' },
        ]}
      />
    ),
  },
  {
    name: 'remark',
    label: '描述',
    component: <Input placeholder="请输入角色描述" allowClear autoComplete="off" />,
  },
  {
    name: 'createTime',
    label: '创建时间',
    component: (
      <DatePicker className="w-full" placeholder="请选择创建时间" allowClear showTime={false} format="YYYY-MM-DD" />
    ),
  },
];

function ActionButtons({
  className = '',
  loading,
  resetLabel,
  searchLabel,
  expanded,
  onReset,
  onToggle,
}: {
  className?: string;
  loading: boolean;
  resetLabel: string;
  searchLabel: string;
  expanded: boolean;
  onReset: () => void;
  onToggle: () => void;
}) {
  return (
    <div className={`flex gap-3 justify-end ${className}`}>
      <Button type="default" icon={<RedoOutlined />} onClick={onReset}>
        {resetLabel}
      </Button>
      <Button type="primary" htmlType="submit" loading={loading} icon={<SearchOutlined />}>
        {searchLabel}
      </Button>
      <Button
        type="link"
        onClick={onToggle}
        classNames={{ content: 'text-(--ant-color-primary) flex items-center gap-1' }}
      >
        {expanded ? (
          <UpOutlined className="text-(--ant-color-primary)!" />
        ) : (
          <DownOutlined className="text-(--ant-color-primary)!" />
        )}
        {expanded ? '收起' : '展开'}
      </Button>
    </div>
  );
}

/**
 * 角色列表顶部搜索表单。
 *
 * @param props - 搜索回调与 loading
 */
function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  function handleReset() {
    form.resetFields();
    onSearch(form.getFieldsValue());
  }

  function toggleAdvanced() {
    setExpanded(!expanded);
  }

  const allFields = expanded ? [...BASE_FIELDS, ...ADVANCED_FIELDS] : BASE_FIELDS;

  const fieldsPerRow = 4;
  const totalFields = allFields.length;
  const fieldsInLastRow = totalFields % fieldsPerRow;
  const shouldPlaceButtonInLastRow = fieldsInLastRow > 0 && fieldsInLastRow < fieldsPerRow;
  const shouldPlaceButtonInNewRow = fieldsInLastRow === 0;

  const actionButtonProps = {
    loading,
    resetLabel: t('common.operation.reset'),
    searchLabel: t('common.operation.search'),
    expanded,
    onReset: handleReset,
    onToggle: toggleAdvanced,
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
          onFinish={onSearch}
          labelCol={SEARCH_FORM_GRID_LABEL_COL}
          wrapperCol={SEARCH_FORM_GRID_WRAPPER_COL}
        >
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 ${expanded ? 'mb-4' : ''}`}>
            {allFields.map((field) => (
              <Form.Item key={field.name} name={field.name} label={field.label} colon={false}>
                {field.component}
              </Form.Item>
            ))}
            {!expanded && <ActionButtons className="items-end" {...actionButtonProps} />}
            {expanded && shouldPlaceButtonInLastRow && <ActionButtons className="items-end" {...actionButtonProps} />}
          </div>
          {expanded && shouldPlaceButtonInNewRow && <ActionButtons {...actionButtonProps} />}
        </Form>
      </Card>
    </ConfigProvider>
  );
}

export default SearchForm;
