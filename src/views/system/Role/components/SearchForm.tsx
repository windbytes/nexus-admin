import { DownOutlined, RedoOutlined, SearchOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, DatePicker, Form, Input, Select, Space } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { RoleSearchParams } from '../types';

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
            <Form.Item name="roleCode" label="角色编码" colon={false}>
              <Input placeholder="请输入角色编码" allowClear autoComplete="off" />
            </Form.Item>
            <Form.Item name="roleName" label="角色名称" colon={false}>
              <Input placeholder="请输入角色名称" allowClear autoComplete="off" />
            </Form.Item>
            <Form.Item name="status" label="状态" colon={false}>
              <Select
                allowClear
                placeholder="请选择状态"
                options={[
                  { value: 1, label: '正常' },
                  { value: 0, label: '停用' },
                ]}
              />
            </Form.Item>
            <Form.Item name="roleType" label="角色类型" colon={false}>
              <Select
                allowClear
                placeholder="请选择角色类型"
                options={[
                  { value: 0, label: '系统角色' },
                  { value: 1, label: '普通角色' },
                ]}
              />
            </Form.Item>
          </div>

          {/* 高级搜索 */}
          {expanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Form.Item name="dataScope" label="数据权限范围" colon={false}>
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
              </Form.Item>
              <Form.Item name="remark" label="描述" colon={false}>
                <Input placeholder="请输入角色描述" allowClear autoComplete="off" />
              </Form.Item>
              <Form.Item name="createTime" label="创建时间" colon={false}>
                <DatePicker
                  className="w-full"
                  placeholder="请选择创建时间"
                  allowClear
                  showTime={false}
                  format="YYYY-MM-DD"
                />
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
            <Button type="link" onClick={toggleAdvanced} className="text-blue-500 flex items-center gap-1">
              {expanded ? <UpOutlined /> : <DownOutlined />}
              {expanded ? '收起' : '展开'}
            </Button>
          </div>
        </Form>
      </Card>
    </ConfigProvider>
  );
};

export default SearchForm;

