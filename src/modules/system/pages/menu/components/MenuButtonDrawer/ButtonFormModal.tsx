/**
 * @file 菜单按钮（权限点）新增/编辑弹窗
 */

import { Form, Input, InputNumber, Switch } from 'antd';
import { useEffect } from 'react';
import type { PermissionModel, PermissionSaveParams } from '@/shared/api/system/permission/type';
import DragModal from '@/shared/components/modal/DragModal';

/** 权限编码规则：{domain}:{resource}:{action}，如 system:user:add */
const PERM_CODE_PATTERN = /^[a-z][a-z0-9]*(:[a-z][a-z0-9-]*){2,3}$/;

export interface ButtonFormModalProps {
  open: boolean;
  /** 所属菜单 ID（新增时必传） */
  menuId: string;
  /** 编辑时的按钮数据 */
  record?: Partial<PermissionModel> | null;
  onOk: (values: PermissionSaveParams) => void | Promise<void>;
  onClose: () => void;
}

/**
 * 菜单按钮新增/编辑弹窗：按钮即 permType=1 权限点，permCode 全局唯一。
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
        permCode: record.permCode,
        permName: record.permName,
        sort: record.sort ?? 0,
        status: record.status ?? true,
        remark: record.remark,
      });
    } else {
      form.setFieldsValue({ sort: 0, status: true });
    }
  }, [open, isEdit, record, form]);

  /**
   * 校验并提交表单。
   */
  async function handleSubmit() {
    try {
      const values = await form.validateFields();
      const payload: PermissionSaveParams = {
        id: record?.id,
        parentId: '0',
        menuId,
        permCode: values.permCode?.trim(),
        permName: values.permName?.trim(),
        permType: 1,
        sort: values.sort ?? 0,
        status: values.status ?? true,
        remark: values.remark?.trim(),
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
      <Form form={form} labelCol={{ span: 5 }}>
        <Form.Item
          name="permCode"
          label="权限编码"
          rules={[
            { required: true, message: '请输入权限编码' },
            {
              pattern: PERM_CODE_PATTERN,
              message: '格式为 {域}:{资源}:{操作}，如 system:user:add',
            },
            { max: 100, message: '最多100个字符' },
          ]}
          extra="与后端 @PreAuthorize 注解值一致，全局唯一"
        >
          <Input placeholder="如 system:user:add" maxLength={100} showCount disabled={isEdit} />
        </Form.Item>
        <Form.Item
          name="permName"
          label="按钮名称"
          rules={[
            { required: true, message: '请输入按钮名称' },
            { max: 100, message: '最多100个字符' },
          ]}
        >
          <Input placeholder="展示用名称，如 新增" maxLength={100} showCount />
        </Form.Item>
        <Form.Item name="sort" label="排序" initialValue={0}>
          <InputNumber min={0} placeholder="数字越小越靠前" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="status" label="状态" valuePropName="checked" initialValue={true}>
          <Switch checkedChildren="启用" unCheckedChildren="禁用" />
        </Form.Item>
        <Form.Item name="remark" label="备注" rules={[{ max: 256, message: '最多256个字符' }]}>
          <Input.TextArea rows={2} maxLength={256} showCount placeholder="选填" />
        </Form.Item>
      </Form>
    </DragModal>
  );
}

export default ButtonFormModal;
