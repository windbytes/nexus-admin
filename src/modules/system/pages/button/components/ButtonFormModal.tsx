/**
 * @file 页面按钮新增/编辑弹窗
 */

import { Form, Input, InputNumber, Switch } from 'antd';
import { useEffect } from 'react';
import type { PageButtonModel, PageButtonSaveParams } from '@/shared/api/system/pageButton/type';
import DragModal from '@/shared/components/modal/DragModal';
import { PermissionCodeSelector } from '@/shared/components/PermissionCodeSelector';

export interface ButtonFormModalProps {
  open: boolean;
  /** 当前选中的菜单 ID（新增时必传） */
  menuId: string | null;
  /** 编辑时的按钮数据 */
  record?: Partial<PageButtonModel> | null;
  onOk: (values: PageButtonSaveParams) => void | Promise<void>;
  onClose: () => void;
}

/**
 * 页面按钮新增/编辑弹窗。
 *
 * @param props - 开关、菜单上下文、行数据与回调
 * @returns DragModal + 表单
 */
function ButtonFormModal({ open, menuId, record, onOk, onClose }: ButtonFormModalProps) {
  const [form] = Form.useForm();
  const isEdit = !!record?.id;

  useEffect(() => {
    if (!open) {
      return;
    }
    if (isEdit && record) {
      form.setFieldsValue({
        id: record.id,
        menuId: record.menuId,
        code: record.code,
        name: record.name,
        permCode: record.permCode,
        sort: record.sort ?? 0,
        status: record.status ?? true,
      });
    } else {
      form.setFieldsValue({
        menuId: menuId ?? undefined,
        sort: 0,
        status: true,
      });
    }
  }, [open, isEdit, record, menuId, form]);

  /**
   * 校验并提交表单。
   */
  async function handleSubmit() {
    try {
      const values = await form.validateFields();
      const payload: PageButtonSaveParams = {
        id: values.id,
        menuId: values.menuId,
        code: values.code?.trim(),
        name: values.name?.trim(),
        permCode: values.permCode?.trim(),
        sort: values.sort ?? 0,
        status: values.status ?? true,
      };
      await onOk(payload);
    } catch (errorInfo) {
      const firstErrorField = (errorInfo as { errorFields?: Array<{ name: string[] }> }).errorFields?.[0]?.name;
      if (firstErrorField) {
        form.scrollToField(firstErrorField);
        form.focusField(firstErrorField);
      }
    }
  }

  /**
   * @param visible - 弹窗是否可见
   */
  function handleAfterOpenChange(visible: boolean) {
    if (!visible) {
      form.resetFields();
    }
  }

  return (
    <DragModal
      title={isEdit ? '编辑按钮' : '新增按钮'}
      open={open}
      width={520}
      centered
      onCancel={onClose}
      afterOpenChange={handleAfterOpenChange}
      destroyOnHidden
      onOk={handleSubmit}
    >
      <Form form={form} labelCol={{ span: 4 }}>
        <Form.Item name="id" hidden>
          <input type="hidden" />
        </Form.Item>
        <Form.Item name="menuId" hidden>
          <input type="hidden" />
        </Form.Item>
        <Form.Item
          name="code"
          label="按钮编码"
          rules={[
            { required: true, message: '请输入按钮编码' },
            { max: 50, message: '最多50个字符' },
          ]}
        >
          <Input placeholder="唯一编码，如 add、edit、delete" maxLength={50} showCount disabled={isEdit} />
        </Form.Item>
        <Form.Item
          name="name"
          label="按钮名称"
          rules={[
            { required: true, message: '请输入按钮名称' },
            { max: 100, message: '最多100个字符' },
          ]}
        >
          <Input placeholder="展示用名称" maxLength={100} showCount />
        </Form.Item>
        <Form.Item
          name="permCode"
          label="权限标识"
          rules={[
            { required: true, message: '请选择或输入权限标识' },
            { max: 32, message: '最多32个字符' },
          ]}
        >
          <PermissionCodeSelector resourceType={1} placeholder="与权限表一致，唯一" maxLength={32} allowClear={false} />
        </Form.Item>
        <Form.Item name="sort" label="排序" initialValue={0}>
          <InputNumber min={0} placeholder="数字越小越靠前" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="status" label="状态" valuePropName="checked" initialValue={true}>
          <Switch checkedChildren="启用" unCheckedChildren="禁用" />
        </Form.Item>
      </Form>
    </DragModal>
  );
}

export default ButtonFormModal;
