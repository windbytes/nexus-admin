import { useQuery } from '@tanstack/react-query';
import type { Form } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { EndpointTypeConfig } from '@/services/integrated/endpointConfig/endpointConfigApi';
import { endpointConfigService, MODE_OPTIONS } from '@/services/integrated/endpointConfig/endpointConfigApi';
import type { UseEndpointTypeConfigReturn } from '../types';

/**
 * 端点类型配置 Hook
 * 管理端点类型配置相关的状态和逻辑
 */
export const useEndpointTypeConfig = (
  open: boolean,
  endpointTypeName: string | undefined,
  selectedMode: string | undefined,
  form: ReturnType<typeof Form.useForm>[0],
  initialValues?: { endpointType?: string; mode?: string }
): UseEndpointTypeConfigReturn => {
  const [selectedEndpointTypeConfig, setSelectedEndpointTypeConfig] = useState<EndpointTypeConfig | null>(null);
  // 使用 ref 记录上一次的 endpointTypeName，用于判断是否是初始化
  const prevEndpointTypeNameRef = useRef<string | undefined>(undefined);
  // 使用 ref 标记是否是初始化阶段（弹窗刚打开时）
  const isInitializingRef = useRef<boolean>(false);

  /**
   * 获取所有启用的端点类型配置列表
   */
  const { data: endpointTypeListModule, isLoading: typeListLoading } = useQuery({
    queryKey: ['endpoint_type_list_for_modal'],
    queryFn: async () => {
      const result = await endpointConfigService.getEndpointTypeList({
        pageNum: 1,
        pageSize: 1000, // 获取所有启用的类型
        status: true, // 只获取启用的类型
      });
      return result;
    },
    enabled: open, // 只在弹窗打开时查询
  });

  /**
   * 端点类型选项 - 使用 useMemo 缓存
   */
  const endpointTypeOptions = useMemo(() => {
    if (!endpointTypeListModule?.records) {
      return [];
    }
    return endpointTypeListModule.records.map((item) => ({
      value: item.typeName,
      label: item.typeName,
      config: item, // 保存完整配置对象
    }));
  }, [endpointTypeListModule]);

  /**
   * 模式选项 - 根据选择的端点类型的 supportMode 动态生成
   */
  const modeOptions = useMemo(() => {
    if (!selectedEndpointTypeConfig?.supportMode) {
      return [];
    }

    // 从 MODE_OPTIONS 中过滤出 supportMode 支持的选项
    return MODE_OPTIONS.filter((option) => selectedEndpointTypeConfig.supportMode.includes(option.value));
  }, [selectedEndpointTypeConfig]);

  /**
   * 标记初始化阶段
   * 当弹窗打开且有初始值时，标记为初始化阶段
   */
  useEffect(() => {
    if (open && initialValues?.endpointType) {
      isInitializingRef.current = true;
      prevEndpointTypeNameRef.current = undefined;
    } else if (!open) {
      isInitializingRef.current = false;
      prevEndpointTypeNameRef.current = undefined;
    }
  }, [open, initialValues?.endpointType]);

  /**
   * 根据选择的类型名称查找对应的配置
   * 当端点类型改变时，清空 mode 字段（但初始化时不清空）
   */
  useEffect(() => {
    if (!endpointTypeName || !endpointTypeListModule?.records) {
      setSelectedEndpointTypeConfig(null);
      prevEndpointTypeNameRef.current = endpointTypeName;
      return;
    }

    const config = endpointTypeListModule.records.find((item) => item.typeName === endpointTypeName);

    if (config) {
      setSelectedEndpointTypeConfig(config);

      // 判断是否是用户主动改变端点类型（而非初始化）
      // 如果 prevEndpointTypeNameRef.current === undefined，说明是首次设置（初始化），不清空
      // 如果 isInitializingRef.current === true，说明是初始化阶段，不清空
      const isFirstTime = prevEndpointTypeNameRef.current === undefined;
      const isUserChangingType = !isFirstTime && prevEndpointTypeNameRef.current !== endpointTypeName;

      // 只有在用户主动改变端点类型时才清空 mode
      // 初始化时（首次设置或 isInitializingRef 为 true）不清空
      if (isUserChangingType && !isInitializingRef.current) {
        form.setFieldValue('mode', undefined);
      }

      // 初始化完成后，重置标记
      if (isInitializingRef.current) {
        isInitializingRef.current = false;
      }

      prevEndpointTypeNameRef.current = endpointTypeName;
    } else {
      setSelectedEndpointTypeConfig(null);
      prevEndpointTypeNameRef.current = endpointTypeName;
    }
  }, [endpointTypeName, endpointTypeListModule, form]);

  /**
   * 当有 endpointType 时，根据 endpointType 加载对应的配置
   * 支持新增时通过 initialValues 传入 endpointType
   */
  useEffect(() => {
    if (open && initialValues?.endpointType && endpointTypeListModule?.records) {
      const config = endpointTypeListModule.records.find((item) => item.typeName === initialValues.endpointType);
      if (config && !selectedEndpointTypeConfig) {
        setSelectedEndpointTypeConfig(config);
      }
    }
  }, [open, initialValues?.endpointType, endpointTypeListModule, selectedEndpointTypeConfig]);

  /**
   * 获取Schema字段列表（根据选择的 mode 过滤并排序）
   * 性能优化：使用 useMemo 缓存，只有当配置或 mode 改变时才重新计算
   */
  const schemaFields = useMemo(() => {
    if (!selectedEndpointTypeConfig?.schemaFields || !selectedMode) {
      return [];
    }

    // 过滤出包含选择模式的字段
    const filteredFields = selectedEndpointTypeConfig.schemaFields.filter((field) => {
      // 如果字段没有 mode 配置，则默认显示
      if (!field.mode || field.mode.length === 0) {
        return true;
      }
      // 检查字段的 mode 是否包含当前选择的 mode
      return field.mode.includes(selectedMode);
    });

    // 按照 sortOrder 排序
    return filteredFields.sort((a, b) => {
      const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }, [selectedEndpointTypeConfig, selectedMode]);

  return {
    endpointTypeOptions,
    modeOptions,
    selectedEndpointTypeConfig,
    schemaFields,
    typeListLoading,
  };
};
