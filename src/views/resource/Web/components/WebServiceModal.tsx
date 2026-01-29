import { App, Button, Form, Input, type InputRef, Select, Space, Switch } from 'antd';
import type React from 'react';
import { memo, useEffect, useRef, useState } from 'react';
import DragModal from '@/components/modal/DragModal';
import type { WebService, WebServiceFormData } from '@/services/resource/webservice/webServiceApi';
import { WEB_SERVICE_CATEGORIES } from '@/services/resource/webservice/webServiceApi';
import FileUploadEditor from './FileUploadEditor';
import InputTypeSelector from './InputTypeSelector';
import ManualWsdlEditor from './ManualWsdlEditor';
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

    // 使用 Form.useWatch 监听表单字段，替代 useState
    const inputType = Form.useWatch('inputType', form);
    const status = Form.useWatch('status', form);

    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    const nameRef = useRef<InputRef>(null);

    // 初始化表单数据
    useEffect(() => {
      if (open) {
        if (initialValues) {
          form.setFieldsValue(initialValues);
          // 确保 status 有值
          if (initialValues.status === undefined) {
            form.setFieldValue('status', true);
          }
        } else {
          // 新增模式注入默认值
          form.setFieldsValue({
            inputType: 'manual',
            status: true,
            wsdlContent: '',
          });
        }
      }
    }, [open, initialValues]);

    /**
     * 处理表单字段变更
     */
    const handleValuesChange = (changedValues: Record<string, unknown>) => {
      if ('inputType' in changedValues) {
        const value = changedValues['inputType'] as string;

        // 清空相关字段
        if (value !== 'manual') {
          form.setFieldsValue({
            namespace: undefined,
            serviceAnnotation: undefined,
            operations: undefined,
          });
        }
        if (value !== 'file') {
          setUploadedFile(null);
        }
        if (value !== 'url') {
          form.setFieldValue('wsdlUrl', undefined);
        }
        form.setFieldValue('wsdlContent', '');
      }
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
      form.setFieldValue('wsdlContent', content);
    };

    /**
     * 确认回调
     */
    const handleOk = async () => {
      try {
        const values = await form.validateFields();
        const currentWsdlContent = form.getFieldValue('wsdlContent');

        // 根据录入方式进行额外验证
        if (inputType === 'file' && !uploadedFile && !initialValues?.fileInfo) {
          message.error('请上传WSDL文件！');
          return;
        }

        if (inputType === 'url' && !currentWsdlContent && !initialValues?.wsdlContent) {
          message.error('请先点击"获取WSDL"按钮获取内容！');
          return;
        }

        const submitData: WebServiceFormData = {
          ...values,
          id: initialValues?.id,
          inputType, // values 中已有，但明确一下也可，或者...values覆盖
          file: uploadedFile || undefined,
          wsdlContent: currentWsdlContent || initialValues?.wsdlContent, // 优先使用表单中的，其次是初始值
          status: values.status, // 确保从 values 获取
        };

        onOk(submitData);
      } catch (error) {
        // 表单验证失败
        const firstErrorField = (error as { errorFields?: { name: (string | number)[] }[] }).errorFields?.[0]?.name;
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
      onCancel();
    };

    /**
     * 弹窗打开后回调
     */
    const handleAfterOpenChange = (open: boolean) => {
      if (open) {
        nameRef.current?.focus();
      }
    };

    /**
     * 关闭后清理
     */
    const handleAfterClose = () => {
      form.resetFields();
      setUploadedFile(null);
    };

    return (
      <DragModal
        centered
        title={title}
        open={open}
        onCancel={handleCancel}
        width={1200}
        destroyOnHidden={true} // 使用 destroyOnHidden 销毁子元素
        afterClose={handleAfterClose} // 关闭后清理
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
                  onChange={(checked) => form.setFieldValue('status', checked)}
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
        afterOpenChange={handleAfterOpenChange}
      >
        <Form
          form={form}
          disabled={isViewMode}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          onValuesChange={handleValuesChange}
        >
          {/* 隐藏字段 */}
          <Form.Item name="status" hidden valuePropName="checked">
            <Switch />
          </Form.Item>
          {/* wsdlContent 作为表单字段存储 */}
          <Form.Item name="wsdlContent" hidden>
            <Input />
          </Form.Item>

          {/* 基本信息 */}
          <Form.Item
            name="name"
            label="服务名称"
            rules={[
              { required: true, message: '请输入服务名称' },
              { max: 100, message: '服务名称不能超过100个字符' },
            ]}
          >
            <Input autoComplete="off" ref={nameRef} placeholder="例如：用户信息服务" />
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
            <TextArea autoComplete="off" placeholder="请输入描述信息" rows={2} maxLength={500} showCount />
          </Form.Item>

          {/* 录入方式选择 */}
          {!isViewMode && (
            <Form.Item name="inputType" label="录入方式" required>
              <InputTypeSelector />
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
          {inputType === 'url' && <UrlFetchEditor disabled={isViewMode} onWsdlFetched={handleWsdlFetched} />}

          <Form.Item name="remark" label="备注">
            <TextArea autoComplete="off" placeholder="请输入备注信息" rows={2} maxLength={500} showCount />
          </Form.Item>
        </Form>
      </DragModal>
    );
  }
);

WebServiceModal.displayName = 'WebServiceModal';

export default WebServiceModal;
