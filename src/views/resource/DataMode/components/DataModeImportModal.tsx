import DragModal from '@/components/modal/DragModal';
import { dataModeService } from '@/services/resource/datamode/dataModeApi';
import { InboxOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { App, Form, Input, Tabs, Upload, type UploadFile } from 'antd';
import type React from 'react';
import { useCallback, useState } from 'react';

const { Dragger } = Upload;
const { TextArea } = Input;

interface DataModeImportModalProps {
  open: boolean;
  loading?: boolean;
  onOk?: () => void;
  onCancel: () => void;
}

type ImportType = 'file' | 'url';

/**
 * 数据模式导入弹窗组件
 */
const DataModeImportModal: React.FC<DataModeImportModalProps> = ({
  open,
  loading = false,
  onOk,
  onCancel,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [importType, setImportType] = useState<ImportType>('file');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  /**
   * 重置表单和状态
   */
  const handleReset = useCallback(() => {
    form.resetFields();
    setFileList([]);
  }, [form]);

  // 文件导入 mutation
  const importFileMutation = useMutation({
    mutationFn: async (file: File) => {
      await dataModeService.importDataModeFromFile(file);
    },
    onSuccess: () => {
      handleReset();
      onOk?.();
    }
  });

  // URL导入 mutation
  const importUrlMutation = useMutation({
    mutationFn: async (url: string) => {
      await dataModeService.importDataModeFromUrl(url);
    },
    onSuccess: () => {
      handleReset();
      onOk?.();
    }
  });

  /**
   * 处理弹窗取消
   */
  const handleCancel = useCallback(() => {
    handleReset();
    onCancel();
  }, [handleReset, onCancel]);

  /**
   * 处理弹窗确认
   */
  const handleOk = useCallback(async () => {
    try {
      if (importType === 'file') {
        // 文件导入
        if (fileList.length === 0) {
          message.warning('请先选择要导入的文件！');
          return;
        }

        const file = fileList[0]?.originFileObj;
        if (!file) {
          message.warning('文件读取失败，请重新选择！');
          return;
        }

        importFileMutation.mutate(file);
      } else {
        // URL导入
        const values = await form.validateFields();
        if (!values.url) {
          message.warning('请输入URL地址！');
          return;
        }

        importUrlMutation.mutate(values.url);
      }
    } catch (error) {
      // 表单验证失败
      console.error('Validation failed:', error);
    }
  }, [importType, fileList, form, importFileMutation, importUrlMutation, message]);

  /**
   * 处理文件上传
   */
  const handleFileChange = useCallback((info: any) => {
    const { fileList: newFileList } = info;
    setFileList(newFileList);
  }, []);

  /**
   * 处理文件移除
   */
  const handleFileRemove = useCallback(() => {
    setFileList([]);
  }, []);

  /**
   * 处理文件上传前验证
   */
  const beforeUpload = useCallback((file: File) => {
    // 验证文件类型
    const isJson = file.type === 'application/json' || file.name.endsWith('.json');
    if (!isJson) {
      message.error('只能上传JSON格式的文件！');
      return Upload.LIST_IGNORE;
    }

    // 验证文件大小（5M = 5 * 1024 * 1024 字节）
    if (file.size >= (5 << 20)) {
      message.error('文件大小不能超过5M！');
      return Upload.LIST_IGNORE;
    }

    return false; // 阻止自动上传
  }, [message]);

  /**
   * 处理Tab切换
   */
  const handleTabChange = useCallback((key: string) => {
    setImportType(key as ImportType);
    handleReset();
  }, [handleReset]);

  const isLoading = loading || importFileMutation.isPending || importUrlMutation.isPending;

  return (
    <DragModal
      open={open}
      title="导入Schema"
      width={600}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={isLoading}
      destroyOnHidden
    >
      <Tabs
        activeKey={importType}
        onChange={handleTabChange}
        items={[
          {
            key: 'file',
            label: '文件导入',
            children: (
              <Form form={form} layout="vertical">
                <Form.Item
                  label="选择JSON文件"
                  required
                  tooltip="支持拖拽上传，文件大小限制5M，格式限制为JSON"
                >
                  <Dragger
                    fileList={fileList}
                    onChange={handleFileChange}
                    onRemove={handleFileRemove}
                    beforeUpload={beforeUpload}
                    maxCount={1}
                    accept=".json,application/json"
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                    <p className="ant-upload-hint">
                      支持单个JSON文件上传，文件大小不超过5M
                    </p>
                  </Dragger>
                </Form.Item>
              </Form>
            ),
          },
          {
            key: 'url',
            label: 'URL导入',
            children: (
              <Form form={form} layout="vertical">
                <Form.Item
                  name="url"
                  label="URL地址"
                  rules={[
                    { required: true, message: '请输入URL地址！' },
                    { type: 'url', message: '请输入有效的URL地址！' },
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="请输入要导入的Schema的URL地址，例如：https://example.com/schema.json"
                  />
                </Form.Item>
              </Form>
            ),
          },
        ]}
      />
    </DragModal>
  );
};

export default DataModeImportModal;

