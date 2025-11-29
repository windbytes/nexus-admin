import type { CodeEditorRef } from '@/components/CodeEditor';
import { CodeEditor } from '@/components/CodeEditor';
import DragModal from '@/components/modal/DragModal';
import type {
  DataModeFormData,
  JsonDataMode,
} from '@/services/resource/datamode/dataModeApi';
import { DATA_MODE_CATEGORIES, dataModeService } from '@/services/resource/datamode/dataModeApi';
import { InboxOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { App, Button, Form, Input, Select, Space, Switch, Upload, type InputRef } from 'antd';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import DataSourceSelector, { type DataSourceType } from './DataSourceSelector';

const { TextArea } = Input;
const { Dragger } = Upload;

interface DataModeModalProps {
  open: boolean;
  title: string;
  loading: boolean;
  initialValues?: Partial<JsonDataMode> | null;
  isViewMode?: boolean;
  onOk: (values: DataModeFormData) => void;
  onCancel: () => void;
}

/**
 * 将 JSON 对象或字符串转换为 JSON 字符串
 * @param value - 可能是对象、字符串或 null
 * @returns JSON 字符串，如果为 null 则返回空字符串
 */
const convertToJsonString = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value, null, 2);
}

/**
 * 数据模式编辑/新增弹窗组件
 */
const DataModeModal: React.FC<DataModeModalProps> = ({ open, title, loading, initialValues, isViewMode = false, onOk, onCancel }) => {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [dataSource, setDataSource] = useState<DataSourceType>();
    const [jsonText, setJsonText] = useState<string>('');
    const [schemaText, setSchemaText] = useState<string>('');
    const [status, setStatus] = useState<boolean>(initialValues?.status || true);
    
    const jsonEditorRef = useRef<CodeEditorRef>(null);
    const schemaEditorRef = useRef<CodeEditorRef>(null);
    const focusFieldRef = useRef<InputRef>(null);

    const navigate = useNavigate();

    // 使用 useQuery 加载端点列表
    const {
      data: endpoints,
      isLoading: loadingEndpoints,
    } = useQuery({
      queryKey: ['endpoints', { endpointType: 'database', status: true }],
      queryFn: () => dataModeService.getEndpoints({ endpointType: 'database', status: true }),
      enabled: open === true && dataSource === 'database', // 仅在弹窗打开且选择数据库来源时查询
    });

    // 从端点查询JSON并生成Schema的 mutation
    const queryFromEndpointMutation = useMutation({
      mutationFn: async (endpointId: string) => {
        // 查询JSON数据
        const jsonResult = await dataModeService.queryJsonFromEndpoint({ endpointId });
        const jsonStr = jsonResult.json || JSON.stringify(jsonResult.data, null, 2);
        
        // 生成Schema
        const schemaResult = await dataModeService.generateSchemaFromJson({ json: jsonStr });
        
        return { jsonStr, schema: schemaResult.schema };
      },
      onSuccess: ({ jsonStr, schema }) => {
        setJsonText(jsonStr);
        setSchemaText(schema);
      },
      onError: (error: any) => {
        message.error(`生成Schema失败：${error.message}`);
      },
    });

    // 从JSON文本生成Schema的 mutation
    const generateFromJsonMutation = useMutation({
      mutationFn: async (json: string) => {
        const schemaResult = await dataModeService.generateSchemaFromJson({ json });
        return schemaResult.schema;
      },
      onSuccess: (schema) => {
        setSchemaText(schema);
      },
      onError: (error: any) => {
        message.error(`生成Schema失败：${error.message}`);
      },
    });

    // 导入文件的 mutation
    const importFileMutation = useMutation({
      mutationFn: async (file: File) => {
        const result = await dataModeService.importSchema(file);
        return result.schema;
      },
      onSuccess: (schema) => {
        setSchemaText(schema);
      },
      onError: (error: any) => {
        message.error(`文件上传失败：${error.message}`);
      },
    });

    // 初始化表单数据和 state
    useEffect(() => {
      if (!open) return;
      if (initialValues) {
        form.setFieldsValue(initialValues);
        // 同步 state 值
        setDataSource(initialValues.dataSource || 'database');
        setJsonText(convertToJsonString(initialValues.sourceJson));
        setSchemaText(convertToJsonString(initialValues.schemaJson));
        setStatus(initialValues.status ?? true);
      } else {
        form.resetFields();
        // 重置 state 值
        setDataSource('database');
        setJsonText('');
        setSchemaText('');
        setStatus(true);
      }
      focusFieldRef.current?.focus();
    }, [open, initialValues, form]);

    /**
     * 处理数据来源变更
     */
    const handleDataSourceChange = useCallback((value: DataSourceType) => {
      setDataSource(value);
      form.setFieldValue('dataSource', value);
      
      // 清空相关字段
      if (value !== 'database') {
        form.resetFields(['endpointId']);
      }
      setJsonText('');
      setSchemaText('');
    }, [form]);

    /**
     * 从端点查询JSON并生成Schema
     */
    const handleGenerateFromEndpoint = useCallback(() => {
      const endpointId = form.getFieldValue('endpointId');
      if (!endpointId) {
        message.warning('请先选择端点！');
        return;
      }

      queryFromEndpointMutation.mutate(endpointId);
    }, [form, message, queryFromEndpointMutation]);

    /**
     * 从JSON文本生成Schema
     */
    const handleGenerateFromJson = useCallback(() => {
      const currentJsonText = jsonEditorRef.current?.getValue() || jsonText;
      
      if (!currentJsonText.trim()) {
        message.warning('请先输入JSON文本！');
        return;
      }

      // 验证JSON格式
      try {
        JSON.parse(currentJsonText);
      } catch (e) {
        message.error('JSON格式不正确，请检查！');
        return;
      }

      generateFromJsonMutation.mutate(currentJsonText);
    }, [jsonText, message, generateFromJsonMutation]);

    /**
     * 处理文件上传
     */
    const handleFileUpload = useCallback((file: File): boolean => {
      // 验证文件类型
      if (!file.name.endsWith('.json')) {
        message.error('只支持 JSON 格式的文件！');
        return false;
      }

      // 验证文件大小
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        message.error('文件大小不能超过 10MB！');
        return false;
      }

      importFileMutation.mutate(file);

      return false; // 阻止自动上传
    }, [message, importFileMutation]);

    /**
     * 确认回调
     */
    const handleOk = async () => {
      try {
        const values = await form.validateFields();
        
        // 获取最新的Schema文本
        const currentSchemaText = schemaEditorRef.current?.getValue() || schemaText;
        
        if (!currentSchemaText.trim()) {
          message.error('请先生成或输入JSON Schema！');
          return;
        }

        // 验证Schema格式
        try {
          JSON.parse(currentSchemaText);
        } catch (e) {
          message.error('Schema格式不正确，请检查！');
          return;
        }

        const submitData: DataModeFormData = {
          ...values,
          id: initialValues?.id,
          dataSource,
          schemaJson: currentSchemaText,
          sourceJson: dataSource === 'json' ? (jsonEditorRef.current?.getValue() || jsonText) : undefined,
          status: status,
        };

        onOk(submitData);
      } catch (error: any) {
        // 表单验证失败
        const firstErrorField = error.errorFields?.[0]?.name;
        if (firstErrorField) {
          form.scrollToField(firstErrorField);
          form.focusField(firstErrorField);
        }
      }
    };

    return (
      <DragModal
        centered
        title={title}
        open={open}
        onCancel={onCancel}
        width={1000}
        styles={{
          body: {
            maxHeight: '70vh',
            overflowY: 'auto',
            paddingRight: '8px',
          },
        }}
        footer={
          !isViewMode ? (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">状态：</span>
                <Switch 
                  checked={status}
                  onChange={(checked) => setStatus(checked)}
                  checkedChildren="启用" 
                  unCheckedChildren="禁用" 
                />
              </div>
              <Space>
                <Button onClick={onCancel}>取消</Button>
                <Button type="primary" onClick={handleOk} loading={loading}>
                  确定
                </Button>
              </Space>
            </div>
          ) : (
            <Space>
              <Button onClick={onCancel}>关闭</Button>
            </Space>
          )
        }
        maskClosable={false}
      >
        <Form
          form={form}
          disabled={isViewMode}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          initialValues={{
            status: true,
            dataSource: 'database',
            schemaVersion: 'v1.0',
          }}
        >
          {/* 基本信息 */}
          <Form.Item
            name="name"
            label="名称"
            rules={[
              { required: true, message: '请输入模式名称' },
              { max: 100, message: '模式名称不能超过100个字符' },
            ]}
          >
            <Input autoComplete="off" ref={focusFieldRef} placeholder="例如：用户信息Schema" />
          </Form.Item>

          <Form.Item
            name="code"
            label="编码"
            rules={[
              { required: true, message: '请输入模式编码' },
              {
                pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
                message: '编码只能包含字母、数字和下划线，且必须以字母开头',
              },
            ]}
          >
            <Input autoComplete="off" placeholder="例如：user_info_schema" />
          </Form.Item>

          <Form.Item name="category" label="分类">
            <Select placeholder="请选择分类" options={DATA_MODE_CATEGORIES} />
          </Form.Item>

          <Form.Item name="schemaVersion" label="Schema版本">
            <Input autoComplete="off" placeholder="例如：v1.0" />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <TextArea autoComplete="off" placeholder="请输入描述信息" rows={2} maxLength={500} showCount />
          </Form.Item>

          {/* 数据来源选择 */}
          {!isViewMode && (
            <>
              <Form.Item label="数据来源" required>
                <DataSourceSelector value={dataSource} onChange={handleDataSourceChange} />
              </Form.Item>

              {/* 数据库查询 */}
              {dataSource === 'database' && (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Form.Item
                      name="endpointId"
                      label="选择端点"
                      className="flex-1 mb-0"
                      rules={[{ required: true, message: '请选择端点' }]}
                    >
                      <div>
                        <Select
                          placeholder="请选择端点"
                          style={{ width: 'calc(100% - 118px)' }}
                          loading={loadingEndpoints}
                          options={endpoints?.records?.map((ep) => ({
                            value: ep.id,
                            label: ep.name,
                          }))}
                          showSearch
                          filterOption={(input, option) =>
                            (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          onChange={(_value, option) => {
                            const label = Array.isArray(option) ? option[0]?.label : option?.label;
                            form.setFieldValue('endpointName', label || '');
                          }}
                          notFoundContent={
                            <div>
                              暂无可用端点
                              <Button type="link" onClick={() => {
                                navigate({ 
                                  to: '/integrated/endpoint',
                                  state: { type: 'database', action: 'create' },
                                });
                              }}>
                                去创建
                              </Button>
                            </div>
                          }
                        />
                        <Button
                          type="primary"
                          onClick={handleGenerateFromEndpoint}
                          loading={queryFromEndpointMutation.isPending}
                          className="self-end mb-6 ml-4"
                      >
                        查询并生成
                      </Button>
                      </div>
                    </Form.Item>
                    
                  </div>
                </div>
              )}

              {/* JSON文本 */}
              {dataSource === 'json' && (
                <>
                  <Form.Item label="JSON文本" required>
                    <div className='rounded-lg flex flex-col'>
                      <CodeEditor
                        ref={jsonEditorRef}
                        value={jsonText}
                        language="json"
                        height="200px"
                        showMinimap={false}
                        onChange={(value) => setJsonText(value || '')}
                      />
                      <Button
                      type="primary"
                      onClick={handleGenerateFromJson}
                      loading={generateFromJsonMutation.isPending}
                      className='mt-2'
                    >
                      生成Schema
                    </Button>
                    </div>
                  </Form.Item>
                </>
              )}

              {/* 文件上传 */}
              {dataSource === 'file' && (
                <Form.Item label="上传JSON文件">
                  <Dragger
                    beforeUpload={handleFileUpload}
                    accept=".json"
                    maxCount={1}
                    showUploadList={false}
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖拽JSON文件到此区域</p>
                    <p className="ant-upload-hint">
                      支持 .json 格式文件，最大10MB
                    </p>
                  </Dragger>
                </Form.Item>
              )}
            </>
          )}

          {/* JSON Schema编辑器 */}
          <Form.Item label="JSON Schema" required>
            <div style={{ borderRadius: '8px' }}>
              <CodeEditor
                ref={schemaEditorRef}
                value={schemaText}
                language="json"
                height="400px"
                showMinimap={false}
                readOnly
              />
            </div>
          </Form.Item>

          <Form.Item name="remark" label="备注">
            <TextArea autoComplete="off" placeholder="请输入备注信息" rows={2} maxLength={500} showCount />
          </Form.Item>
        </Form>
      </DragModal>
    );
  };

DataModeModal.displayName = 'DataModeModal';

export default DataModeModal;

