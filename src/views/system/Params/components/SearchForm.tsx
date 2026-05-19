import { DownOutlined, RedoOutlined, SearchOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, Form, Input, Select } from 'antd';
import type React from 'react';
import { SEARCH_FORM_GRID_LABEL_COL, SEARCH_FORM_GRID_WRAPPER_COL } from '@/constants/formLayout';
import type { SysParamSearchParams } from '@/services/system/params';
import { CATEGORY_OPTIONS } from '@/services/system/params';

interface SearchFormProps {
  onSearch: (values: SysParamSearchParams) => void;
  loading?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
  expanded?: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading = false, onToggleExpand, expanded = false }) => {
  const [form] = Form.useForm();

  const handleSearch = () => {
    form.validateFields().then((values) => {
      onSearch(values);
    });
  };

  const handleReset = () => {
    form.resetFields();
  };

  const handleToggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand(!expanded);
    }
  };

  // 计算所有字段（包括基础字段和高级字段）
  const allFields = [
    {
      name: 'name',
      label: '名称',
      component: <Input allowClear autoComplete="off" placeholder="请输入参数名称" />,
    },
    {
      name: 'code',
      label: '编码',
      component: <Input allowClear autoComplete="off" placeholder="请输入参数键值" />,
    },
    {
      name: 'category',
      label: '分类',
      component: <Select allowClear placeholder="请选择参数分类" options={CATEGORY_OPTIONS} />,
    },
    ...(expanded
      ? [
          {
            name: 'status',
            label: '状态',
            component: (
              <Select
                allowClear
                placeholder="请选择状态"
                options={[
                  { value: 1, label: '启用' },
                  { value: 0, label: '禁用' },
                ]}
              />
            ),
          },
          {
            name: 'dataType',
            label: '类型',
            component: (
              <Select
                allowClear
                placeholder="请选择类型"
                options={[
                  { value: 'STRING', label: '字符串' },
                  { value: 'NUMBER', label: '数字' },
                  { value: 'BOOLEAN', label: '布尔值' },
                  { value: 'DATE', label: '日期' },
                  { value: 'JSON', label: 'JSON' },
                ]}
              />
            ),
          },
          {
            name: 'required',
            label: '必填',
            component: (
              <Select
                allowClear
                placeholder="请选择必填"
                options={[
                  { value: true, label: '是' },
                  { value: false, label: '否' },
                ]}
              />
            ),
          },
        ]
      : []),
  ];

  // 计算布局
  const fieldsPerRow = 4;
  const totalFields = allFields.length;
  const fieldsInLastRow = totalFields % fieldsPerRow;
  const shouldPlaceButtonInLastRow = fieldsInLastRow > 0 && fieldsInLastRow < fieldsPerRow;
  const shouldPlaceButtonInNewRow = fieldsInLastRow === 0;

  // 操作按钮组件
  const ActionButtons = ({ className = '' }: { className?: string }) => (
    <div className={`flex gap-3 justify-end ${className}`}>
      <Button type="default" icon={<RedoOutlined />} onClick={handleReset}>
        重置
      </Button>
      <Button
        type="primary"
        htmlType="submit"
        loading={loading}
        icon={<SearchOutlined />}
        onClick={handleSearch}
        className="bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600"
      >
        搜索
      </Button>
      <Button
        type="link"
        onClick={handleToggleExpand}
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
      <Card>
        <Form
          form={form}
          initialValues={{
            name: '',
            code: '',
            category: '',
          }}
          labelCol={SEARCH_FORM_GRID_LABEL_COL}
          wrapperCol={SEARCH_FORM_GRID_WRAPPER_COL}
        >
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 ${expanded ? 'mb-4' : ''}`}>
            {/* 渲染所有字段 */}
            {allFields.map((field) => (
              <Form.Item key={field.name} name={field.name} label={field.label} colon={false} className="mb-0">
                {field.component}
              </Form.Item>
            ))}

            {/* 未展开时，操作按钮放在同一行（第4个位置） */}
            {!expanded && <ActionButtons className="items-end" />}

            {/* 展开时，如果最后一行不满4个，操作按钮放在最后 */}
            {expanded && shouldPlaceButtonInLastRow && <ActionButtons className="items-end" />}
          </div>

          {/* 展开时，如果刚好4的倍数，操作按钮单独一行 */}
          {expanded && shouldPlaceButtonInNewRow && <ActionButtons />}
        </Form>
      </Card>
    </ConfigProvider>
  );
};

export default SearchForm;
