import { App, Form } from 'antd';
import type { FormInstance } from 'antd/lib';
import { useCallback, useEffect, useState } from 'react';
import type { Endpoint } from '@/services/integrated/endpoint/endpointApi';
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
    } else if (!open) {
      form.resetFields();
      setFormValues({});
    }
  }, [open, initialValues, form]);

  /**
   * 处理确定
   * 接受 schemaFields 参数，避免循环依赖
   */
  const handleOk = useCallback(
    async (schemaFields: Array<{ field: string }> = []) => {
      try {
        const values = await form.validateFields();

        // 获取所有基础字段名（包括 model，对应后端的 mode 字段）
        const baseFieldNames = [
          'name',
          'code',
          'description',
          'endpointType',
          'category',
          'mode',
          'status',
          'tags',
          'remark',
        ];

        // 获取配置字段名（从schemaFields中提取）
        const configFieldNames = schemaFields.map((field) => field.field);

        // 重试策略字段名（这些字段应该放在 config.retryStrategy 中）
        const retryStrategyFieldNames = [
          'maximumRedeliveries',
          'redeliveryDelay',
          'useExponentialBackoff',
          'backOffMultiplier',
          'maximumRedeliveryDelay',
        ];

        // 分离基础字段、配置字段和重试策略字段
        const baseFields: any = {};
        const configFields: any = {};
        const retryStrategyFields: any = {};

        Object.keys(values).forEach((key) => {
          if (baseFieldNames.includes(key)) {
            baseFields[key] = values[key];
          } else if (retryStrategyFieldNames.includes(key)) {
            // 重试策略字段单独收集，并确保数字类型字段是整数
            let value = values[key];
            if (
              ['maximumRedeliveries', 'redeliveryDelay', 'backOffMultiplier', 'maximumRedeliveryDelay'].includes(key) &&
              value !== undefined &&
              value !== null
            ) {
              // 确保是整数类型
              value = typeof value === 'string' ? Number.parseInt(value, 10) : Math.floor(Number(value));
            }
            retryStrategyFields[key] = value;
          } else if (configFieldNames.includes(key)) {
            // 其他配置字段
            configFields[key] = values[key];
          }
        });

        // 构造提交数据
        const submitData = {
          id: initialValues?.id,
          ...baseFields,
          config: {
            ...configFields,
            // 只有当存在重试策略字段时才添加 retryStrategy
            ...(Object.keys(retryStrategyFields).length > 0 && {
              retryStrategy: retryStrategyFields,
            }),
          },
        };

        onOk(submitData);
      } catch (error: any) {
        // 滚动到第一个错误字段
        form.scrollToField(error.errorFields[0].name, {
          behavior: 'smooth',
          block: 'center',
        });
        form.focusField(error.errorFields[0].name);
        message.error(`表单验证失败， 原因：${error.errorFields[0].errors[0]}`);
      }
    },
    [form, initialValues?.id, onOk]
  );

  return {
    formValues,
    handleValuesChange,
    handleOk,
    endpointTypeName,
    selectedMode,
    useExponentialBackoff,
  };
};
