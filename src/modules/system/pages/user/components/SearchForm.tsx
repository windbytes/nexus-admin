import { DownOutlined, RedoOutlined, SearchOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, DatePicker, Form, Input, Select } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SEARCH_FORM_GRID_LABEL_COL, SEARCH_FORM_GRID_WRAPPER_COL } from '@/shared/constants/formLayout';
import type { UserSearchParams } from '../types';

const { RangePicker } = DatePicker;

/**
 * 搜索表单属性
 */
interface SearchFormProps {
  onSearch: (values: UserSearchParams) => void;
  loading: boolean;
}

/**
 * 用户列表搜索表单（支持展开 / 收起更多搜索条件）。
 *
 * @param props - 搜索回调与 loading
 */
const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  /**
   * 重置
   */
  const handleReset = () => {
    form.resetFields();
    onSearch(form.getFieldsValue());
  };

  /**
   * 展开/收起高级搜索
   */
  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };

  // 基础字段（常驻显示）
  const baseFields = [
    {
      name: 'username',
      label: '用户名',
      component: <Input placeholder="请输入用户名" allowClear autoComplete="off" />,
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
            { value: 1, label: '启用' },
            { value: 0, label: '停用' },
          ]}
        />
      ),
    },
    {
      name: 'realName',
      label: '真实姓名',
      component: <Input placeholder="请输入真实姓名" allowClear autoComplete="off" />,
    },
  ];

  // 展开后才显示的字段
  const advancedFields = [
    { name: 'email', label: '邮箱', component: <Input placeholder="请输入邮箱" allowClear autoComplete="off" /> },
    {
      name: 'phone',
      label: '手机号',
      component: <Input placeholder="请输入手机号" allowClear autoComplete="off" />,
    },
    {
      name: 'createTime',
      label: '创建时间',
      component: <RangePicker className="w-full" placeholder={['开始时间', '结束时间']} />,
    },
    {
      name: 'roleId',
      label: '角色',
      component: (
        <Select
          allowClear
          placeholder="请选择角色"
          options={[
            { value: 'admin', label: '管理员' },
            { value: 'user', label: '普通用户' },
            { value: 'guest', label: '访客' },
          ]}
        />
      ),
    },
  ];

  const allFields = showAdvanced ? [...baseFields, ...advancedFields] : baseFields;

  // 计算布局
  const fieldsPerRow = 4;
  const totalFields = allFields.length;
  const fieldsInLastRow = totalFields % fieldsPerRow;
  const shouldPlaceButtonInLastRow = fieldsInLastRow > 0 && fieldsInLastRow < fieldsPerRow;
  const shouldPlaceButtonInNewRow = fieldsInLastRow === 0;

  // 操作按钮（重置/查询/展开）
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
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 ${showAdvanced ? 'mb-4' : ''}`}>
            {allFields.map((field) => (
              <Form.Item key={field.name} name={field.name} label={field.label} colon={false}>
                {field.component}
              </Form.Item>
            ))}

            {/* 未展开时按钮放在同一行右侧 */}
            {!showAdvanced && <ActionButtons className="items-end" />}

            {/* 展开时最后一行不满4个则放末尾 */}
            {showAdvanced && shouldPlaceButtonInLastRow && <ActionButtons className="items-end" />}
          </div>

          {/* 展开且恰好4的倍数时按钮单独一行 */}
          {showAdvanced && shouldPlaceButtonInNewRow && <ActionButtons />}
        </Form>
      </Card>
    </ConfigProvider>
  );
};

export default SearchForm;
