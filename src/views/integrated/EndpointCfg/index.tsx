import React, { useState, useCallback, useRef } from 'react';
import { Card, Divider, Space, Button, App, Form } from 'antd';
import {
  SaveOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  AppstoreAddOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import type {
  EndpointTypeListItem,
  SchemaField,
  EndpointTypeSearchParams,
} from '@/services/integrated/endpointConfig/endpointConfigApi';
import { endpointConfigService } from '@/services/integrated/endpointConfig/endpointConfigApi';
import EndpointTypeList from './components/EndpointTypeList';
import EndpointTypeForm, { type EndpointTypeFormRef } from './components/EndpointTypeForm';
import SchemaFieldsTable from './components/SchemaFieldsTable';

/**
 * 端点配置维护主页面
 */
const EndpointConfig: React.FC = () => {
  const { modal, message } = App.useApp();
  const [basicForm] = Form.useForm();
  const endpointTypeFormRef = useRef<EndpointTypeFormRef>(null);

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
    onSuccess: () => {
      message.success('保存成功！');
      setIsEditing(false);
      refetchList();
    },
    onError: (error: any) => {
      message.error(`保存失败：${error.message}`);
    },
  });

  /**
   * 删除端点类型 mutation
   */
  const deleteConfigMutation = useMutation({
    mutationFn: (id: string) => endpointConfigService.deleteEndpointType(id),
    onSuccess: () => {
      message.success('删除成功！');
      setSelectedType(null);
      setSchemaFields([]);
      basicForm.resetFields();
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
      
      // 2. 验证Schema字段
      if (schemaFields.length === 0) {
        message.error('请至少添加一个Schema字段');
        return;
      }

      // 3. 验证通过，准备数据
      const data = {
        ...basicValues,
        id: selectedType?.id,
        schemaFields,
      };

      // 4. 调用保存方法
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
  }, [basicForm, schemaFields, selectedType, saveConfigMutation, message]);

  /**
   * 取消编辑
   */
  const handleCancel = useCallback(() => {
    setIsEditing(false);
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
  React.useEffect(() => {
    if (detailData && !isEditing) {
      basicForm.setFieldsValue(detailData);
      setSchemaFields(detailData.schemaFields || []);
    }
  }, [detailData, isEditing, basicForm]);

  return (
    <div className="h-full flex gap-4">
      {/* 左侧：端点类型列表 */}
      <div className="w-[420px] flex-shrink-0">
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
      </div>

      {/* 右侧：配置详情 */}
      <Card
        className="flex-1 shrink-0"
        styles={{
          body: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        loading={detailLoading}
      >
        <div className="flex-1 flex flex-col min-h-0">
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
            <div className="flex-1 overflow-hidden">
              <SchemaFieldsTable
                fields={schemaFields}
                disabled={!isEditing}
                onChange={handleSchemaFieldsChange}
              />
            </div>
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-end">
            <Space>
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
    </div>
  );
};

export default EndpointConfig;
