import { Form } from 'antd';
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
   * 初始化表单值
   */
  useEffect(() => {
    if (open && initialValues) {
      // 合并基础信息和配置信息
      const formValuesData = {
        ...initialValues,
        ...(initialValues.config || {}),
      };
      form.setFieldsValue(formValuesData);
      setFormValues(formValuesData);
    } else if (!open) {
      form.resetFields();
      setFormValues({});
    }
  }, [open, initialValues, form]);

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

        // 分离基础字段和配置字段
        const baseFields: any = {};
        const configFields: any = {};

        Object.keys(values).forEach((key) => {
          if (baseFieldNames.includes(key)) {
            baseFields[key] = values[key];
          } else if (configFieldNames.includes(key)) {
            configFields[key] = values[key];
          }
        });

        // 构造提交数据
        const submitData = {
          id: initialValues?.id,
          ...baseFields,
          config: configFields,
        };

        onOk(submitData);
      } catch (error) {
        console.error('表单验证失败:', error);
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
