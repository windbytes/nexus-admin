import { useMutation, useQuery } from '@tanstack/react-query';
import type { FormInstance } from 'antd';
import { App } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import {
  type EndpointTypeConfig,
  type EndpointTypeSearchParams,
  endpointConfigService,
  type SchemaField,
} from '@/services/engine';
import type { SchemaFieldsTableRef } from '../components/SchemaFieldsTable';

type FormErrorLike = {
  errorFields?: Array<{
    name: (string | number)[];
  }>;
};

type UseEndpointConfigPageParams = {
  /** 基础信息表单实例（右上表单） */
  basicForm: FormInstance;
  /** Schema 字段表格暴露的能力引用（右下表格） */
  schemaFieldsTableRef: React.RefObject<SchemaFieldsTableRef | null>;
};

/**
 * 端点类型配置页面的统一状态与行为 Hook。
 *
 * 职责：
 * - 管理列表查询、当前选中项、编辑态、预览态
 * - 封装新增/更新/删除/导出等操作
 * - 统一处理表单校验与错误提示
 * - 产出页面消费的渲染数据与事件处理器
 */
export function useEndpointConfigPage({ basicForm, schemaFieldsTableRef }: UseEndpointConfigPageParams) {
  const { modal, message } = App.useApp();
  const [editingSchemaFields, setEditingSchemaFields] = useState<SchemaField[]>([]);
  const [selectedType, setSelectedType] = useState<EndpointTypeConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previousSelectedType, setPreviousSelectedType] = useState<EndpointTypeConfig | null>(null);
  const [queryParams, setQueryParams] = useState<EndpointTypeSearchParams>({
    pageNum: 1,
    pageSize: 10,
  });

  /** 将后端返回的 schemaFields 安全归一化为 SchemaField[]。 */
  const toSchemaFields = (fields: EndpointTypeConfig['schemaFields'] | undefined): SchemaField[] => {
    return Array.isArray(fields) ? (fields as SchemaField[]) : [];
  };

  /** 从 unknown 错误对象中提取可展示的错误文案。 */
  const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return fallback;
  };

  /** 提取 antd Form 校验错误中的字段列表。 */
  const getFormErrorFields = (error: unknown) => {
    const formError = error as FormErrorLike;
    return formError.errorFields ?? [];
  };

  const {
    data: configListData,
    isFetching: listLoading,
    refetch: refetchList,
  } = useQuery({
    queryKey: ['endpoint_config_list', queryParams],
    queryFn: async () => {
      const configData = await endpointConfigService.getEndpointTypeList(queryParams);
      if (configData?.records?.[0] && !selectedType) {
        setSelectedType(configData.records[0]);
      }
      return configData;
    },
  });

  const saveConfigMutation = useMutation({
    mutationFn: async (data: Partial<EndpointTypeConfig>) => {
      if (selectedType?.id) {
        return endpointConfigService.updateEndpointType(data);
      }
      return endpointConfigService.addEndpointType(data);
    },
    onSuccess: () => {
      setIsEditing(false);
      if (!selectedType?.id) {
        setPreviousSelectedType(null);
        setSelectedType(null);
      } else {
        setPreviousSelectedType(selectedType);
      }
      refetchList();
    },
  });

  const deleteConfigMutation = useMutation({
    mutationFn: (id: string) => endpointConfigService.deleteEndpointType(id),
    onSuccess: async () => {
      setSelectedType(null);
      setPreviousSelectedType(null);
      basicForm.resetFields();
      refetchList();
    },
    onError: (error: unknown) => {
      message.error(`删除失败：${getErrorMessage(error, '未知错误')}`);
    },
  });

  const exportSchemaMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => endpointConfigService.exportSchema(id, name),
    onSuccess: () => {
      message.success('导出成功！');
    },
    onError: (error: unknown) => {
      message.error(`导出失败：${getErrorMessage(error, '未知错误')}`);
    },
  });

  /** 切换左侧选中项；编辑中切换时二次确认，避免丢失未保存数据。 */
  const handleSelectType = (record: EndpointTypeConfig) => {
    if (isEditing) {
      modal.confirm({
        title: '提示',
        content: '当前正在编辑，切换会丢失未保存的数据，是否继续？',
        onOk: () => {
          setSelectedType(record);
          setIsEditing(false);
          setEditingSchemaFields(toSchemaFields(record?.schemaFields));
        },
      });
      return;
    }
    setSelectedType(record);
    setEditingSchemaFields(toSchemaFields(record?.schemaFields));
  };

  /** 进入新增模式，并暂存当前选中项用于取消回滚。 */
  const handleAdd = () => {
    if (isEditing) {
      message.warning('请先保存或取消当前编辑');
      return;
    }
    setPreviousSelectedType(selectedType);
    setSelectedType(null);
    setIsEditing(true);
    setEditingSchemaFields([]);
  };

  /** 预览当前配置；编辑态下先校验表单与 Schema 字段有效性。 */
  const handlePreview = async () => {
    try {
      if (isEditing) {
        const basicValues = await basicForm.validateFields();
        const latestFields = await schemaFieldsTableRef.current?.getCurrentFields();
        if (!latestFields || latestFields.length === 0) {
          message.warning('请至少添加一个Schema字段后再预览');
          return;
        }
        setSelectedType({
          id: selectedType?.id || 'preview',
          endpointType: basicValues.endpointType,
          typeName: basicValues.typeName,
          typeCode: basicValues.typeCode,
          icon: basicValues.icon,
          supportMode: basicValues.supportMode || [],
          description: basicValues.description,
          schemaVersion: basicValues.schemaVersion,
          schemaFields: latestFields,
          status: basicValues.status ?? true,
          supportRetry: basicValues.supportRetry ?? false,
        });
        setPreviewVisible(true);
        return;
      }

      if (!selectedType) {
        message.warning('请先选择或新增一个端点类型');
        return;
      }
      if (!selectedType.schemaFields || selectedType.schemaFields.length === 0) {
        message.warning('当前端点类型暂无字段配置');
        return;
      }
      setPreviewVisible(true);
    } catch (error: unknown) {
      const firstError = getFormErrorFields(error).at(0);
      if (firstError) {
        basicForm.scrollToField(firstError.name, { behavior: 'smooth', block: 'center' });
        basicForm.focusField(firstError.name);
      }
      message.error('请先完善基础信息');
    }
  };

  /** 进入编辑模式。 */
  const handleEdit = () => {
    if (!selectedType) {
      message.warning('请先选择一个端点类型');
      return;
    }
    setIsEditing(true);
  };

  /** 保存当前配置（含基础信息 + Schema 字段）。 */
  const handleSave = async () => {
    try {
      const basicValues = await basicForm.validateFields();
      if (schemaFieldsTableRef.current?.isEditing()) {
        const saveResult = await schemaFieldsTableRef.current.saveCurrentEdit();
        if (!saveResult) {
          message.error('请先完善表格中正在编辑的字段信息');
          return;
        }
      }

      const latestFields = await schemaFieldsTableRef.current?.getCurrentFields();
      if (latestFields === null) {
        message.error('请先完善表格中正在编辑的字段信息');
        return;
      }
      if (!latestFields || latestFields.length === 0) {
        message.error('请至少添加一个Schema字段');
        return;
      }

      saveConfigMutation.mutate({
        ...basicValues,
        id: selectedType?.id,
        schemaFields: latestFields,
      });
    } catch (error: unknown) {
      const firstError = getFormErrorFields(error).at(0);
      if (firstError) {
        basicForm.scrollToField(firstError.name, { behavior: 'smooth', block: 'center' });
        basicForm.focusField(firstError.name);
      }
    }
  };

  /** 取消编辑并恢复到编辑前状态。 */
  const handleCancel = () => {
    setIsEditing(false);
    schemaFieldsTableRef.current?.cancelEdit();

    if (previousSelectedType) {
      setSelectedType(previousSelectedType);
      basicForm.setFieldsValue(previousSelectedType);
      setEditingSchemaFields(toSchemaFields(previousSelectedType.schemaFields));
      setPreviousSelectedType(null);
      return;
    }

    if (selectedType?.id) {
      basicForm.setFieldsValue(selectedType);
      setEditingSchemaFields(toSchemaFields(selectedType.schemaFields));
      return;
    }

    setSelectedType(null);
    basicForm.resetFields();
    setEditingSchemaFields([]);
  };

  /** 删除当前选中配置（包含删除确认）。 */
  const handleDelete = () => {
    if (!selectedType?.id) {
      message.warning('请先选择一个端点类型');
      return;
    }
    modal.confirm({
      title: '确认删除',
      content: `确定要删除端点类型"${selectedType.typeName}"吗？此操作不可恢复。`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => deleteConfigMutation.mutate(selectedType.id),
    });
  };

  /** 导出当前选中配置的 Schema 文件。 */
  const handleExport = () => {
    if (!selectedType?.id) {
      message.warning('请先选择一个端点类型');
      return;
    }
    exportSchemaMutation.mutate({ id: selectedType.id, name: selectedType.typeName });
  };

  /** 导入入口占位（当前仅提示）。 */
  const handleImport = () => {
    message.info('导入功能开发中...');
  };

  /** 列表搜索：按名称筛选并重置到第一页。 */
  const handleSearch = (value: string) => {
    setQueryParams((prev) => ({ ...prev, typeName: value, pageNum: 1 }));
  };

  /** 列表分页参数变更。 */
  const handlePaginationChange = (page: number, pageSize: number) => {
    setQueryParams((prev) => ({ ...prev, pageNum: page, pageSize }));
  };

  /** Schema 字段变更时，同步编辑态数据与选中项中的 schemaFields。 */
  const handleSchemaFieldsChange = (fields: SchemaField[]) => {
    setEditingSchemaFields(fields);
    setSelectedType((prev) => (prev ? { ...prev, schemaFields: fields } : null));
  };

  /** 批量导出入口占位（当前仅提示）。 */
  const handleBatchExport = (selectedIds: string[]) => {
    message.info(`批量导出功能开发中，已选择 ${selectedIds.length} 条记录：${selectedIds.join(', ')}`);
  };

  /** 选中项变化且非编辑态时，回填基础表单与右下字段表格。 */
  useEffect(() => {
    if (selectedType?.id && !isEditing) {
      basicForm.setFieldsValue(selectedType);
      setEditingSchemaFields(toSchemaFields(selectedType.schemaFields));
    }
  }, [selectedType?.id, isEditing, basicForm, selectedType]);

  /** 左侧列表数据（已做空值兜底）。 */
  const listData = configListData?.records || [];
  /** 左侧列表分页配置。 */
  const paginationConfig = useMemo(
    () => ({
      current: queryParams.pageNum || 1,
      pageSize: queryParams.pageSize || 10,
      total: configListData?.totalRow || 0,
      onChange: handlePaginationChange,
    }),
    [queryParams.pageNum, queryParams.pageSize, configListData?.totalRow]
  );

  /** 预览弹窗使用的配置数据；编辑态读取当前表单快照。 */
  const previewConfig = useMemo((): EndpointTypeConfig | null => {
    if (!previewVisible) {
      return null;
    }
    if (!isEditing) {
      return selectedType || null;
    }
    const formValues = basicForm.getFieldsValue();
    return {
      id: selectedType?.id || 'preview',
      endpointType: formValues.endpointType,
      typeName: formValues.typeName,
      typeCode: formValues.typeCode,
      icon: formValues.icon,
      supportMode: formValues.supportMode || [],
      description: formValues.description,
      schemaVersion: formValues.schemaVersion,
      schemaFields: selectedType?.schemaFields || [],
      status: formValues.status ?? true,
    } as EndpointTypeConfig;
  }, [previewVisible, isEditing, selectedType, basicForm]);

  return {
    selectedType,
    isEditing,
    previewVisible,
    listLoading,
    editingSchemaFields,
    savePending: saveConfigMutation.isPending,
    listData,
    paginationConfig,
    previewConfig,
    setPreviewVisible,
    handleSelectType,
    handleAdd,
    handlePreview,
    handleEdit,
    handleSave,
    handleCancel,
    handleDelete,
    handleExport,
    handleImport,
    handleSearch,
    handleSchemaFieldsChange,
    handleBatchExport,
  };
}
