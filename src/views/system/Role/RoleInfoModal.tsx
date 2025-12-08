import { Form, Input, type InputRef, Select, Switch } from 'antd';
import { useEffect, useRef } from 'react';
import DragModal from '@/components/modal/DragModal';
import { roleService } from '@/services/system/role/roleApi';
import type { RoleState } from '@/services/system/role/type';

const RoleInfoModal: React.FC<RoleInfoModalProps> = ({ params, onOk, onCancel }) => {
  // 表单实例
  const [form] = Form.useForm();
  const roleCodeRef = useRef<InputRef>(null);
  const { openEditModal, currentRow, action } = params;

  useEffect(() => {
    if (!openEditModal) {
      return;
    }
    if (currentRow) {
      // 填充表单数据
      form.setFieldsValue(currentRow);
    } else {
      // 清空表单数据，表示新增
      form.resetFields();
    }
  }, [currentRow, openEditModal]);

  /**
   * 弹窗打开关闭的回调（打开后默认聚焦到名称输入框）
   * @param open 弹窗是否打开
   */
  const onAfterOpenChange = (open: boolean) => {
    if (open) {
      roleCodeRef.current?.focus({ cursor: 'end' });
    }
  };

  /**
   * 角色编码唯一性校验
   * @param _rule 规则
   * @param value 值
   * @returns 结果
   */
  const checkUnique = async (_rule: any, value: string) => {
    // 如果为空值，跳过校验
    if (!value) {
      return Promise.resolve();
    }
    // 如果角色编码没有进行修改，则不需要做唯一性校验
    if (currentRow && currentRow.roleCode === value) {
      return Promise.resolve();
    }
    const res = await roleService.checkRoleCodeExist(value);
    if (res) {
      return Promise.reject('角色编码已存在');
    }
    return Promise.resolve();
  };

  /**
   * 点击确认的时候先做数据校验
   */
  const handleOk = () => {
    form
      .validateFields()
      .then(() => {
        onOk(form.getFieldsValue());
      })
      .catch((errorInfo) => {
        // 滚动并聚焦到第一个错误字段
        form.scrollToField(errorInfo.errorFields[0].name);
        form.focusField(errorInfo.errorFields[0].name);
      });
  };

  return (
    <DragModal
      width="40%"
      open={openEditModal}
      title={currentRow ? '编辑角色' : '新增角色'}
      okButtonProps={{ className: action === 'view' ? 'hidden' : '' }}
      onOk={handleOk}
      onCancel={onCancel}
      afterOpenChange={onAfterOpenChange}
    >
      <Form form={form} labelCol={{ span: 3 }} initialValues={{ status: true }} disabled={action === 'view'}>
        <Form.Item name="id" hidden>
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="角色编码"
          name="roleCode"
          rules={[
            { required: true, message: '请输入角色编码' }, // 必填规则
            { validator: checkUnique }, // 唯一性校验
          ]}
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
};
export default RoleInfoModal;

export type RoleInfoModalProps = {
  params: RoleState;
  // 点击确定的回调
  onOk: (params: Record<string, string | number | boolean>) => void;
  // 点击取消的回调
  onCancel: (e: React.MouseEvent<HTMLButtonElement>) => void;
};
