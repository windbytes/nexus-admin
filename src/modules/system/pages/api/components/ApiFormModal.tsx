/**
 * @file 系统接口新增/编辑弹窗
 */

import { Form, Input, Select, Switch } from 'antd';
import { useEffect } from 'react';
import type { ApiModel, ApiSaveParams } from '@/shared/api/system/api/type';
import DragModal from '@/shared/components/modal/DragModal';
import { PermissionCodeSelector } from '@/shared/components/PermissionCodeSelector';

const METHOD_OPTIONS = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'HEAD', label: 'HEAD' },
  { value: 'OPTIONS', label: 'OPTIONS' },
];

export interface ApiFormModalProps {
  open: boolean;
  /** 当前选中的菜单 ID（新增时必传） */
  menuId: string | null;
  /** 编辑时的接口数据 */
  record?: Partial<ApiModel> | null;
  onOk: (values: ApiSaveParams) => void | Promise<void>;
  onClose: () => void;
}

/**
 * 系统接口新增/编辑弹窗。
 *
 * @param props - 开关、菜单上下文、行数据与回调
 * @returns DragModal + 表单
 */
function ApiFormModal({ open, menuId, record, onOk, onClose }: ApiFormModalProps) {
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
        permCode: record.permCode ?? '',
        name: record.name,
        path: record.path,
        method: record.method,
        remark: record.remark ?? '',
        isPublic: record.isPublic ?? false,
      });
    } else {
      form.setFieldsValue({
        menuId: menuId ?? undefined,
        permCode: '',
        method: 'POST',
        remark: '',
        isPublic: false,
      });
    }
  }, [open, isEdit, record, menuId, form]);

  /**
   * 校验并提交表单。
   */
  async function handleSubmit() {
    try {
      const values = await form.validateFields();
      const payload: ApiSaveParams = {
        id: values.id,
        menuId: values.menuId,
        permCode: values.permCode?.trim() || undefined,
        name: values.name?.trim(),
        path: values.path?.trim(),
        method: values.method,
        remark: values.remark?.trim() ?? '',
        isPublic: values.isPublic ?? false,
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
      title={isEdit ? '编辑接口' : '新增接口'}
      open={open}
      width={560}
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
          name="name"
          label="接口名称"
          rules={[
            { required: true, message: '请输入接口名称' },
            { max: 64, message: '最多64个字符' },
          ]}
        >
          <Input placeholder="如：新增用户" maxLength={64} showCount />
        </Form.Item>
        <Form.Item
          name="path"
          label="接口路径"
          rules={[
            { required: true, message: '请输入接口路径' },
            { max: 200, message: '最多200个字符' },
          ]}
        >
          <Input placeholder="如：/sys/user/addUser" maxLength={200} showCount />
        </Form.Item>
        <Form.Item name="method" label="请求方法" rules={[{ required: true, message: '请选择请求方法' }]}>
          <Select options={METHOD_OPTIONS} placeholder="GET / POST / PUT / DELETE 等" allowClear={false} />
        </Form.Item>
        <Form.Item name="permCode" label="权限标识" rules={[{ max: 32, message: '最多32个字符' }]}>
          <PermissionCodeSelector
            resourceType={2}
            placeholder="对应 t_sys_permission.permission_code，可选"
            maxLength={32}
            allowClear
          />
        </Form.Item>
        <Form.Item name="remark" label="描述" rules={[{ max: 64, message: '最多64个字符' }]}>
          <Input.TextArea placeholder="接口说明" maxLength={64} showCount rows={2} />
        </Form.Item>
        <Form.Item name="isPublic" label="是否公开" valuePropName="checked" initialValue={false}>
          <Switch checkedChildren="公开（无需鉴权）" unCheckedChildren="需鉴权" />
        </Form.Item>
      </Form>
    </DragModal>
  );
}

export default ApiFormModal;
