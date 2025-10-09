import type React from 'react';
import { useEffect, useState, memo } from 'react';
import { Form, Input, Select, Switch, Space, Button, App } from 'antd';
import DragModal from '@/components/modal/DragModal';
import type { WebService, WebServiceFormData } from '@/services/resource/webServiceApi';
import { WEB_SERVICE_CATEGORIES } from '@/services/resource/webServiceApi';
import InputTypeSelector, { type InputType } from './InputTypeSelector';
import ManualWsdlEditor from './ManualWsdlEditor';
import FileUploadEditor from './FileUploadEditor';
import UrlFetchEditor from './UrlFetchEditor';

const { TextArea } = Input;

interface WebServiceModalProps {
  open: boolean;
  title: string;
  loading: boolean;
  initialValues?: Partial<WebService> | null;
  isViewMode?: boolean;
  onOk: (values: WebServiceFormData) => void;
  onCancel: () => void;
}

/**
 * Web服务编辑/新增弹窗组件
 */
const WebServiceModal: React.FC<WebServiceModalProps> = memo(
  ({ open, title, loading, initialValues, isViewMode = false, onOk, onCancel }) => {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [inputType, setInputType] = useState<InputType>('manual');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [wsdlContent, setWsdlContent] = useState<string>('');
    const [status, setStatus] = useState<boolean>(true);

    // 初始化表单数据
    useEffect(() => {
      if (open && initialValues) {
        form.setFieldsValue(initialValues);
        setInputType(initialValues.inputType || 'manual');
        setWsdlContent(initialValues.wsdlContent || '');
        setStatus(initialValues.status ?? true);
      } else if (open) {
        form.resetFields();
        setInputType('manual');
        setUploadedFile(null);
        setWsdlContent('');
        setStatus(true);
      }
    }, [open, initialValues, form]);

    /**
     * 处理录入方式变更
     */
    const handleInputTypeChange = (value: InputType) => {
      setInputType(value);
      form.setFieldValue('inputType', value);
      
      // 清空相关字段
      if (value !== 'manual') {
        form.setFieldValue('namespace', undefined);
        form.setFieldValue('serviceAnnotation', undefined);
        form.setFieldValue('operations', undefined);
      }
      if (value !== 'file') {
        setUploadedFile(null);
      }
      if (value !== 'url') {
        form.setFieldValue('wsdlUrl', undefined);
      }
      setWsdlContent('');
    };

    /**
     * 处理文件变更
     */
    const handleFileChange = (file: File | null) => {
      setUploadedFile(file);
    };

    /**
     * 处理WSDL获取成功
     */
    const handleWsdlFetched = (content: string) => {
      setWsdlContent(content);
    };

    /**
     * 确认回调
     */
    const handleOk = async () => {
      try {
        const values = await form.validateFields();

        // 根据录入方式进行额外验证
        if (inputType === 'file' && !uploadedFile && !initialValues?.fileInfo) {
          message.error('请上传WSDL文件！');
          return;
        }

        if (inputType === 'url' && !wsdlContent && !initialValues?.wsdlContent) {
          message.error('请先点击"获取WSDL"按钮获取内容！');
          return;
        }

        const submitData: WebServiceFormData = {
          ...values,
          id: initialValues?.id,
          inputType,
          file: uploadedFile || undefined,
          wsdlContent: wsdlContent || initialValues?.wsdlContent,
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

    /**
     * 取消回调
     */
    const handleCancel = () => {
      form.resetFields();
      setInputType('manual');
      setUploadedFile(null);
      setWsdlContent('');
      setStatus(true);
      onCancel();
    };

    return (
      <DragModal
        centered
        title={title}
        open={open}
        onCancel={handleCancel}
        width={1200}
        styles={{
          body: {
            maxHeight: '80vh',
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
                <Button onClick={handleCancel}>取消</Button>
                <Button type="primary" onClick={handleOk} loading={loading}>
                  确定
                </Button>
              </Space>
            </div>
          ) : (
            <Space>
              <Button onClick={handleCancel}>关闭</Button>
            </Space>
          )
        }
        maskClosable={false}
        destroyOnHidden
      >
        <Form
          form={form}
          disabled={isViewMode}
          labelCol={{ span: 3 }}
          initialValues={{
            status: true,
            inputType: 'manual',
          }}
        >
          {/* 基本信息 */}
          <Form.Item
            name="name"
            label="服务名称"
            rules={[
              { required: true, message: '请输入服务名称' },
              { max: 100, message: '服务名称不能超过100个字符' },
            ]}
          >
            <Input autoComplete="off" placeholder="例如：用户信息服务" />
          </Form.Item>

          <Form.Item
            name="code"
            label="服务编码"
            rules={[
              { required: true, message: '请输入服务编码' },
              {
                pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
                message: '编码只能包含字母、数字和下划线，且必须以字母开头',
              },
            ]}
          >
            <Input autoComplete="off" placeholder="例如：user_info_service" />
          </Form.Item>

          <Form.Item name="category" label="分类">
            <Select placeholder="请选择分类" options={WEB_SERVICE_CATEGORIES} />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <TextArea
              autoComplete="off"
              placeholder="请输入描述信息"
              rows={2}
              maxLength={500}
              showCount
            />
          </Form.Item>

          {/* 录入方式选择 */}
          {!isViewMode && (
            <Form.Item label="录入方式" required>
              <InputTypeSelector value={inputType} onChange={handleInputTypeChange} />
            </Form.Item>
          )}

          {/* 根据录入方式显示不同的编辑器 */}
          {inputType === 'manual' && <ManualWsdlEditor disabled={isViewMode} />}
          {inputType === 'file' && !isViewMode && (
            <Form.Item label="上传文件">
              <FileUploadEditor onFileChange={handleFileChange} disabled={isViewMode} />
            </Form.Item>
          )}
          {inputType === 'file' && isViewMode && initialValues?.fileInfo && (
            <Form.Item label="文件信息">
              <div className="text-sm">
                <div>文件名：{initialValues.fileInfo.fileName}</div>
                <div>
                  文件大小：
                  {(initialValues.fileInfo.fileSize / 1024).toFixed(2)} KB
                </div>
              </div>
            </Form.Item>
          )}
          {inputType === 'url' && (
            <UrlFetchEditor disabled={isViewMode} onWsdlFetched={handleWsdlFetched} />
          )}

          <Form.Item name="remark" label="备注">
            <TextArea
              autoComplete="off"
              placeholder="请输入备注信息"
              rows={2}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </DragModal>
    );
  },
);

WebServiceModal.displayName = 'WebServiceModal';

export default WebServiceModal;

