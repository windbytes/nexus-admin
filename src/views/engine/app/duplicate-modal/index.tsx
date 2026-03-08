import { ColorPicker, Form, Input, Select } from 'antd';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DragModal from '@/components/modal/DragModal';
import type { AppIconType } from '@/services/engine/app/types';
import { appCategoryService } from '@/services/engine';
import { useQuery } from '@tanstack/react-query';

export type DuplicateAppModalProps = {
  show: boolean;
  appName: string;
  categoryId?: string | null;
  icon_type: AppIconType | null;
  icon: string;
  icon_url: string | null;
  icon_background?: string | null;
  onConfirm: (info: {
    name: string;
    categoryId?: string | null;
    icon_type?: AppIconType | null;
    icon?: string;
    icon_url?: string | null;
    icon_background?: string | null;
  }) => Promise<void>;
  onCancel: () => void;
};

/**
 * 复制应用弹窗
 */
const DuplicateAppModal: React.FC<DuplicateAppModalProps> = ({
  show,
  appName,
  categoryId: initialCategoryId,
  icon_type,
  icon,
  icon_url,
  icon_background,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<{ name: string; categoryId?: string; icon?: string; iconBg?: string }>();
  const [submitting, setSubmitting] = useState(false);
  const { data: categories = [] } = useQuery({
    queryKey: ['app_categories'],
    queryFn: () => appCategoryService.getAppCategories(),
    enabled: show,
  });

  useEffect(() => {
    if (show) {
      form.setFieldsValue({
        name: appName ? `${appName} - 副本` : '',
        categoryId: initialCategoryId ?? undefined,
        icon: icon ?? '',
        iconBg: icon_background ?? '',
      });
    }
  }, [show, appName, initialCategoryId, icon, icon_background, form]);

  const onConfirmClick = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await onConfirm({
        name: values.name,
        categoryId: values.categoryId ?? initialCategoryId ?? undefined,
        icon_type: icon_type ?? undefined,
        icon: values.icon ?? icon,
        icon_url: icon_url ?? undefined,
        icon_background: values.iconBg ?? icon_background ?? undefined,
      });
      form.resetFields();
    } catch (e) {
      if (e instanceof Error && 'errorFields' in e) {
        return;
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DragModal
      open={show}
      title={t('app.duplicate') ?? '复制应用'}
      onCancel={onCancel}
      onOk={onConfirmClick}
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
        <Form.Item name="categoryId" label="应用分类">
          <Select
            allowClear
            placeholder="选择分类"
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
          />
        </Form.Item>
        <Form.Item name="icon" label={t('app.icon') ?? '图标'}>
          <Input placeholder="iconify 名称或 URL" />
        </Form.Item>
        <Form.Item name="iconBg" label={t('app.iconBg') ?? '图标背景色'}>
          <ColorPicker />
        </Form.Item>
      </Form>
    </DragModal>
  );
};

export default DuplicateAppModal;
