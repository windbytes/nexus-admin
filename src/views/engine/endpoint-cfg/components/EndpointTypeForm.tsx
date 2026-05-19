import type { FormInstance, FormItemProps, InputRef } from 'antd';
import { ConfigProvider, Form, Input, Select, Skeleton, Switch } from 'antd';
import type { Rule } from 'antd/es/form';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import { Suspense, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/shallow';
import { ENDPOINT_TYPE_OPTIONS, type EndpointTypeConfig, MODE_OPTIONS } from '@/services/engine';
import { usePreferencesStore } from '@/stores/store';

type OptionItem = {
  value: string;
  label: string;
};

const { TextArea } = Input;

type BaseFieldSchema = {
  name: string;
  label: string;
  rules?: Rule[];
  tooltip?: FormItemProps['tooltip'];
};

type InputFieldSchema = BaseFieldSchema & {
  kind: 'input';
  placeholder: string;
  withTypeNameRef?: boolean;
};

type SelectFieldSchema = BaseFieldSchema & {
  kind: 'select';
  placeholder: string;
  options: OptionItem[];
  mode?: 'multiple';
  maxTagCount?: 'responsive' | number;
};

type SwitchFieldSchema = BaseFieldSchema & {
  kind: 'switch';
  checkedChildren: string;
  unCheckedChildren: string;
};

type FieldSchema = InputFieldSchema | SelectFieldSchema | SwitchFieldSchema;

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

const modeTooltip = (
  <span>
    • IN、IN_OUT用于暴露入口给其他地方调用 <br /> • OUT、OUT_IN用于调用其他地方的入口
  </span>
);

const formFieldSchemas: FieldSchema[] = [
  {
    kind: 'input',
    name: 'typeName',
    label: '名称',
    placeholder: '请输入类型名称，如：HTTP端点',
    withTypeNameRef: true,
    rules: [{ required: true, message: '请输入类型名称' }],
  },
  {
    kind: 'input',
    name: 'typeCode',
    label: '编码',
    placeholder: '请输入类型编码，如：http',
    rules: [
      { required: true, message: '请输入类型编码' },
      {
        pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
        message: '编码必须以字母开头，只能包含字母、数字和下划线',
      },
    ],
  },
  {
    kind: 'select',
    name: 'endpointType',
    label: '分类',
    placeholder: '请选择端点类型分类',
    options: ENDPOINT_TYPE_OPTIONS as unknown as OptionItem[],
    rules: [{ required: true, message: '请选择端点类型分类' }],
  },
  {
    kind: 'select',
    name: 'supportMode',
    label: '模式',
    tooltip: modeTooltip,
    placeholder: '请选择支持模式',
    options: MODE_OPTIONS as unknown as OptionItem[],
    mode: 'multiple',
    maxTagCount: 'responsive',
    rules: [{ required: true, message: '请选择支持模式' }],
  },
  {
    kind: 'input',
    name: 'icon',
    label: '图标',
    placeholder: '请输入图标类名，如：icon-http',
  },
  {
    kind: 'input',
    name: 'schemaVersion',
    label: '版本',
    placeholder: '请输入版本号，如：1.0.0',
  },
  {
    kind: 'switch',
    name: 'status',
    label: '状态',
    checkedChildren: '启用',
    unCheckedChildren: '禁用',
  },
  {
    kind: 'switch',
    name: 'supportRetry',
    label: '支持重试',
    checkedChildren: '是',
    unCheckedChildren: '否',
  },
];

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
const EndpointTypeForm = ({ form, selectedType, isEditing = false }: EndpointTypeFormProps) => {
  // 类型名称输入框的引用
  const typeNameInputRef = useRef<InputRef>(null);
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
  }, [form, selectedType, isEditing]);

  const renderField = (field: FieldSchema) => {
    const itemProps: FormItemProps = {
      name: field.name,
      label: field.label,
      rules: field.rules,
      tooltip: field.tooltip,
    };

    if (field.kind === 'input') {
      return (
        <Form.Item key={field.name} {...itemProps}>
          <Input ref={field.withTypeNameRef ? typeNameInputRef : undefined} placeholder={field.placeholder} />
        </Form.Item>
      );
    }

    if (field.kind === 'select') {
      return (
        <Form.Item key={field.name} {...itemProps}>
          <Select
            mode={field.mode}
            options={field.options}
            placeholder={field.placeholder}
            maxTagCount={field.maxTagCount}
          />
        </Form.Item>
      );
    }

    return (
      <Form.Item key={field.name} {...itemProps} valuePropName="checked">
        <Switch checkedChildren={field.checkedChildren} unCheckedChildren={field.unCheckedChildren} />
      </Form.Item>
    );
  };

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
            {formFieldSchemas.map(renderField)}
          </div>

          <Form.Item name="description" label="描述" labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}>
            <TextArea placeholder="请输入端点类型描述" rows={2} showCount maxLength={500} />
          </Form.Item>
        </Form>
      </Suspense>
    </ConfigProvider>
  );
};

export default EndpointTypeForm;
