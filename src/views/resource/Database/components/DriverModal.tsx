import ChunkedUpload, { type ChunkedUploadRef } from '@/components/FileUpload/ChunkedUpload';
import DragModal from '@/components/modal/DragModal';
import { FrameworkApi } from '@/services/framework/frameworkApi';
import { type DatabaseDriver, type DriverFormData } from '@/services/resource/database/driverApi';
import { Button, Form, Input, Select, Space, Switch } from 'antd';
import type React from 'react';
import { memo, useEffect, useRef, useState } from 'react';
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
  const [uploadedFilePath, setUploadedFilePath] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const chunkedUploadRef = useRef<ChunkedUploadRef>(null);

  // 初始化表单数据
  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue(initialValues);
      setUploadedFilePath(initialValues.filePath || '');
      setUploadedFileName(initialValues.fileName || '');
    } else if (open) {
      form.resetFields();
      setUploadedFilePath('');
      setUploadedFileName('');
    }
  }, [open, initialValues, form]);

  /**
   * 确认回调
   */
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // 如果是新增，必须上传文件
      if (!initialValues?.id && !uploadedFilePath) {
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
        filePath: uploadedFilePath || initialValues?.filePath,
        fileName: uploadedFileName || initialValues?.fileName,
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
    // 如果已上传文件但未提交，删除已上传的文件
    if (uploadedFilePath && !initialValues?.id) {
      try {
        // 取消上传并清理文件
        if (chunkedUploadRef.current) {
          await chunkedUploadRef.current.cancelUpload();
        }
      } catch (error) {
        console.error('清理上传文件失败:', error);
      }
    } else if (uploadedFilePath && initialValues?.id) {
      // 如果是编辑模式，只清理新上传的文件
      try {
        if (chunkedUploadRef.current) {
          await chunkedUploadRef.current.cleanupUploadedFile();
        }
      } catch (error) {
        console.error('清理上传文件失败:', error);
      }
    }

    form.resetFields();
    setUploadedFilePath('');
    setUploadedFileName('');
    onCancel();
  };

  /**
   * 文件上传成功回调
   */
  const handleUploadSuccess = (filePath: string, fileName: string) => {
    setUploadedFilePath(filePath);
    setUploadedFileName(fileName);
    form.setFieldValue('fileName', fileName);
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
  };

  return (
    <DragModal
      centered
      title={title}
      open={open}
      onCancel={handleCancel}
      width={800}
      footer={
        <Space>
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" onClick={handleOk} loading={loading}>
            确定
          </Button>
        </Space>
      }
      maskClosable={false}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        initialValues={{
          status: true,
          databaseType: 'MySQL',
        }}
      >
        <Form.Item
          name="name"
          label="驱动名称"
          rules={[
            { required: true, message: '请输入驱动名称' },
            { max: 100, message: '驱动名称不能超过100个字符' },
          ]}
        >
          <Input autoComplete="off" placeholder="例如：MySQL 8.0 驱动" />
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
            {uploadedFileName && (
              <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded">
                <span className="text-green-600">已上传: {uploadedFileName}</span>
              </div>
            )}
            {initialValues?.fileName && !uploadedFileName && (
              <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
                <span className="text-blue-600">当前文件: {initialValues.fileName}</span>
              </div>
            )}
            <ChunkedUpload
              ref={chunkedUploadRef}
              uploadUrl={FrameworkApi.upload}
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
