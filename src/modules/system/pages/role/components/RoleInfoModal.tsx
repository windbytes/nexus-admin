/**
 * @file 角色信息新增/编辑/详情弹窗
 */

import { Form, Input, type InputRef, Select, Switch } from 'antd';
import { useEffect, useRef } from 'react';
import { roleService } from '@/modules/system/api/role';
import type { RoleModel } from '@/shared/api/system/role/type';
import DragModal from '@/shared/components/modal/DragModal';

interface RoleInfoModalProps {
  open: boolean;
  action: string;
  onOk: (values: Partial<RoleModel>) => void;
  onCancel: () => void;
  roleInfo: Partial<RoleModel> | null;
}

/**
 * 角色信息弹窗。
 *
 * @param props - 开关、操作类型、角色数据与回调
 */
function RoleInfoModal({ open, onOk, onCancel, roleInfo, action }: RoleInfoModalProps) {
  const [form] = Form.useForm();
  const roleCodeRef = useRef<InputRef>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    form.resetFields();
    if (roleInfo) {
      form.setFieldsValue(roleInfo);
    }
  }, [roleInfo, open, form]);

  /**
   * @param isOpen - 弹窗是否打开
   */
  function handleAfterOpenChange(isOpen: boolean) {
    if (isOpen) {
      roleCodeRef.current?.focus({ cursor: 'end' });
    }
  }

  /**
   * 角色编码唯一性校验。
   *
   * @param _rule - 规则
   * @param value - 编码值
   */
  async function checkUnique(_rule: unknown, value: string) {
    if (!value) {
      return Promise.resolve();
    }
    if (action === 'edit' && roleInfo && roleInfo.roleCode === value) {
      return Promise.resolve();
    }
    const res = await roleService.checkRoleCodeExist(value);
    if (res) {
      return Promise.reject(new Error('角色编码已存在'));
    }
    return Promise.resolve();
  }

  /**
   * 校验后提交。
   */
  function handleOk() {
    form
      .validateFields()
      .then(() => {
        onOk(form.getFieldsValue());
      })
      .catch((errorInfo: { errorFields?: Array<{ name: string[] }> }) => {
        const first = errorInfo.errorFields?.[0]?.name;
        if (first) {
          form.scrollToField(first);
          form.focusField(first);
        }
      });
  }

  /**
   * 取消并重置表单。
   */
  function handleCancel() {
    form.resetFields();
    onCancel();
  }

  return (
    <DragModal
      width="40%"
      open={open}
      title={action === 'view' ? '角色详情' : action === 'add' ? '新增角色' : '编辑角色'}
      okButtonProps={{ disabled: action === 'view' }}
      onOk={handleOk}
      onCancel={handleCancel}
      afterOpenChange={handleAfterOpenChange}
    >
      <Form form={form} labelCol={{ span: 4 }} initialValues={{ status: true }} disabled={action === 'view'}>
        <Form.Item name="id" hidden>
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="角色编码"
          name="roleCode"
          rules={[{ required: true, message: '请输入角色编码' }, { validator: checkUnique }]}
        >
          <Input ref={roleCodeRef} placeholder="请输入角色编码" autoComplete="off" />
        </Form.Item>
        <Form.Item name="roleName" label="角色名称" rules={[{ required: true, message: '请输入角色名称' }]}>
          <Input placeholder="请输入角色名称" autoComplete="off" />
        </Form.Item>
        <Form.Item name="roleType" label="角色类型">
          <Select
            placeholder="请选择角色类型"
            options={[
              { value: 0, label: '系统角色' },
              { value: 1, label: '普通角色' },
            ]}
          />
        </Form.Item>
        <Form.Item name="status" label="角色状态" rules={[{ required: true, message: '请选择角色状态' }]}>
          <Switch checkedChildren="启用" unCheckedChildren="禁用" />
        </Form.Item>
        <Form.Item name="remark" label="角色描述">
          <Input.TextArea placeholder="请输入角色描述" />
        </Form.Item>
      </Form>
    </DragModal>
  );
}

export default RoleInfoModal;
