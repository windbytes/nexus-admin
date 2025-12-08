import { Button, Form, Input, type InputRef, Select, Space, Switch } from 'antd';
import type React from 'react';
import { memo, useEffect, useRef } from 'react';
import ChunkedUpload, { type ChunkedUploadRef } from '@/components/FileUpload/ChunkedUpload';
import DragModal from '@/components/modal/DragModal';
import type { DatabaseDriver, DriverFormData } from '@/services/resource/database/driverApi';
import { DATABASE_TYPE_OPTIONS } from './DriverSearchForm';

const { TextArea } = Input;

interface DriverModalProps {
  open: boolean;
  title: string;
  loading: boolean;
  initialValues?: Partial<DatabaseDriver> | null;
  onOk: (values: DriverFormData) => void;
  onCancel: () => void;
}

/**
 * 驱动编辑/新增弹窗组件
 */
const DriverModal: React.FC<DriverModalProps> = memo(({ open, title, loading, initialValues, onOk, onCancel }) => {
  const [form] = Form.useForm();
  const chunkedUploadRef = useRef<ChunkedUploadRef>(null);
  const sourceNameRef = useRef<InputRef>(null);

  // 监听文件名用于显示
  const fileName = Form.useWatch('fileName', form);

  // 初始化表单数据
  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        status: initialValues.status ?? true,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: true,
        databaseType: 'MySQL',
      });
    }
  }, [open, initialValues, form]);

  /**
   * 确认回调
   */
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // 如果是新增，必须上传文件
      const currentFilePath = form.getFieldValue('filePath');
      if (!initialValues?.id && !currentFilePath) {
        form.setFields([
          {
            name: 'file',
            errors: ['请上传驱动文件'],
          },
        ]);
        return;
      }

      const submitData: DriverFormData = {
        ...values,
        id: initialValues?.id,
        status: Boolean(values.status),
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
  const handleCancel = async () => {
    const currentFilePath = form.getFieldValue('filePath');

    // 如果已上传文件但未提交，或者编辑时上传了新文件，需要清理
    // 只有当当前路径存在，且（没有初始ID 或者 当前路径不等于初始路径）时才清理
    const shouldCleanup = currentFilePath && (!initialValues?.id || currentFilePath !== initialValues.filePath);

    if (shouldCleanup) {
      try {
        if (chunkedUploadRef.current) {
          // 如果没有ID（新增），取消上传
          // 如果有ID（编辑），清理新上传的文件
          if (!initialValues?.id) {
            await chunkedUploadRef.current.cancelUpload();
          } else {
            await chunkedUploadRef.current.cleanupUploadedFile();
          }
        }
      } catch (error) {
        console.error('清理上传文件失败:', error);
      }
    }

    onCancel();
  };

  /**
   * 文件上传成功回调
   */
  const handleUploadSuccess = (path: string, name: string, size: number) => {
    form.setFieldsValue({
      filePath: path,
      fileName: name,
      fileSize: size,
    });
    // 清除文件上传错误
    form.setFields([
      {
        name: 'file',
        errors: [],
      },
    ]);
  };

  /**
   * 文件上传失败回调
   */
  const handleUploadError = (error: Error) => {
    console.error('文件上传失败:', error);
    form.setFields([
      {
        name: 'file',
        errors: [`文件上传失败: ${error.message}`],
      },
    ]);
  };

  const handleAfterOpenChange = (open: boolean) => {
    if (open) {
      sourceNameRef.current?.focus();
    }
  };

  const handleAfterClose = () => {
    form.resetFields();
  };

  return (
    <DragModal
      centered
      title={title}
      open={open}
      onCancel={handleCancel}
      width={800}
      destroyOnHidden={true}
      afterClose={handleAfterClose}
      afterOpenChange={handleAfterOpenChange}
      footer={
        <Space>
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" onClick={handleOk} loading={loading}>
            确定
          </Button>
        </Space>
      }
      maskClosable={false}
    >
      <Form form={form} layout="horizontal" labelCol={{ span: 4 }} wrapperCol={{ span: 18 }}>
        {/* 隐藏字段存储文件信息 */}
        <Form.Item name="filePath" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="fileName" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="fileSize" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          name="name"
          label="驱动名称"
          rules={[
            { required: true, message: '请输入驱动名称' },
            { max: 100, message: '驱动名称不能超过100个字符' },
          ]}
        >
          <Input autoComplete="off" ref={sourceNameRef} placeholder="例如：MySQL 8.0 驱动" />
        </Form.Item>

        <Form.Item name="databaseType" label="数据库类型" rules={[{ required: true, message: '请选择数据库类型' }]}>
          <Select placeholder="请选择数据库类型" options={DATABASE_TYPE_OPTIONS} />
        </Form.Item>

        <Form.Item
          name="driverClass"
          label="驱动类"
          rules={[
            { required: true, message: '请输入驱动类' },
            {
              pattern: /^[a-zA-Z][a-zA-Z0-9.]*$/,
              message: '驱动类格式不正确，应为完整的Java类名',
            },
          ]}
          tooltip="例如：com.mysql.cj.jdbc.Driver"
        >
          <Input autoComplete="off" placeholder="例如：com.mysql.cj.jdbc.Driver" />
        </Form.Item>

        <Form.Item name="driverVersion" label="驱动版本">
          <Input autoComplete="off" placeholder="例如：8.0.33" />
        </Form.Item>

        <Form.Item name="remark" label="备注">
          <TextArea autoComplete="off" placeholder="请输入备注信息" rows={3} maxLength={500} showCount />
        </Form.Item>

        <Form.Item name="status" label="状态" valuePropName="checked">
          <Switch checkedChildren="启用" unCheckedChildren="禁用" />
        </Form.Item>

        <Form.Item
          name="file"
          label="驱动文件"
          rules={initialValues?.id ? [] : [{ required: true, message: '请上传驱动文件' }]}
        >
          <div>
            {fileName && (
              <div
                className={`mb-2 p-2 rounded border ${
                  initialValues?.id && fileName === initialValues.fileName
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <span
                  className={
                    initialValues?.id && fileName === initialValues.fileName ? 'text-blue-600' : 'text-green-600'
                  }
                >
                  {initialValues?.id && fileName === initialValues.fileName ? '当前文件: ' : '已上传: '}
                  {fileName}
                </span>
              </div>
            )}
            <ChunkedUpload
              ref={chunkedUploadRef}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              accept=".jar"
              maxSize={500}
              chunkSize={2}
            />
          </div>
        </Form.Item>
      </Form>
    </DragModal>
  );
});

DriverModal.displayName = 'DriverModal';

export default DriverModal;
