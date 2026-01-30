import { DownOutlined, RedoOutlined, SearchOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, Form, Input, Select } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resourceTypeOptions, statusOptions } from '../constants';
import type { PermissionSearchParams } from '../types';

/**
 * 搜索表单属性
 */
interface SearchFormProps {
  /** 搜索回调 */
  onSearch: (values: PermissionSearchParams) => void;
  /** 加载状态 */
  loading: boolean;
}

/**
 * 权限点搜索表单组件
 */
const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  /**
   * 重置表单
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

  // 所有搜索字段配置
  const allFields = [
    {
      name: 'permCode',
      label: '权限编码',
      component: <Input placeholder="请输入权限编码" allowClear autoComplete="off" />,
    },
    {
      name: 'permName',
      label: '权限名称',
      component: <Input placeholder="请输入权限名称" allowClear autoComplete="off" />,
    },
    {
      name: 'resourceType',
      label: '资源类型',
      component: (
        <Select
          allowClear
          placeholder="请选择资源类型"
          options={resourceTypeOptions}
        />
      ),
    },
    ...(showAdvanced
      ? [
          {
            name: 'status',
            label: '状态',
            component: (
              <Select
                allowClear
                placeholder="请选择状态"
                options={statusOptions}
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

  /**
   * 操作按钮组件
   */
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
        <Form form={form} onFinish={onSearch} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 ${showAdvanced ? 'mb-4' : ''}`}>
            {/* 渲染所有字段 */}
            {allFields.map((field) => (
              <Form.Item key={field.name} name={field.name} label={field.label} colon={false}>
                {field.component}
              </Form.Item>
            ))}

            {/* 未展开时，操作按钮放在同一行（第4个位置） */}
            {!showAdvanced && <ActionButtons className="items-end" />}

            {/* 展开时，如果最后一行不满4个，操作按钮放在最后 */}
            {showAdvanced && shouldPlaceButtonInLastRow && <ActionButtons className="items-end" />}
          </div>

          {/* 展开时，如果刚好4的倍数，操作按钮单独一行 */}
          {showAdvanced && shouldPlaceButtonInNewRow && <ActionButtons />}
        </Form>
      </Card>
    </ConfigProvider>
  );
};

export default SearchForm;
