import { InboxOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Upload } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { RcFile, UploadFile } from 'antd/es/upload';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DragModal from '@/components/modal/DragModal';
import type { AppExportVO } from '@/services/engine/app/types';
import { appService } from '@/services/engine/index.ts';

const ImportSummary: React.FC<{ payload: AppExportVO; form: FormInstance }> = ({ payload, form }) => {
  const appName = Form.useWatch('appName', form) ?? payload?.app?.name ?? '';
  const flowCount = payload?.flows?.length ?? 0;
  return (
    <p className="text-xs text-gray-500">
      将创建新应用「{appName || '（未填写）'}」，并导入 {flowCount} 个流程。
    </p>
  );
};

export interface ImportDslModelProps {
  open: boolean;
  onClose: () => void;
  /** 导入成功后回调（如刷新列表并关闭弹窗） */
  onSuccess?: () => void;
}

const parseExportFile = (file: File): Promise<AppExportVO> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const data = JSON.parse(text) as unknown;
        if (!data || typeof data !== 'object' || !('app' in data)) {
          reject(new Error('无效的导出文件：缺少 app 字段'));
          return;
        }
        const vo = data as AppExportVO;
        if (!vo.app?.name) {
          reject(new Error('无效的导出文件：app.name 为空'));
          return;
        }
        resolve(vo);
      } catch (e) {
        reject(e instanceof Error ? e : new Error('解析 JSON 失败'));
      }
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsText(file, 'UTF-8');
  });
};

const ImportDsl: React.FC<ImportDslModelProps> = ({ open, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<{ appName: string }>();
  const [payload, setPayload] = useState<AppExportVO | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const reset = useCallback(() => {
    setPayload(null);
    setFileList([]);
    form.resetFields();
  }, [form]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const beforeUpload = useCallback(
    (file: RcFile) => {
      setUploading(true);
      parseExportFile(file)
        .then((vo) => {
          setPayload(vo);
          form.setFieldsValue({ appName: vo.app?.name ?? '' });
          setFileList([
            {
              uid: file.uid ?? file.name,
              name: file.name,
              status: 'done',
              originFileObj: file,
            },
          ]);
        })
        .catch((err) => {
          message.error(err?.message ?? '解析文件失败');
        })
        .finally(() => {
          setUploading(false);
        });
      return false;
    },
    [form]
  );

  const onRemove = useCallback(() => {
    setFileList([]);
    setPayload(null);
    form.resetFields(['appName']);
  }, [form]);

  const handleSubmit = useCallback(async () => {
    if (!payload) {
      message.warning('请先选择并解析导出文件');
      return;
    }
    const values = await form.validateFields().catch(() => null);
    if (!values) {
      return;
    }
    setLoading(true);
    try {
      await appService.importApp({
        payload,
        appName: values.appName?.trim() || undefined,
      });
      message.success('导入成功');
      onSuccess?.();
      handleClose();
    } catch {
      // HttpRequest 会统一提示错误
    } finally {
      setLoading(false);
    }
  }, [payload, form, onSuccess, handleClose]);

  return (
    <DragModal
      centered
      open={open}
      title={t('app.newApp.importFromDSL')}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          {t('common.operation.cancel')}
        </Button>,
        <Button key="submit" type="primary" loading={loading} disabled={!payload} onClick={handleSubmit}>
          {t('common.operation.confirm')}
        </Button>,
      ]}
    >
      <div className="space-y-4">
        <Upload.Dragger
          accept=".json,application/json"
          maxCount={1}
          fileList={fileList}
          beforeUpload={beforeUpload}
          onRemove={onRemove}
          disabled={uploading}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ fontSize: 48, color: 'var(--ant-colorPrimary)' }} />
          </p>
          <p className="ant-upload-text">点击或拖拽 JSON 文件到此区域</p>
          <p className="ant-upload-hint">仅支持单个 .json 导出文件</p>
        </Upload.Dragger>
        {payload && (
          <Form form={form} layout="vertical" className="mt-2">
            <Form.Item
              name="appName"
              label="导入后的应用名称（可修改）"
              rules={[{ required: true, message: '请输入应用名称' }]}
            >
              <Input placeholder="与导出时一致或自定义" maxLength={64} showCount />
            </Form.Item>
            <ImportSummary payload={payload} form={form} />
          </Form>
        )}
      </div>
    </DragModal>
  );
};

export default ImportDsl;
