import { RedoOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, Form, Input, type InputRef } from 'antd';
import { useTranslation } from 'react-i18next';
import type { UserSearchParams } from '../../types';

/**
 * 搜索表单属性
 */
interface SearchFormProps {
  onSearch: (values: UserSearchParams) => void;
  usernameRef: React.RefObject<InputRef | null>;
  loading: boolean;
}

/**
 * 回收站搜索表单（简化版）
 */
const SearchForm: React.FC<SearchFormProps> = ({ onSearch, usernameRef, loading }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  /**
   * 重置
   */
  const handleReset = () => {
    form.resetFields();
    onSearch(form.getFieldsValue());
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
      <Card>
        <Form form={form} onFinish={onSearch} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <Form.Item name="username" label="用户名" colon={false}>
              <Input placeholder="请输入用户名" autoFocus allowClear autoComplete="off" ref={usernameRef} />
            </Form.Item>
            <Form.Item name="realName" label="真实姓名" colon={false}>
              <Input placeholder="请输入真实姓名" allowClear autoComplete="off" />
            </Form.Item>
            {/* 操作按钮 */}
            <div className="flex gap-3 justify-end">
              <Button type="default" icon={<RedoOutlined />} onClick={handleReset}>
                {t('common.operation.reset')}
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} icon={<SearchOutlined />}>
                {t('common.operation.search')}
              </Button>
            </div>
          </div>
        </Form>
      </Card>
    </ConfigProvider>
  );
};

export default SearchForm;
