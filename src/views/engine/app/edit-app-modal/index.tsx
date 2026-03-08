import { useKeyPress } from 'ahooks';
import { ColorPicker, Form, Input, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DragModal from '@/components/modal/DragModal';
import type { EngineApp } from '@/services/engine/app/types';

export interface EditAppModalProps {
  open: boolean;
  app: EngineApp;
  onConfirm: (payload: Partial<EngineApp>) => Promise<void>;
  onCancel: () => void;
}

const STATUS_OPTIONS = [
  { label: '未启动', value: 0 },
  { label: '正常', value: 1 },
  { label: '异常', value: 2 },
  { label: '部分异常', value: 3 },
];

const LOG_LEVEL_OPTIONS = [
  { label: 'DEBUG', value: 1 },
  { label: 'INFO', value: 2 },
  { label: 'WARN', value: 3 },
  { label: 'ERROR', value: 4 },
];

/**
 * 编辑应用弹窗
 */
const EditAppModal: React.FC<EditAppModalProps> = ({ open, app, onConfirm, onCancel }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<Partial<EngineApp>>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && app) {
      form.setFieldsValue({
        name: app.name,
        type: app.type,
        icon: app.icon ?? '',
        iconBg: app.iconBg ?? '',
        status: app.status ?? 0,
        priority: app.priority ?? 5,
        logLevel: app.logLevel ?? 1,
        remark: app.remark ?? '',
      });
    }
  }, [open, app, form]);

  const submit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await onConfirm(values);
      form.resetFields();
    } catch (e) {
      if (e instanceof Error && 'errorFields' in e) {
        return;
      }
    } finally {
      setSubmitting(false);
    }
  }, [form, onConfirm]);

  useKeyPress(['meta.enter', 'ctrl.enter'], (e) => {
    if (open) {
      e.preventDefault();
      submit();
    }
  });

  return (
    <DragModal
      open={open}
      title={t('app.editApp') ?? '编辑应用'}
      onCancel={onCancel}
      onOk={submit}
      okButtonProps={{ loading: submitting }}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        className="mt-2"
      >
        <Form.Item
          name="name"
          label={t('app.name') ?? '应用名称'}
          rules={[{ required: true, message: t('common.required') ?? '请输入应用名称' }]}
        >
          <Input placeholder={t('app.namePlaceholder') ?? '应用名称'} maxLength={32} />
        </Form.Item>
        <Form.Item name="type" label={t('app.type') ?? '应用类型'}>
          <Select
            options={[
              { label: t('app.segment.integrated') ?? '集成应用', value: 1 },
              { label: t('app.segment.interface') ?? '接口应用', value: 2 },
              { label: t('app.segment.tripartite') ?? '三方应用', value: 3 },
            ]}
          />
        </Form.Item>
        <Form.Item name="icon" label={t('app.icon') ?? '图标'}>
          <Input placeholder="iconify 名称或 URL" />
        </Form.Item>
        <Form.Item name="iconBg" label={t('app.iconBg') ?? '图标背景色'}>
          <ColorPicker />
        </Form.Item>
        <Form.Item name="status" label={t('app.statusLabel') ?? '状态'}>
          <Select options={STATUS_OPTIONS} />
        </Form.Item>
        <Form.Item name="priority" label={t('app.priority') ?? '优先级'}>
          <Select options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({ label: String(n), value: n }))} />
        </Form.Item>
        <Form.Item name="logLevel" label={t('app.logLevel') ?? '日志级别'}>
          <Select options={LOG_LEVEL_OPTIONS} />
        </Form.Item>
        <Form.Item name="remark" label={t('app.remark') ?? '备注'}>
          <TextArea rows={3} placeholder={t('app.remarkPlaceholder') ?? '备注信息'} />
        </Form.Item>
      </Form>
    </DragModal>
  );
};

export default EditAppModal;
