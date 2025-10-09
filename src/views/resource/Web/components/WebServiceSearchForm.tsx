import type React from 'react';
import { memo } from 'react';
import { Card, Form, Input, Select, Button, Space, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { WebServiceSearchParams } from '@/services/resource/webServiceApi';
import { WEB_SERVICE_CATEGORIES } from '@/services/resource/webServiceApi';

interface WebServiceSearchFormProps {
  onSearch: (params: WebServiceSearchParams) => void;
  loading: boolean;
}

const INPUT_TYPE_OPTIONS = [
  { value: 'manual', label: '图形化编辑' },
  { value: 'file', label: '文件上传' },
  { value: 'url', label: 'URL获取' },
];

const STATUS_OPTIONS = [
  { value: true, label: '启用' },
  { value: false, label: '禁用' },
];

/**
 * Web服务搜索表单组件
 */
const WebServiceSearchForm: React.FC<WebServiceSearchFormProps> = memo(({ onSearch, loading }) => {
  const [form] = Form.useForm();

  /**
   * 处理搜索
   */
  const handleSearch = () => {
    const values = form.getFieldsValue();
    onSearch({
      ...values,
      pageNum: 1,
      pageSize: 10,
    });
  };

  /**
   * 处理重置
   */
  const handleReset = () => {
    form.resetFields();
    onSearch({
      pageNum: 1,
      pageSize: 10,
    });
  };

  return (
    <Card>
      <Form
        form={form}
        layout="horizontal"
        onFinish={handleSearch}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="name" label="服务名称" className="mb-0">
              <Input placeholder="请输入服务名称" allowClear />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="code" label="服务编码" className="mb-0">
              <Input placeholder="请输入服务编码" allowClear />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="inputType" label="录入方式" className="mb-0">
              <Select placeholder="请选择录入方式" allowClear options={INPUT_TYPE_OPTIONS} />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="category" label="分类" className="mb-0">
              <Select placeholder="请选择分类" allowClear options={WEB_SERVICE_CATEGORIES} />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="status" label="状态" className="mb-0">
              <Select placeholder="请选择状态" allowClear options={STATUS_OPTIONS} />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item className="mb-0">
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                  loading={loading}
                >
                  查询
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
});

WebServiceSearchForm.displayName = 'WebServiceSearchForm';

export default WebServiceSearchForm;

