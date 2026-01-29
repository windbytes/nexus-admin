import { DownOutlined, RedoOutlined, SearchOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, Form, Input, Select } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PERM_STATUS_OPTIONS, PERM_TYPE_OPTIONS } from '../constants';
import type { PermissionSearchParams } from '../types';

/**
 * 搜索表单属性
 */
interface SearchFormProps {
  onSearch: (values: PermissionSearchParams) => void;
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

  // 计算所有字段（包括基础字段和高级字段）
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
      name: 'permType',
      label: '权限类型',
      component: <Select allowClear placeholder="请选择权限类型" className="rounded-md" options={PERM_TYPE_OPTIONS} />,
    },
    ...(showAdvanced
      ? [
          {
            name: 'status',
            label: '状态',
            component: (
              <Select allowClear placeholder="请选择状态" className="rounded-md" options={PERM_STATUS_OPTIONS} />
            ),
          },
          {
            name: 'moduleCode',
            label: '模块编码',
            component: <Input placeholder="请输入模块编码" allowClear autoComplete="off" />,
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
        <Form form={form} onFinish={onSearch} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
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
