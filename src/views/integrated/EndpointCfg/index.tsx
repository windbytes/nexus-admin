import React, { useState, useCallback } from 'react';
import { Card, Divider, Space, Button, App, Form } from 'antd';
import {
  SaveOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  SettingOutlined,
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
import EndpointTypeForm from './components/EndpointTypeForm';
import SchemaFieldsTable from './components/SchemaFieldsTable';

/**
 * 端点配置维护主页面
 */
const EndpointConfig: React.FC = () => {
  const { modal, message } = App.useApp();
  const [basicForm] = Form.useForm();

  // 当前选中的端点类型
  const [selectedType, setSelectedType] = useState<EndpointTypeListItem | null>(null);
  // 当前的Schema字段
  const [schemaFields, setSchemaFields] = useState<SchemaField[]>([]);
  // 编辑模式
  const [isEditing, setIsEditing] = useState(false);
  // 搜索关键词
  const [searchKeyword, setSearchKeyword] = useState('');

  /**
   * 查询端点类型列表
   */
  const { data: listData, isLoading: listLoading, refetch: refetchList } = useQuery({
    queryKey: ['endpoint_config_list', searchKeyword],
    queryFn: () =>
      endpointConfigService.getEndpointTypeList({
        pageNum: 1,
        pageSize: 1000,
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
    mutationFn: async () => {
      const basicValues = await basicForm.validateFields();

      // 验证Schema字段
      if (schemaFields.length === 0) {
        throw new Error('请至少添加一个Schema字段');
      }

      const data = {
        ...basicValues,
        id: selectedType?.id,
        schemaFields,
      };

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
  }, [selectedType, message]);

  /**
   * 保存
   */
  const handleSave = useCallback(() => {
    saveConfigMutation.mutate();
  }, [saveConfigMutation]);

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
      <Card 
        className="w-[320px] flex-shrink-0"
        styles={{
          body: {
            padding: '16px',
          },
        }}
      >
        <EndpointTypeList
          data={listData?.records || []}
          loading={listLoading}
          {...(selectedType?.id && { selectedId: selectedType.id })}
          onSelect={handleSelectType}
          onAdd={handleAdd}
          onSearch={handleSearch}
        />
      </Card>

      {/* 右侧：配置详情 */}
      <Card
        className="flex-1"
        styles={{
          body: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        loading={detailLoading}
      >
          {/* 基础信息 */}
          <div>
            <Divider orientation="left">
              <SettingOutlined className="mr-2" />
              基础信息
            </Divider>
            <EndpointTypeForm
              form={basicForm}
              {...(detailData && { initialValues: detailData })}
              disabled={!isEditing}
            />
          </div>

          {/* Schema配置 */}
          <div className="flex-1 flex flex-col mt-4">
            <Divider orientation="left">
              <AppstoreAddOutlined className="mr-2" />
              Schema字段配置
            </Divider>
            <div className="flex-1 overflow-auto">
              <SchemaFieldsTable
                fields={schemaFields}
                disabled={!isEditing}
                onChange={handleSchemaFieldsChange}
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Space className="w-full justify-end">
              {!isEditing ? (
                <>
                  <Button
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
        </Card>
    </div>
  );
};

export default EndpointConfig;
