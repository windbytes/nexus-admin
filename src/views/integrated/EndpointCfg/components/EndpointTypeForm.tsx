import React, { useEffect, useRef, useMemo } from 'react';
import { Form, Input, Switch, Select, ConfigProvider } from 'antd';
import type { FormInstance } from 'antd';
import { MODE_OPTIONS, type EndpointTypeConfig } from '@/services/integrated/endpointConfig/endpointConfigApi';
import { ENDPOINT_TYPE_OPTIONS } from '@/services/integrated/endpoint/endpointApi';

const { TextArea } = Input;

interface EndpointTypeFormProps {
  /** 表单实例 */
  form: FormInstance;
  /** 选中的端点类型 */
  selectedType: EndpointTypeConfig | null;
  /** 是否处于编辑状态 */
  isEditing?: boolean;
}

/**
 * 端点类型基本信息表单组件（右上）
 */
const EndpointTypeForm: React.FC<EndpointTypeFormProps> = React.memo(({
  form,
  selectedType,
  isEditing = false,
}) => {
  console.log('端点类型表单组件渲染', selectedType, isEditing);
  // 类型名称输入框的引用
  const typeNameInputRef = useRef<any>(null);

  /**
   * 响应式 labelCol 配置
   * 1920*1080 (xl/xxl) -> span: 6
   * 其他分辨率动态调整
   */
  const responsiveLabelCol = useMemo(() => ({
    xs: { span: 24 },  // <576px 手机竖屏，标签独占一行
    sm: { span: 8 },   // ≥576px 手机横屏/小平板
    md: { span: 7 },   // ≥768px 平板
    lg: { span: 6 },   // ≥992px 小屏笔记本
    xl: { span: 8 },   // ≥1200px 普通笔记本
    xxl: { span: 6 },  // ≥1600px 1920*1080 及以上
  }), []);

  /**
   * 响应式 wrapperCol 配置
   */
  const responsiveWrapperCol = useMemo(() => ({
    xs: { span: 24 },
    sm: { span: 16 },
    md: { span: 17 },
    lg: { span: 18 },
    xl: { span: 16 },
    xxl: { span: 18 },
  }), []);

  /**
   * 描述字段的响应式 labelCol 配置（整行显示，label 占比更小）
   */
  const descriptionLabelCol = useMemo(() => ({
    xs: { span: 24 },  // 手机竖屏，标签独占一行
    sm: { span: 4 },   // 手机横屏/小平板
    md: { span: 3 },   // 平板
    lg: { span: 2 },   // 小屏笔记本
    xl: { span: 2 },   // 普通笔记本
    xxl: { span: 2 },  // 1920*1080 及以上
  }), []);

  /**
   * 描述字段的响应式 wrapperCol 配置
   */
  const descriptionWrapperCol = useMemo(() => ({
    xs: { span: 24 },
    sm: { span: 20 },
    md: { span: 21 },
    lg: { span: 22 },
    xl: { span: 22 },
    xxl: { span: 22 },
  }), []);

  /**
   * 当处于编辑状态时，聚焦到第一个输入框
   */
  useEffect(() => {
    if (selectedType) {
      form.setFieldsValue(selectedType);
    } else {
      form.resetFields();
    }
    if (isEditing) {
      setTimeout(() => {
        if (typeNameInputRef.current) {
          typeNameInputRef.current.focus();
        }
      }, 100);
    }
  }, [isEditing]);

  // 缓存 ConfigProvider 的 theme 配置
  const configProviderTheme = useMemo(() => ({
    components: {
      Form: {
        itemMarginBottom: 0
      }
    }
  }), []);

  // 缓存 Form 的 initialValues
  const formInitialValues = useMemo(() => ({
    status: true,
    schemaVersion: '1.0.0',
  }), []);

  return (
    <ConfigProvider theme={configProviderTheme}>
      <Form
        form={form}
        className="flex-shrink-0"
        layout="horizontal"
        labelCol={responsiveLabelCol}
        wrapperCol={responsiveWrapperCol}
        disabled={!isEditing}
        initialValues={formInitialValues}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
          marginBottom: '16px'
        }}>
          <Form.Item
            name="typeName"
            label="类型名称"
            rules={[{ required: true, message: '请输入类型名称' }]}
          >
            <Input
              ref={typeNameInputRef}
              placeholder="请输入类型名称，如：HTTP端点"
            />
          </Form.Item>

          <Form.Item
            name="typeCode"
            label="类型编码"
            rules={[
              { required: true, message: '请输入类型编码' },
              {
                pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
                message: '编码必须以字母开头，只能包含字母、数字和下划线',
              },
            ]}
          >
            <Input
              placeholder="请输入类型编码，如：http"
            />
          </Form.Item>

          <Form.Item name="endpointType" label="端点分类" rules={[{ required: true, message: '请选择端点类型分类' }]}>
            <Select placeholder="请选择端点类型分类" options={ENDPOINT_TYPE_OPTIONS as any} />
          </Form.Item>

          <Form.Item name="supportMode" tooltip={<span>• IN、IN_OUT用于暴露入口给其他地方调用 <br/> • OUT、OUT_IN用于调用其他地方的入口</span>} label="支持模式" rules={[{ required: true, message: '请选择支持模式' }]}>
            <Select
              mode="multiple"
              options={MODE_OPTIONS as any}
              placeholder="请选择支持模式"
              maxTagCount="responsive"
            />
          </Form.Item>

          <Form.Item name="icon" label="图标">
            <Input placeholder="请输入图标类名，如：icon-http" />
          </Form.Item>

          <Form.Item name="schemaVersion" label="Schema版本">
            <Input placeholder="请输入版本号，如：1.0.0" />
          </Form.Item>

          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </div>

        <Form.Item
          name="description"
          label="描述"
          labelCol={descriptionLabelCol}
          wrapperCol={descriptionWrapperCol}
        >
          <TextArea
            placeholder="请输入端点类型描述"
            rows={2}
            showCount
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </ConfigProvider>
  );
});

export default EndpointTypeForm;

