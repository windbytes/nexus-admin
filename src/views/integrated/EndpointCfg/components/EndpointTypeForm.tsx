import { ENDPOINT_TYPE_OPTIONS } from '@/services/integrated/endpoint/endpointApi';
import { MODE_OPTIONS, type EndpointTypeConfig } from '@/services/integrated/endpointConfig/endpointConfigApi';
import { usePreferencesStore } from '@/stores/store';
import type { FormInstance } from 'antd';
import { ConfigProvider, Form, Input, Select, Skeleton, Switch } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import React, { Suspense, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/shallow';

const { TextArea } = Input;

/**
 * 响应式 labelCol 配置 - 移到组件外部，避免每次渲染都创建新对象
 * 1920*1080 (xl/xxl) -> span: 6
 * 其他分辨率动态调整
 */
const responsiveLabelCol = {
  xs: { span: 24 }, // <576px 手机竖屏，标签独占一行
  sm: { span: 8 }, // ≥576px 手机横屏/小平板
  md: { span: 7 }, // ≥768px 平板
  lg: { span: 6 }, // ≥992px 小屏笔记本
  xl: { span: 8 }, // ≥1200px 普通笔记本
  xxl: { span: 6 }, // ≥1600px 1920*1080 及以上
};

/**
 * 响应式 wrapperCol 配置 - 移到组件外部，避免每次渲染都创建新对象
 */
const responsiveWrapperCol = {
  xs: { span: 24 },
  sm: { span: 16 },
  md: { span: 17 },
  lg: { span: 18 },
  xl: { span: 16 },
  xxl: { span: 18 },
};

/**
 * Form 的 theme 配置 - 移到组件外部
 */
const formTheme = {
  components: {
    Form: {
      itemMarginBottom: 0,
    },
  },
};

/**
 * Form 的初始值配置 - 移到组件外部
 */
const formInitialValues = { status: true, schemaVersion: '1.0.0', supportRetry: false };

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
const EndpointTypeForm: React.FC<EndpointTypeFormProps> = React.memo(({ form, selectedType, isEditing = false }) => {
  // 类型名称输入框的引用
  const typeNameInputRef = useRef<any>(null);
  const { locale } = usePreferencesStore(
    useShallow((state) => ({
      locale: state.preferences.app.locale,
    }))
  );

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

  return (
    <ConfigProvider theme={formTheme} locale={locale === 'zh-CN' ? zhCN : enUS}>
      <Suspense fallback={<Skeleton />}>
        <Form
          form={form}
          className="shrink-0"
          layout="horizontal"
          labelCol={responsiveLabelCol}
          wrapperCol={responsiveWrapperCol}
          disabled={!isEditing}
          initialValues={formInitialValues}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <Form.Item name="typeName" label="名称" rules={[{ required: true, message: '请输入类型名称' }]}>
              <Input ref={typeNameInputRef} placeholder="请输入类型名称，如：HTTP端点" />
            </Form.Item>

            <Form.Item
              name="typeCode"
              label="编码"
              rules={[
                { required: true, message: '请输入类型编码' },
                {
                  pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
                  message: '编码必须以字母开头，只能包含字母、数字和下划线',
                },
              ]}
            >
              <Input placeholder="请输入类型编码，如：http" />
            </Form.Item>

            <Form.Item name="endpointType" label="分类" rules={[{ required: true, message: '请选择端点类型分类' }]}>
              <Select placeholder="请选择端点类型分类" options={ENDPOINT_TYPE_OPTIONS as any} />
            </Form.Item>

            <Form.Item
              name="supportMode"
              tooltip={
                <span>
                  • IN、IN_OUT用于暴露入口给其他地方调用 <br /> • OUT、OUT_IN用于调用其他地方的入口
                </span>
              }
              label="模式"
              rules={[{ required: true, message: '请选择支持模式' }]}
            >
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

            <Form.Item name="schemaVersion" label="版本">
              <Input placeholder="请输入版本号，如：1.0.0" />
            </Form.Item>

            <Form.Item name="status" label="状态" valuePropName="checked">
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>

            <Form.Item name="supportRetry" label="支持重试" valuePropName="checked">
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>
          </div>

          <Form.Item name="description" label="描述" labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}>
            <TextArea placeholder="请输入端点类型描述" rows={2} showCount maxLength={500} />
          </Form.Item>
        </Form>
      </Suspense>
    </ConfigProvider>
  );
});

export default EndpointTypeForm;
