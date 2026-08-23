/**
 * @file 接口注册表搜索表单（支持展开 / 收起更多搜索条件）
 */

import { DownOutlined, RedoOutlined, SearchOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, Form, Input, Select } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ApiSearchParams } from '@/shared/api/system/api/type';
import { SEARCH_FORM_GRID_LABEL_COL, SEARCH_FORM_GRID_WRAPPER_COL } from '@/shared/constants/formLayout';
import { METHOD_OPTIONS } from '../constants';

interface SearchFormProps {
  onSearch: (values: Partial<ApiSearchParams>) => void;
  loading: boolean;
}

/** 常驻（始终显示）的搜索字段 */
const BASE_FIELDS = [
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
];

/** 展开后才显示的搜索字段 */
const ADVANCED_FIELDS = [
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

function ActionButtons({
  loading,
  resetLabel,
  searchLabel,
  expanded,
  onReset,
  onToggle,
}: {
  loading: boolean;
  resetLabel: string;
  searchLabel: string;
  expanded: boolean;
  onReset: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-3 justify-end items-end">
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
 * 接口注册表顶部搜索表单。按钮居右，支持展开 / 收起更多搜索条件。
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

  const actionButtonProps = {
    loading,
    resetLabel: t('common.operation.reset'),
    searchLabel: t('common.operation.search'),
    expanded,
    onReset: handleReset,
    onToggle: () => setExpanded(!expanded),
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
            {BASE_FIELDS.map((field) => (
              <Form.Item key={field.name} name={field.name} label={field.label} colon={false}>
                {field.component}
              </Form.Item>
            ))}
            {!expanded && <ActionButtons {...actionButtonProps} />}
            {expanded &&
              ADVANCED_FIELDS.map((field) => (
                <Form.Item key={field.name} name={field.name} label={field.label} colon={false}>
                  {field.component}
                </Form.Item>
              ))}
          </div>
          {expanded && (
            <div className="mt-4">
              <ActionButtons {...actionButtonProps} />
            </div>
          )}
        </Form>
      </Card>
    </ConfigProvider>
  );
}

export default SearchForm;
