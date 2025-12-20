import { DownOutlined, RedoOutlined, SearchOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, DatePicker, Form, Input, Select, Space } from 'antd';
import type React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface RoleSearchFormProps {
  onFinish: (values: any) => void;
  isLoading: boolean;
}

/**
 * 角色检索表单
 * @param props 参数
 * @returns 检索表单
 */
const RoleSearchForm: React.FC<RoleSearchFormProps> = ({ onFinish, isLoading }) => {
  // 检索表单
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

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
        <Form initialValues={{ menuType: '', status: '', roleType: '', dataScope: '' }} onFinish={onFinish}>
          {/* 基础搜索条件 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Form.Item name="roleCode" label="角色编码" colon={false}>
              <Input autoFocus allowClear autoComplete="off" placeholder="请输入角色编码" />
            </Form.Item>
            <Form.Item name="roleName" label="角色名称" colon={false}>
              <Input allowClear autoComplete="off" placeholder="请输入角色名称" />
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

          {/* 高级搜索条件 */}
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${expanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                <Input allowClear autoComplete="off" placeholder="请输入角色描述" />
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
          </div>

          {/* 操作按钮区域 */}
          <div className="flex justify-end mt-4">
            <Space>
              <Button
                type="default"
                icon={<RedoOutlined />}
                onClick={() => {
                  form.resetFields();
                }}
              >
                {t('common.operation.reset')}
              </Button>
              <Button type="primary" htmlType="submit" loading={isLoading} icon={<SearchOutlined />}>
                {t('common.operation.search')}
              </Button>
              <Button
                type="link"
                icon={expanded ? <UpOutlined /> : <DownOutlined />}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? '收起' : '展开'}
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </ConfigProvider>
  );
};

export default RoleSearchForm;
