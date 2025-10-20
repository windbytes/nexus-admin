import React, { useState, useCallback, useRef, lazy } from 'react';
import { Card, App, Form } from 'antd';
import { useQuery, useMutation } from '@tanstack/react-query';
import type {
  SchemaField,
  EndpointTypeSearchParams,
  EndpointTypeConfig,
} from '@/services/integrated/endpointConfig/endpointConfigApi';
import { endpointConfigService } from '@/services/integrated/endpointConfig/endpointConfigApi';
import EndpointTypeList from './components/EndpointTypeList';
import EndpointTypeForm from './components/EndpointTypeForm';
import SchemaFieldsTable, { type SchemaFieldsTableRef } from './components/SchemaFieldsTable';
import ActionButtons from './components/ActionButtons';

// 懒加载预览弹窗组件
const PreviewModal = lazy(() => import('./preview/PreviewModal'));

// 性能优化：预加载 PreviewModal
// 在空闲时预加载，避免首次点击预览时的延迟
if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
  requestIdleCallback(() => {
    import('./preview/PreviewModal');
  });
}

/**
 * 端点配置维护主页面
 */
const EndpointConfig: React.FC = () => {
  const { modal, message } = App.useApp();
  const [basicForm] = Form.useForm();
  const schemaFieldsTableRef = useRef<SchemaFieldsTableRef>(null);
  // 右下表格的编辑态字段数据，独立于 selectedType，避免在新增时（selectedType=null）无法保存变更
  const [editingSchemaFields, setEditingSchemaFields] = useState<SchemaField[]>([]);

  // 当前选中的端点类型
  const [selectedType, setSelectedType] = useState<EndpointTypeConfig | null>(null);
  // 编辑模式
  const [isEditing, setIsEditing] = useState(false);
  // 预览弹窗状态
  const [previewVisible, setPreviewVisible] = useState(false);
  // 保存之前选中的数据，用于取消编辑时恢复
  const [previousSelectedType, setPreviousSelectedType] = useState<EndpointTypeConfig | null>(null);
  // 用于标记是否已自动选中第一条记录

  // 查询参数缓存
  const [queryParams, setQueryParams] = useState<EndpointTypeSearchParams>({
    pageNum: 1,
    pageSize: 10,
  });
  // 用于标记是否是第一次加载数据
  const isFirstLoad = useRef(true);

  /**
   * 查询端点类型列表和详情（合并查询）
   */
  const { data: configListData, isLoading: listLoading, refetch: refetchList } = useQuery({
    queryKey: ['endpoint_config_list', queryParams],
    queryFn: () => endpointConfigService.getEndpointTypeList(queryParams),
  });


  /**
   * 保存端点类型配置 mutation
   */
  const saveConfigMutation = useMutation({
    mutationFn: async (data: any) => {
      if (selectedType?.id) {
        return endpointConfigService.updateEndpointType(data);
      }
      return endpointConfigService.addEndpointType(data);
    },
    onSuccess: () => {
      setIsEditing(false);
      // 清除之前保存的数据
      setPreviousSelectedType(null);
      // 刷新列表
      refetchList();
    }
  });

  /**
   * 删除端点类型 mutation
   */
  const deleteConfigMutation = useMutation({
    mutationFn: (id: string) => endpointConfigService.deleteEndpointType(id),
    onSuccess: async () => {
      
      setSelectedType(null);
      setPreviousSelectedType(null); // 清除之前保存的数据
      basicForm.resetFields();

      // 刷新列表
      refetchList();
    },
    onError: (error: any) => {
      message.error(`删除失败：${error.message}`);
    },
  });

  /**
   * 导出Schema mutation
   */
  const exportSchemaMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      endpointConfigService.exportSchema(id, name),
    onSuccess: () => {
      message.success('导出成功！');
    },
    onError: (error: any) => {
      message.error(`导出失败：${error.message}`);
    },
  });

  /**
   * 选择端点类型
   */
  const handleSelectType = useCallback(
    (record: EndpointTypeConfig) => {
      if (isEditing) {
        modal.confirm({
          title: '提示',
          content: '当前正在编辑，切换会丢失未保存的数据，是否继续？',
          onOk: () => {
            setSelectedType(record);
            setIsEditing(false);
            setEditingSchemaFields(record?.schemaFields || []);
          },
        });
      } else {
        setSelectedType(record);
        setEditingSchemaFields(record?.schemaFields || []);
      }
    },
    [isEditing, modal]
  );

  /**
   * 新增端点类型 - 使用 useCallback 避免子组件重渲染
   */
  const handleAdd = useCallback(() => {
    if (isEditing) {
      message.warning('请先保存或取消当前编辑');
      return;
    }

    // 保存当前选中的数据，用于取消时恢复
    setPreviousSelectedType(selectedType);
    setSelectedType(null);
    setIsEditing(true);
    setEditingSchemaFields([]);
  }, [isEditing, selectedType, message]);

  /**
   * 预览 - 使用 useCallback 避免子组件重渲染
   */
  const handlePreview = useCallback(async () => {
    try {
      // 如果正在编辑模式，先验证表单
      if (isEditing) {
        const basicValues = await basicForm.validateFields();
        
        // 获取最新的字段数据
        const latestFields = await schemaFieldsTableRef.current?.getCurrentFields();
        if (!latestFields || latestFields.length === 0) {
          message.warning('请至少添加一个Schema字段后再预览');
          return;
        }

        // 构建预览数据
        const previewConfig: EndpointTypeConfig = {
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
        };

        // 临时将预览配置存储到 selectedType 中
        setSelectedType(previewConfig as any);
        setPreviewVisible(true);
      } else {
        // 查看模式，直接使用当前数据预览
        if (!selectedType) {
          message.warning('请先选择或新增一个端点类型');
          return;
        }

        if (!selectedType?.schemaFields || selectedType.schemaFields.length === 0) {
          message.warning('当前端点类型暂无字段配置');
          return;
        }

        setPreviewVisible(true);
      }
    } catch (error: any) {
      // 验证失败，聚焦到第一个错误字段
      if (error.errorFields && error.errorFields.length > 0) {
        const firstErrorField = error.errorFields[0].name;
        basicForm.scrollToField(firstErrorField, {
          behavior: 'smooth',
          block: 'center',
        });
        basicForm.focusField(error.errorFields[0].name);
      }
      message.error('请先完善基础信息');
    }
  }, [isEditing, selectedType, basicForm, message]);

  /**
   * 开始编辑 - 使用 useCallback 避免子组件重渲染
   */
  const handleEdit = useCallback(() => {
    if (!selectedType) {
      message.warning('请先选择一个端点类型');
      return;
    }
    setIsEditing(true);
  }, [selectedType, message]);

  /**
   * 保存 - 使用 useCallback 避免子组件重渲染
   */
  const handleSave = useCallback(async () => {
    try {
      // 1. 验证基础信息表单
      const basicValues = await basicForm.validateFields();

      // 2. 如果有正在编辑的行，先保存它（更新状态和清除编辑状态）
      if (schemaFieldsTableRef.current?.isEditing()) {
        const saveResult = await schemaFieldsTableRef.current.saveCurrentEdit();
        if (!saveResult) {
          message.error('请先完善表格中正在编辑的字段信息');
          return;
        }
      }

      // 3. 获取最新的 Schema 字段数据（包括正在编辑的行）
      const latestFields = await schemaFieldsTableRef.current?.getCurrentFields();
      
      if (latestFields === null) {
        // 验证失败
        message.error('请先完善表格中正在编辑的字段信息');
        return;
      }

      if (!latestFields || latestFields.length === 0) {
        message.error('请至少添加一个Schema字段');
        return;
      }

      // 4. 验证通过，准备数据（使用最新获取的字段数据）
      const data = {
        ...basicValues,
        id: selectedType?.id,
        schemaFields: latestFields,
      };

      // 5. 调用保存方法
      saveConfigMutation.mutate(data);
    } catch (error: any) {
      // 验证失败，聚焦到第一个错误字段
      if (error.errorFields && error.errorFields.length > 0) {
        const firstErrorField = error.errorFields[0].name;
        basicForm.scrollToField(firstErrorField, {
          behavior: 'smooth',
          block: 'center',
        });
        basicForm.focusField(error.errorFields[0].name);
      }
    }
  }, [selectedType, schemaFieldsTableRef, basicForm, saveConfigMutation, message]);

  /**
   * 取消编辑 - 使用 useCallback 避免子组件重渲染
   */
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    // 取消 Schema 表格的编辑状态
    schemaFieldsTableRef.current?.cancelEdit();

    if (previousSelectedType) {
      // 如果有之前选中的数据，恢复到之前的状态
      setSelectedType(previousSelectedType);
      basicForm.setFieldsValue(previousSelectedType);
      setEditingSchemaFields(previousSelectedType.schemaFields || []);
      setPreviousSelectedType(null); // 清除保存的之前数据
    } else if (selectedType?.id) {
      // 如果当前有选中的数据，重新加载数据
      basicForm.setFieldsValue(selectedType);
      setEditingSchemaFields(selectedType.schemaFields || []);
    } else {
      // 如果都没有，清空表单
      setSelectedType(null);
      basicForm.resetFields();
      setEditingSchemaFields([]);
    }
  }, [selectedType, previousSelectedType, basicForm]);

  /**
   * 删除 - 使用 useCallback 避免子组件重渲染
   */
  const handleDelete = useCallback(() => {
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
      onOk: () => {
        deleteConfigMutation.mutate(selectedType.id);
      },
    });
  }, [selectedType, message, modal, deleteConfigMutation]);

  /**
   * 导出 - 使用 useCallback 避免子组件重渲染
   */
  const handleExport = useCallback(() => {
    if (!selectedType?.id) {
      message.warning('请先选择一个端点类型');
      return;
    }

    exportSchemaMutation.mutate({
      id: selectedType.id,
      name: selectedType.typeName,
    });
  }, [selectedType, message, exportSchemaMutation]);

  /**
   * 导入 - 使用 useCallback 避免子组件重渲染
   */
  const handleImport = useCallback(() => {
    message.info('导入功能开发中...');
  }, [message]);

  /**
   * 搜索 - 使用 useCallback 避免子组件重渲染
   */
  const handleSearch = useCallback((value: string) => {
    setQueryParams({
      ...queryParams,
      typeName: value,
      pageNum: 1,
    });
  }, []);

  /**
   * 分页变更 - 使用 useCallback 避免子组件重渲染
   */
  const handlePaginationChange = useCallback((page: number, pageSize: number) => {
    setQueryParams({
      ...queryParams,
      pageNum: page,
      pageSize: pageSize,
    });
  }, []);

  /**
   * Schema字段变更 - 直接更新 selectedType 中的 schemaFields
   */
  const handleSchemaFieldsChange = useCallback((fields: SchemaField[]) => {
    // 始终更新本地编辑态字段，确保在新增（selectedType=null）时也能保留配置
    setEditingSchemaFields(fields);
    // 如果当前有选中项，也同步其 schemaFields（便于预览模式下直接使用）
    if (selectedType) {
      setSelectedType({ ...selectedType, schemaFields: fields });
    }
  }, [selectedType]);


  // 当详情数据加载完成时，更新表单
  // 只在 selectedType.id 变化且不在编辑模式时更新
  React.useEffect(() => {
    if (selectedType && !isEditing && selectedType?.id === selectedType.id) {
      basicForm.setFieldsValue(selectedType);
      setEditingSchemaFields(selectedType.schemaFields || []);
    }
  }, [selectedType?.id, selectedType, isEditing, basicForm]);



  /**
   * 首次加载列表数据后，自动选中第一条记录
   */
  React.useEffect(() => {
    // 只在第一次加载且有数据时执行
    if (configListData?.records?.[0] && !selectedType && isFirstLoad.current) {
      isFirstLoad.current = false;
      setSelectedType(configListData.records[0]);
    }
  }, [configListData, selectedType]);

  /**
   * 获取预览配置数据 - 使用 useCallback 优化
   */
  const getPreviewConfig = useCallback((): EndpointTypeConfig | null => {
    if (isEditing) {
      // 编辑模式，使用当前表单数据
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
    } else {
      // 查看模式，使用详情数据
      return selectedType || null;
    }
  }, [isEditing, selectedType, basicForm]);

  return (
    <div className="h-full flex gap-4">
      {/* 左侧：端点类型列表 */}
      <EndpointTypeList
        data={configListData?.records || []}
        loading={listLoading}
        {...(selectedType?.id && { selectedId: selectedType.id })}
        onSelect={handleSelectType}
        onAdd={handleAdd}
        onSearch={handleSearch}
        onBatchExport={(selectedIds) => {
          message.info(`批量导出功能开发中，已选择 ${selectedIds.length} 条记录：${selectedIds.join(', ')}`);
        }}
        onImport={handleImport}
        pagination={{
          current: queryParams.pageNum || 1,
          pageSize: queryParams.pageSize || 10,
          total: configListData?.total || 0,
          onChange: handlePaginationChange,
        }}
      />

      {/* 右侧：配置详情 */}
      <Card
        className="flex-1 min-w-0"
        styles={{
          body: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        loading={listLoading}
      >
        {/* 基础信息 */}
        <EndpointTypeForm
          form={basicForm}
          selectedType={selectedType}
          isEditing={isEditing}
        />

        {/* Schema配置 */}
        <SchemaFieldsTable
          ref={schemaFieldsTableRef}
          fields={editingSchemaFields}
          disabled={!isEditing}
          onChange={handleSchemaFieldsChange}
        />

        {/* 底部操作按钮 */}
        <ActionButtons
          isEditing={isEditing}
          hasSelected={!!selectedType}
          saveLoading={saveConfigMutation.isPending}
          onPreview={handlePreview}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={handleDelete}
          onExport={handleExport}
          onImport={handleImport}
        />
      </Card>

      {/* 预览弹窗 */}
      <PreviewModal
        visible={previewVisible}
        config={getPreviewConfig()}
        onClose={() => setPreviewVisible(false)}
      />
    </div>
  );
};

export default EndpointConfig;
