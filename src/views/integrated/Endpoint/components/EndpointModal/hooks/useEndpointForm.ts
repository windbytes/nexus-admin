import { App, Form } from 'antd';
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
  onOk: (values: any) => void
): UseEndpointFormReturn => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  // 监听端点类型和模式变化
  const endpointTypeName = Form.useWatch('endpointType', form);
  const selectedMode = Form.useWatch('mode', form);
  // 监听是否启用指数退避策略
  const useExponentialBackoff = Form.useWatch('useExponentialBackoff', form);

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
      const config = initialValues.config || {};

      // 第一阶段：只设置基础信息和配置信息（不包括 retryStrategy）
      const formValuesData = {
        ...initialValues,
        ...config,
      };

      // 移除 config 对象，因为已经展平了
      delete formValuesData.config;

      form.setFieldsValue(formValuesData);
      setFormValues(formValuesData);
    } else if (!open) {
      form.resetFields();
      setFormValues({});
    }
  }, [open, initialValues, form]);

  /**
   * 第二阶段：在 endpointType 和 mode 设置完成后，设置重试策略
   * 这个阶段确保 RetryStrategyForm 已经渲染（虽然可能是隐藏的）
   */
  useEffect(() => {
    if (open && initialValues && endpointTypeName && selectedMode) {
      const config = initialValues.config || {};
      let retryStrategy = config['retryStrategy'] || {};

      // 如果 retryStrategy 是字符串，尝试解析为对象
      if (typeof retryStrategy === 'string') {
        try {
          retryStrategy = JSON.parse(retryStrategy);
        } catch (e) {
          console.warn('解析 retryStrategy JSON 失败:', e);
          retryStrategy = {};
        }
      }

      // 将 retryStrategy 中的字段展平并转换类型
      if (retryStrategy && typeof retryStrategy === 'object' && Object.keys(retryStrategy).length > 0) {
        const retryStrategyValues: Record<string, any> = {
          // 设置默认值（如果后端没有返回某些字段）
          useExponentialBackoff: false,
        };

        Object.keys(retryStrategy).forEach((key) => {
          if (retryStrategy[key] !== undefined && retryStrategy[key] !== null) {
            let value = retryStrategy[key];
            // 对于数字字段，将字符串转换为数字类型（适配后端可能返回字符串的情况）
            if (
              ['maximumRedeliveries', 'redeliveryDelay', 'backOffMultiplier', 'maximumRedeliveryDelay'].includes(key) &&
              typeof value === 'string'
            ) {
              value = Number(value);
            }
            retryStrategyValues[key] = value;
          }
        });

        form.setFieldsValue(retryStrategyValues);

        // 更新 formValues 状态
        setFormValues((prev) => ({ ...prev, ...retryStrategyValues }));
      }
    }
  }, [open, initialValues, endpointTypeName, selectedMode, form]);

  /**
   * 处理确定 - 优化：使用 useCallback 缓存
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
        message.error(`表单验证失败， 原因：${error.errorFields[0].errors[0]}`);
      }
    },
    [form, initialValues?.id, onOk]
  );

  return {
    form,
    formValues,
    handleValuesChange,
    handleOk,
    endpointTypeName,
    selectedMode,
    useExponentialBackoff,
  };
};
