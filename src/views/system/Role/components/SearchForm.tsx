import { DownOutlined, RedoOutlined, SearchOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, DatePicker, Form, Input, Select } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SEARCH_FORM_GRID_LABEL_COL, SEARCH_FORM_GRID_WRAPPER_COL } from '@/constants/formLayout';
import type { RoleSearchParams } from '@/services/system/role/type';

/**
 * 搜索表单属性
 */
interface SearchFormProps {
  onSearch: (values: RoleSearchParams) => void;
  loading: boolean;
}

/**
 * 搜索表单
 * @param onSearch 搜索回调
 * @returns 搜索表单
 */
const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

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
    setExpanded(!expanded);
  };

  // 计算所有字段（包括基础字段和高级字段）
  const allFields = [
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
    ...(expanded
      ? [
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
            name: 'dataScope',
            label: '数据权限范围',
            component: (
              <Select
                allowClear
                placeholder="请选择数据权限范围"
                options={[
                  { value: '1', label: '访问本人' },
                  { value: '2', label: '访问所有数据' },
                  { value: '3', label: '访问本部门' },
                  { value: '4', label: '访问本部门及下级' },
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
              <DatePicker
                className="w-full"
                placeholder="请选择创建时间"
                allowClear
                showTime={false}
                format="YYYY-MM-DD"
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
      <Card className="mb-4">
        <Form
          form={form}
          onFinish={onSearch}
          labelCol={SEARCH_FORM_GRID_LABEL_COL}
          wrapperCol={SEARCH_FORM_GRID_WRAPPER_COL}
        >
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 ${expanded ? 'mb-4' : ''}`}>
            {/* 渲染所有字段 */}
            {allFields.map((field) => (
              <Form.Item key={field.name} name={field.name} label={field.label} colon={false}>
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
