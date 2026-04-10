import { useQuery } from '@tanstack/react-query';
import { ColorPicker, Form, Input, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useCallback, useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import DragModal from '@/components/modal/DragModal';
import { appCategoryService } from '@/services/engine';
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

/** 与 create-app-modal 中 ColorPicker 一致：表单内只存 hex 字符串，避免提交 Color 对象 */
function colorPickerValueToHex(color: unknown): string {
  if (color == null || color === '') {
    return '';
  }
  if (typeof color === 'string') {
    return color;
  }
  if (typeof color === 'object' && color !== null && 'toHexString' in color) {
    return (color as { toHexString: () => string }).toHexString();
  }
  return '';
}

/**
 * 编辑应用弹窗
 */
const EditAppModal: React.FC<EditAppModalProps> = ({ open, app, onConfirm, onCancel }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<Partial<EngineApp>>();
  const [submitting, setSubmitting] = useState(false);
  const { data: categories = [] } = useQuery({
    queryKey: ['app_categories'],
    queryFn: () => appCategoryService.getAppCategories(),
    enabled: open,
  });

  useEffect(() => {
    if (open && app) {
      form.setFieldsValue({
        name: app.name,
        categoryId: app.categoryId ?? undefined,
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
      const iconBgStr = colorPickerValueToHex(values.iconBg).trim();
      await onConfirm({
        ...values,
        iconBg: iconBgStr || undefined,
      });
      form.resetFields();
    } catch (e) {
      if (e instanceof Error && 'errorFields' in e) {
        return;
      }
    } finally {
      setSubmitting(false);
    }
  }, [form, onConfirm]);

  useHotkeys(
    'mod+enter',
    (e) => {
      if (open) {
        e.preventDefault();
        submit();
      }
    },
    { enableOnFormTags: true },
    [open, submit]
  );

  return (
    <DragModal
      open={open}
      title={t('app.editApp') ?? '编辑应用'}
      onCancel={onCancel}
      onOk={submit}
      width={600}
      centered
      okButtonProps={{ loading: submitting }}
      destroyOnHidden
    >
      <Form form={form} layout="horizontal" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} className="mt-2">
        <Form.Item
          name="name"
          label={t('app.name') ?? '应用名称'}
          rules={[{ required: true, message: t('common.required') ?? '请输入应用名称' }]}
        >
          <Input placeholder={t('app.namePlaceholder') ?? '应用名称'} maxLength={32} />
        </Form.Item>
        <Form.Item name="categoryId" label="应用分类">
          <Select allowClear placeholder="选择分类" options={categories.map((c) => ({ label: c.name, value: c.id }))} />
        </Form.Item>
        <Form.Item name="icon" label={t('app.icon') ?? '图标'}>
          <Input placeholder="iconify 名称或 URL" />
        </Form.Item>
        <Form.Item name="iconBg" label={t('app.iconBg') ?? '图标背景色'} getValueFromEvent={colorPickerValueToHex}>
          <ColorPicker onClear={() => form.setFieldValue('iconBg', '')} />
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
