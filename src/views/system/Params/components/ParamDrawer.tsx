import type { SysParam, SysParamFormData } from '@/services/system/params';
import { CATEGORY_OPTIONS, DATA_TYPE_OPTIONS } from '@/services/system/params';
import { Button, Drawer, Form, Input, Select, Space, Switch } from 'antd';
import type React from 'react';
import { useEffect } from 'react';

const { TextArea } = Input;

interface ParamDrawerProps {
  open: boolean;
  title: string;
  loading: boolean;
  initialValues?: Partial<SysParam> | undefined;
  onOk: (values: SysParamFormData) => void;
  onCancel: () => void;
}

/**
 * 系统参数抽屉组件
 */
const ParamDrawer: React.FC<ParamDrawerProps> = ({ open, title, loading, initialValues, onOk, onCancel }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue(initialValues);
    } else if (open) {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      values.categoryName = CATEGORY_OPTIONS.find(option => option.value === values.category)?.label || '';
      values.status = Boolean(values.status);
      values.required = Boolean(values.required);
      onOk(values);
    } catch (error: any) {
      // 表单验证失败
      const firstErrorField = error.errorFields?.[0]?.name;
      if (firstErrorField) {
        form.scrollToField(firstErrorField);
        form.focusField(firstErrorField);
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleDataTypeChange = (value: string) => {
    // 根据数据类型清空相关字段
    if (value === 'number') {
      form.setFieldsValue({ value: '', validatationRule: '' });
    } else if (value === 'boolean') {
      form.setFieldsValue({ value: 'false', validatationRule: '' });
    }
  };

  return (
    <Drawer
      title={title}
      open={open}
      onClose={handleCancel}
      size={700}
      className="param-drawer"
      styles={{
        footer: {
          textAlign: 'right',
        },
      }}
      footer={
        <Space>
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" onClick={handleOk} loading={loading}>
            确定
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 4 }}
        initialValues={{
          category: 'system',
          dataType: 'string',
          required: false,
          status: true,
        }}
      >
        <Form.Item name="category" label="参数分类" rules={[{ required: true, message: '请选择参数分类' }]}>
          <Select placeholder="请选择参数分类" options={CATEGORY_OPTIONS} />
        </Form.Item>

        <Form.Item name="dataType" label="数据类型" rules={[{ required: true, message: '请选择数据类型' }]}>
          <Select placeholder="请选择数据类型" options={DATA_TYPE_OPTIONS} onChange={handleDataTypeChange} />
        </Form.Item>

        <Form.Item
          name="code"
          label="参数标识"
          rules={[
            { required: true, message: '请输入参数标识' },
            { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '参数标识只能包含字母、数字和下划线，且必须以字母开头' },
          ]}
        >
          <Input autoComplete="off" placeholder="请输入参数标识" />
        </Form.Item>

        <Form.Item name="name" label="参数名称" rules={[{ required: true, message: '请输入参数名称' }]}>
          <Input autoComplete="off" placeholder="请输入参数名称" />
        </Form.Item>

        <Form.Item name="description" label="参数描述">
          <TextArea autoComplete="off" placeholder="请输入参数描述" rows={2} maxLength={255} showCount />
        </Form.Item>

        <Form.Item name="defaultValue" label="默认值">
          <Input autoComplete="off" placeholder="请输入默认值" />
        </Form.Item>

        <Form.Item name="value" label="参数值" rules={[{ required: true, message: '请输入参数值' }]}>
          <Input autoComplete="off" placeholder="请输入参数值" />
        </Form.Item>

        <Form.Item name="validatationRule" label="验证规则">
          <TextArea autoComplete="off" placeholder="请输入验证规则" rows={2} maxLength={255} showCount />
        </Form.Item>

        <Form.Item name="relatedParam" label="关联参数">
          <TextArea autoComplete="off" placeholder="请输入关联参数" rows={2} maxLength={255} showCount />
        </Form.Item>

        <Form.Item name="required" label="是否必填" valuePropName="checked">
          <Switch checkedChildren="是" unCheckedChildren="否" />
        </Form.Item>

        <Form.Item name="status" label="状态" valuePropName="checked">
          <Switch checkedChildren="启用" unCheckedChildren="禁用" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default ParamDrawer;
