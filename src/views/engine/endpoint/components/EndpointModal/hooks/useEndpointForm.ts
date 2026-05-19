import { App, Form } from 'antd';
import type { FormInstance } from 'antd/lib';
import { useCallback, useEffect, useState } from 'react';
import type { Endpoint } from '@/services/engine/endpoint/types';
import type { UseEndpointFormReturn } from '../types';

/**
 * 端点表单 Hook
 * 管理表单相关的状态和逻辑
 */
export const useEndpointForm = (
  open: boolean,
  initialValues: Partial<Endpoint> | undefined,
  form: FormInstance,
  onOk: (values: any) => void
): UseEndpointFormReturn => {
  const { message } = App.useApp();

  const [formValues, setFormValues] = useState<Record<string, any>>({});

  // 监听端点类型和模式变化
  const endpointTypeName = Form.useWatch('endpointType', form);
  const selectedMode = Form.useWatch('mode', form);
  // 监听是否启用指数退避策略
  const useExponentialBackoff = Form.useWatch(['config', 'retryStrategy', 'useExponentialBackoff'], form);

  /**
   * 监听表单值变化，用于字段显示条件判断
   * 性能优化：使用 useCallback 避免重复创建函数
   */
  const handleValuesChange = useCallback((_changedValues: any, allValues: any) => {
    setFormValues(allValues);
  }, []);

  /**
   * 第一阶段：初始化基础信息和配置信息（不包括重试策略）
   * 这个阶段会触发 endpointType 和 mode 的变化，导致页面重新渲染
   */
  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue(initialValues);
      setFormValues(initialValues);
    } else {
      form.resetFields();
      setFormValues({});
    }
  }, [open, initialValues, form]);

  /**
   * 处理确定
   * 接受 schemaFields 参数，避免循环依赖
   */
  const handleOk = useCallback(async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch (error: any) {
      // 滚动到第一个错误字段
      form.scrollToField(error.errorFields[0].name, {
        behavior: 'smooth',
        block: 'center',
      });
      form.focusField(error.errorFields[0].name);
      message.error(`表单验证失败， 原因：${error.errorFields[0].errors[0]}`);
    }
  }, [form, initialValues?.id, onOk]);

  return {
    formValues,
    handleValuesChange,
    handleOk,
    endpointTypeName,
    selectedMode,
    useExponentialBackoff,
  };
};
