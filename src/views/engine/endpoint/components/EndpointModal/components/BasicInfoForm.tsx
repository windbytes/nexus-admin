import type { InputRef } from 'antd';
import { Form, Input, Select } from 'antd';
import type React from 'react';
import { ENDPOINT_CATEGORIES } from '@/services/engine/endpoint/types';
import type { UseEndpointTypeConfigReturn } from '../types';

const { TextArea } = Input;

interface BasicInfoFormProps {
  /** 端点类型配置 */
  endpointTypeConfig: UseEndpointTypeConfigReturn;
  /** 初始值 */
  initialValues?: { id?: string };
  /** 端点类型名称 */
  endpointTypeName: string | undefined;
  /** 名称输入框引用 */
  nameRef: React.RefObject<InputRef | null>;
}

/**
 * 基础信息表单组件
 */
const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  endpointTypeConfig,
  initialValues,
  endpointTypeName,
  nameRef,
}) => {
  return (
    <div className="flex flex-col gap-0">
      <Form.Item name="name" label="端点名称" rules={[{ required: true, message: '请输入端点名称' }]}>
        <Input ref={nameRef} placeholder="请输入端点名称" />
      </Form.Item>
      <Form.Item name="endpointType" label="端点类型" rules={[{ required: true, message: '请选择端点类型' }]}>
        <Select
          placeholder="请选择端点类型"
          disabled={!!initialValues?.id || endpointTypeConfig.typeListLoading}
          loading={endpointTypeConfig.typeListLoading}
          options={endpointTypeConfig.endpointTypeOptions}
          showSearch={{
            filterOption: (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
          }}
        />
      </Form.Item>

      {/* 模式选择 - 一直显示，但只有选择了端点类型后才有选项 */}
      <Form.Item
        name="mode"
        label="端点模式"
        rules={[{ required: true, message: '请选择端点模式' }]}
        tooltip="端点的工作模式：IN（入站）、OUT（出站）、IN_OUT（双向）、OUT_IN（先出后入）"
      >
        <Select
          placeholder={endpointTypeName ? '请选择端点模式' : '请先选择端点类型'}
          options={endpointTypeConfig.modeOptions}
          disabled={!endpointTypeName || endpointTypeConfig.modeOptions.length === 0}
          notFoundContent={endpointTypeName ? '该端点类型暂无可用模式' : '请先选择端点类型'}
        />
      </Form.Item>

      <Form.Item name="category" label="端点分类">
        <Select placeholder="请选择端点分类" options={ENDPOINT_CATEGORIES} />
      </Form.Item>

      <Form.Item name="description" label="端点描述">
        <TextArea placeholder="请输入端点描述" rows={3} />
      </Form.Item>

      <Form.Item name="remark" label="备注">
        <TextArea placeholder="请输入备注信息" rows={4} />
      </Form.Item>
    </div>
  );
};

BasicInfoForm.displayName = 'BasicInfoForm';

export default BasicInfoForm;
