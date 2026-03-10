import { useQuery } from '@tanstack/react-query';
import { Form, Input, Select } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DragModal from '@/components/modal/DragModal';
import { appTemplateCategoryService, appTemplateService } from '@/services/engine';
import type { EngineApp } from '@/services/engine/app/types';

export interface SaveAsTemplateModalProps {
  open: boolean;
  app: EngineApp;
  onSuccess?: () => void;
  onCancel: () => void;
}

/**
 * 存为模板弹窗：模板名称、描述、模板分类，提交后调用方案 A 存为模板。
 */
const SaveAsTemplateModal: React.FC<SaveAsTemplateModalProps> = ({ open, app, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<{ name: string; description?: string; categoryId?: string }>();
  const [submitting, setSubmitting] = useState(false);

  const { data: templateCategories = [] } = useQuery({
    queryKey: ['app_template_categories'],
    queryFn: () => appTemplateCategoryService.list(),
    enabled: open,
  });

  useEffect(() => {
    if (open && app) {
      form.setFieldsValue({
        name: app.name ? `${app.name}（模板）` : '',
        description: '',
        categoryId: undefined,
      });
    }
  }, [open, app, form]);

  const submit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await appTemplateService.saveAppAsTemplate(app.id, {
        name: values.name,
        description: values.description ?? undefined,
        categoryId: values.categoryId != null ? Number(values.categoryId) : undefined,
      });
      onSuccess?.();
      onCancel();
      form.resetFields();
    } catch (e) {
      if (e instanceof Error && 'errorFields' in e) {
        return;
      }
    } finally {
      setSubmitting(false);
    }
  }, [app.id, form, onSuccess, onCancel]);

  return (
    <DragModal
      open={open}
      title={t('app.saveAsTemplate') ?? '存为模板'}
      onCancel={onCancel}
      onOk={submit}
      centered
      okButtonProps={{ loading: submitting }}
      destroyOnHidden
    >
      <Form form={form} layout="horizontal" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} className="mt-2">
        <Form.Item name="name" label="模板名称" rules={[{ required: true, message: '请输入模板名称' }]}>
          <Input placeholder="模板名称" maxLength={64} />
        </Form.Item>
        <Form.Item name="description" label="模板描述">
          <Input.TextArea rows={3} placeholder="选填" />
        </Form.Item>
        <Form.Item name="categoryId" label="模板分类">
          <Select
            allowClear
            placeholder="选择分类"
            options={templateCategories.map((c) => ({ label: c.name, value: c.id }))}
          />
        </Form.Item>
      </Form>
    </DragModal>
  );
};

export default SaveAsTemplateModal;
