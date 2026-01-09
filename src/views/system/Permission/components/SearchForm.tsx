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
          {/* 基础搜索 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <Form.Item name="permCode" label="权限编码" colon={false}>
              <Input placeholder="请输入权限编码" allowClear autoComplete="off" />
            </Form.Item>
            <Form.Item name="permName" label="权限名称" colon={false}>
              <Input placeholder="请输入权限名称" allowClear autoComplete="off" />
            </Form.Item>
            <Form.Item name="permType" label="权限类型" colon={false}>
              <Select allowClear placeholder="请选择权限类型" className="rounded-md" options={PERM_TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item name="status" label="状态" colon={false}>
              <Select
                allowClear
                placeholder="请选择状态"
                className="rounded-md"
                options={PERM_STATUS_OPTIONS}
              />
            </Form.Item>
          </div>

          {/* 高级搜索 */}
          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Form.Item name="moduleCode" label="模块编码" colon={false}>
                <Input placeholder="请输入模块编码" allowClear autoComplete="off" />
              </Form.Item>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3 justify-end">
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
        </Form>
      </Card>
    </ConfigProvider>
  );
};

export default SearchForm;
