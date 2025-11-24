import { DownOutlined, RedoOutlined, SearchOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, DatePicker, Divider, Form, Input, Select, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserSearchParams } from './types';

const { RangePicker } = DatePicker;
const { Text } = Typography;

/**
 * 搜索表单属性
 */
interface SearchFormProps {
  onSearch: (values: UserSearchParams) => void;
  isLoading: boolean;
}

/**
 * 搜索表单
 * @param onSearch 搜索回调
 * @returns 搜索表单
 */
const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
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
        <Form form={form} onFinish={onSearch} labelCol={{ span: 4 }}>
          {/* 基础搜索 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <Form.Item name="username" label="用户名" colon={false}>
              <Input placeholder="请输入用户名" allowClear autoComplete="off" className="rounded-md" />
            </Form.Item>

            <Form.Item name="realName" label="真实姓名" colon={false}>
              <Input placeholder="请输入真实姓名" allowClear autoComplete="off" className="rounded-md" />
            </Form.Item>

            <Form.Item name="sex" label="性别" colon={false}>
              <Select
                allowClear
                placeholder="请选择性别"
                className="rounded-md"
                options={[
                  { value: '1', label: '男' },
                  { value: '2', label: '女' },
                ]}
              />
            </Form.Item>

            <Form.Item name="status" label="状态" colon={false}>
              <Select
                allowClear
                placeholder="请选择状态"
                className="rounded-md"
                options={[
                  { value: 1, label: '启用' },
                  { value: 0, label: '停用' },
                ]}
              />
            </Form.Item>
          </div>

          {/* 高级搜索 */}
          {showAdvanced && (
            <>
              <Divider titlePlacement="start" className="text-gray-500">
                <Text type="secondary">高级搜索</Text>
              </Divider>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <Form.Item name="email" label="邮箱" colon={false}>
                  <Input placeholder="请输入邮箱" allowClear autoComplete="off" className="rounded-md" />
                </Form.Item>

                <Form.Item name="phone" label="手机号" colon={false}>
                  <Input placeholder="请输入手机号" allowClear autoComplete="off" className="rounded-md" />
                </Form.Item>

                <Form.Item name="createTime" label="创建时间" colon={false}>
                  <RangePicker className="w-full rounded-md" placeholder={['开始时间', '结束时间']} />
                </Form.Item>

                <Form.Item name="roleId" label="角色" colon={false}>
                  <Select
                    allowClear
                    placeholder="请选择角色"
                    className="rounded-md"
                    options={[
                      { value: 'admin', label: '管理员' },
                      { value: 'user', label: '普通用户' },
                      { value: 'guest', label: '访客' },
                    ]}
                  />
                </Form.Item>
              </div>
            </>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3 justify-end">
            <Button type="link" onClick={toggleAdvanced} className="text-blue-500 flex items-center gap-1">
              {showAdvanced ? <UpOutlined /> : <DownOutlined />}
              {showAdvanced ? '收起' : '展开'}高级搜索
            </Button>
            <Button type="default" icon={<RedoOutlined />} onClick={handleReset} className="rounded-md">
              {t('common.operation.reset')}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              icon={<SearchOutlined />}
              className="rounded-md shadow-sm"
            >
              {t('common.operation.search')}
            </Button>
          </div>
        </Form>
      </Card>
    </ConfigProvider>
  );
};

export default SearchForm;
