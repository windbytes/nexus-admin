import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Card, Divider, Space, Button, App, Form } from 'antd';
import {
  SaveOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  AppstoreAddOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import type {
  EndpointTypeListItem,
  SchemaField,
  EndpointTypeSearchParams,
  EndpointTypeConfig,
} from '@/services/integrated/endpointConfig/endpointConfigApi';
import { endpointConfigService } from '@/services/integrated/endpointConfig/endpointConfigApi';
import EndpointTypeList from './components/EndpointTypeList';
import EndpointTypeForm, { type EndpointTypeFormRef } from './components/EndpointTypeForm';
import SchemaFieldsTable, { type SchemaFieldsTableRef } from './components/SchemaFieldsTable';
import PreviewModal from './preview/PreviewModal';

/**
 * 端点配置维护主页面
 */
const EndpointConfig: React.FC = () => {
  const { modal, message } = App.useApp();
  const [basicForm] = Form.useForm();
  const endpointTypeFormRef = useRef<EndpointTypeFormRef>(null);
  const schemaFieldsTableRef = useRef<SchemaFieldsTableRef>(null);

  // 当前选中的端点类型
  const [selectedType, setSelectedType] = useState<EndpointTypeListItem | null>(null);
  // 当前的Schema字段
  const [schemaFields, setSchemaFields] = useState<SchemaField[]>([]);
  // 编辑模式
  const [isEditing, setIsEditing] = useState(false);
  // 搜索关键词
  const [searchKeyword, setSearchKeyword] = useState('');
  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  // 标记是否已初始化（用于首次加载自动选中第一条）
  const [hasInitialized, setHasInitialized] = useState(false);
  // 预览弹窗状态
  const [previewVisible, setPreviewVisible] = useState(false);

  /**
   * 查询端点类型列表
   */
  const { data: listData, isLoading: listLoading, refetch: refetchList } = useQuery({
    queryKey: ['endpoint_config_list', searchKeyword, pagination.current, pagination.pageSize],
    queryFn: () =>
      endpointConfigService.getEndpointTypeList({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        typeName: searchKeyword || undefined,
      } as EndpointTypeSearchParams),
  });

  /**
   * 查询端点类型详情
   * 使用 placeholderData 保持之前的数据，避免切换时闪动
   */
  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['endpoint_config_detail', selectedType?.id],
    queryFn: () => endpointConfigService.getEndpointTypeDetail(selectedType!.id),
    enabled: !!selectedType?.id && !isEditing,
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
    onSuccess: (savedData) => {
      setIsEditing(false);

      // 如果是新增，更新选中的类型
      if (!selectedType?.id && savedData) {
        const newSelectedType: EndpointTypeListItem = {
          id: savedData.id,
          endpointType: savedData.endpointType,
          typeName: savedData.typeName,
          typeCode: savedData.typeCode,
          schemaVersion: savedData.schemaVersion,
          fieldCount: savedData.schemaFields?.length || 0,
          status: savedData.status,
        };

        if (savedData.icon) {
          newSelectedType.icon = savedData.icon;
        }
        if (savedData.description) {
          newSelectedType.description = savedData.description;
        }
        if (savedData.createTime) {
          newSelectedType.createTime = savedData.createTime;
        }
        if (savedData.updateTime) {
          newSelectedType.updateTime = savedData.updateTime;
        }

        setSelectedType(newSelectedType);
      }

      // 刷新列表
      refetchList();

      // 重新查询详情数据以获取后端返回的真实ID
      // 使用 setTimeout 确保在 setIsEditing(false) 之后执行
      // setTimeout(() => {
      //   if (selectedType?.id || savedData?.id) {
      //     refetchDetail();
      //   }
      // }, 100);
    }
  });

  /**
   * 删除端点类型 mutation
   */
  const deleteConfigMutation = useMutation({
    mutationFn: (id: string) => endpointConfigService.deleteEndpointType(id),
    onSuccess: async () => {
      message.success('删除成功！');
      setSelectedType(null);
      setSchemaFields([]);
      basicForm.resetFields();

      // 刷新列表
      const updatedList = await refetchList();

      // 删除后，如果列表还有数据，自动选中第一条
      if (updatedList.data && updatedList.data.records && updatedList.data.records.length > 0) {
        const firstRecord = updatedList.data.records[0];
        if (firstRecord) {
          setSelectedType(firstRecord);
        }
      }
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
    (record: EndpointTypeListItem) => {
      if (isEditing) {
        modal.confirm({
          title: '提示',
          content: '当前正在编辑，切换会丢失未保存的数据，是否继续？',
          onOk: () => {
            setSelectedType(record);
            setIsEditing(false);
          },
        });
      } else {
        setSelectedType(record);
      }
    },
    [isEditing, modal]
  );

  /**
   * 新增端点类型
   */
  const handleAdd = useCallback(() => {
    if (isEditing) {
      message.warning('请先保存或取消当前编辑');
      return;
    }

    setSelectedType(null);
    setSchemaFields([]);
    basicForm.resetFields();
    setIsEditing(true);

    // 聚焦到类型名称输入框
    setTimeout(() => {
      endpointTypeFormRef.current?.focusTypeName();
    }, 200);
  }, [isEditing, basicForm, message]);

  /**
   * 预览
   */
  const handlePreview = useCallback(async () => {
    try {
      // 如果正在编辑模式，先验证表单
      if (isEditing) {
        const basicValues = await basicForm.validateFields();
        
        // 验证是否有字段
        if (schemaFields.length === 0) {
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
          schemaFields: schemaFields,
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

        if (!detailData?.schemaFields || detailData.schemaFields.length === 0) {
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
  }, [isEditing, basicForm, schemaFields, selectedType, detailData, message]);

  /**
   * 开始编辑
   */
  const handleEdit = useCallback(() => {
    if (!selectedType) {
      message.warning('请先选择一个端点类型');
      return;
    }
    setIsEditing(true);

    // 聚焦到类型名称输入框
    setTimeout(() => {
      endpointTypeFormRef.current?.focusTypeName();
    }, 200);
  }, [selectedType, message]);

  /**
   * 保存
   */
  const handleSave = useCallback(async () => {
    try {
      // 1. 验证基础信息表单
      const basicValues = await basicForm.validateFields();

      // 2. 获取最新的 Schema 字段数据（包括正在编辑的行）
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

      // 3. 如果有正在编辑的行，先保存它（更新状态和清除编辑状态）
      if (schemaFieldsTableRef.current?.isEditing()) {
        await schemaFieldsTableRef.current.saveCurrentEdit();
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
  }, [basicForm, selectedType, saveConfigMutation, message]);

  /**
   * 取消编辑
   */
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    // 取消 Schema 表格的编辑状态
    schemaFieldsTableRef.current?.cancelEdit();

    if (selectedType?.id) {
      // 重新加载数据
      basicForm.setFieldsValue(detailData);
      setSchemaFields(detailData?.schemaFields || []);
    } else {
      setSelectedType(null);
      setSchemaFields([]);
      basicForm.resetFields();
    }
  }, [selectedType, detailData, basicForm]);

  /**
   * 删除
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
  }, [selectedType, modal, deleteConfigMutation, message]);

  /**
   * 导出
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
  }, [selectedType, exportSchemaMutation, message]);

  /**
   * 导入
   */
  const handleImport = useCallback(() => {
    message.info('导入功能开发中...');
  }, [message]);

  /**
   * 搜索
   */
  const handleSearch = useCallback((value: string) => {
    setSearchKeyword(value);
    setPagination(prev => ({ ...prev, current: 1 })); // 搜索时重置到第一页
  }, []);

  /**
   * 分页变更
   */
  const handlePaginationChange = useCallback((page: number, pageSize: number) => {
    setPagination({ current: page, pageSize });
  }, []);

  /**
   * Schema字段变更
   */
  const handleSchemaFieldsChange = useCallback((fields: SchemaField[]) => {
    setSchemaFields(fields);
  }, []);

  // 当详情数据加载完成时，更新表单和字段
  // 只在 selectedType.id 变化且不在编辑模式时更新
  React.useEffect(() => {
    if (detailData && !isEditing && selectedType?.id === detailData.id) {
      basicForm.setFieldsValue(detailData);
      setSchemaFields(detailData.schemaFields || []);
    }
  }, [selectedType?.id, detailData, isEditing]);

  // 使用 useMemo 缓存 schemaFields，避免引用变化导致子组件重渲染
  const memoizedSchemaFields = useMemo(() => schemaFields, [schemaFields]);

  /**
   * 首次加载列表数据后，自动选中第一条记录
   */
  React.useEffect(() => {
    // 只在第一次加载且有数据时执行
    if (!hasInitialized && listData && listData.records && listData.records.length > 0 && !selectedType) {
      const firstRecord = listData.records[0];
      if (firstRecord) {
        setSelectedType(firstRecord);
        setHasInitialized(true);
      }
    }
  }, [listData, hasInitialized, selectedType]);

  /**
   * 获取预览配置数据
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
        schemaFields: schemaFields,
        status: formValues.status ?? true,
      } as EndpointTypeConfig;
    } else {
      // 查看模式，使用详情数据
      return detailData || null;
    }
  }, [isEditing, basicForm, selectedType, schemaFields, detailData]);

  return (
    <div className="h-full flex gap-4">
      {/* 左侧：端点类型列表 */}
      <EndpointTypeList
        data={listData?.records || []}
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
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: listData?.total || 0,
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
        loading={detailLoading && !detailData}
      >
        {/* 基础信息 */}
        <EndpointTypeForm
          ref={endpointTypeFormRef}
          form={basicForm}
          {...(detailData && { initialValues: detailData })}
          disabled={!isEditing}
        />

        {/* Schema配置 */}
        <div className="flex-1 flex flex-col min-h-0">
          <Divider orientation="left">
            <AppstoreAddOutlined className="mr-2" />
            Schema字段配置
          </Divider>
          <SchemaFieldsTable
            ref={schemaFieldsTableRef}
            key={selectedType?.id || 'new'}
            fields={memoizedSchemaFields}
            disabled={!isEditing}
            onChange={handleSchemaFieldsChange}
          />
        </div>

        {/* 底部操作按钮 */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-end">
            <Space>
              <Button color='cyan' variant='outlined' icon={<EyeOutlined />} onClick={handlePreview}>
                预览
              </Button>
              {!isEditing ? (
                <>
                  <Button
                    color="orange"
                    variant="outlined"
                    icon={<SaveOutlined />}
                    disabled={!selectedType}
                    onClick={handleEdit}
                  >
                    编辑
                  </Button>
                  <Button
                    icon={<ExportOutlined />}
                    disabled={!selectedType}
                    onClick={handleExport}
                  >
                    导出
                  </Button>
                  <Button icon={<ImportOutlined />} onClick={handleImport}>
                    导入
                  </Button>
                  <Button
                    icon={<DeleteOutlined />}
                    danger
                    disabled={!selectedType}
                    onClick={handleDelete}
                  >
                    删除
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleCancel}>取消</Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={saveConfigMutation.isPending}
                    onClick={handleSave}
                  >
                    保存
                  </Button>
                </>
              )}
            </Space>
          </div>
        </div>
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
