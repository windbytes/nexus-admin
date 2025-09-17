import { useCallback, useEffect } from 'react';
import { Button, Modal, Form, Input, Select, Switch, InputNumber } from 'antd';
import type { PermissionButtonModel, ButtonFormData } from '@/services/system/permission/PermissionButton/permissionButtonApi';
import { menuService } from '@/services/system/menu/menuApi';
import { useMutation } from '@tanstack/react-query';

/**
 * 按钮Modal组件Props
 */
interface ButtonModalProps {
  open: boolean;
  button?: PermissionButtonModel | null;
  onOk: (formData: ButtonFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * 按钮Modal组件
 * 合并了DragModal和ButtonForm的功能
 */
const ButtonModal: React.FC<ButtonModalProps> = ({ 
  open, 
  button, 
  onOk, 
  onCancel, 
  loading = false 
}) => {
  const [form] = Form.useForm();

  /**
   * 查询菜单选项
   */
  const { data: menuList } = useMutation({
    mutationFn: () => menuService.getAllMenus({}),
    onSuccess: (menus: any[]) => {
      return menus.map((menu: any) => ({
        label: menu.name,
        value: menu.id,
      }));
    },
  });

  /**
   * 初始化表单数据
   */
  useEffect(() => {
    if (!open) return;
    if (button) {
      form.setFieldsValue({
        name: button.name,
        code: button.code,
        menuId: button.menuId,
        description: button.description,
        status: button.status,
        sortNo: button.sortNo,
      });
    } else {
      form.resetFields();
    }
  }, [button, form, open]);

  /**
   * 处理表单提交
   */
  const handleFormSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch (errorInfo: any) {
      const firstErrorField = errorInfo.errorFields?.[0]?.name;
      if (firstErrorField) {
        form.scrollToField(firstErrorField);
        form.focusField(firstErrorField);
      }
    }
  }, [form, onOk]);

  /**
   * 处理确定按钮点击
   */
  const handleOk = useCallback(() => {
    handleFormSubmit();
  }, [handleFormSubmit]);

  return (
    <Modal
      title={button ? '编辑按钮' : '新增按钮'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
      confirmLoading={loading}
      footer={
        <div className="flex justify-end space-x-2">
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleOk} loading={loading}>
            {button ? '更新' : '保存'}
          </Button>
        </div>
      }
    >
      <div className="h-full">
        <Form
          form={form}
          layout="horizontal"
          onFinish={handleFormSubmit}
          labelCol={{ span: 4 }}
          className="h-full flex flex-col"
        >
          <div className="flex-1 overflow-auto p-4">
            <Form.Item
              name="name"
              label="按钮名称"
              rules={[
                { required: true, message: '请输入按钮名称' },
                { max: 50, message: '按钮名称不能超过50个字符' },
              ]}
            >
              <Input placeholder="请输入按钮名称" autoFocus />
            </Form.Item>

            <Form.Item
              name="code"
              label="权限标识"
              rules={[
                { required: true, message: '请输入权限标识' },
                { pattern: /^[a-zA-Z0-9:_-]+$/, message: '权限标识只能包含字母、数字、冒号、下划线和连字符' },
              ]}
            >
              <Input placeholder="请输入权限标识，如：user:add" />
            </Form.Item>

            <Form.Item name="menuId" label="所属菜单" rules={[{ required: true, message: '请选择所属菜单' }]}>
              <Select
                placeholder="请选择所属菜单"
                options={menuList}
                showSearch
                filterOption={(input, option: any) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              />
            </Form.Item>

            <Form.Item name="description" label="描述" rules={[{ max: 200, message: '描述不能超过200个字符' }]}>
              <Input.TextArea placeholder="请输入按钮描述" rows={3} maxLength={200} showCount />
            </Form.Item>

            <Form.Item name="status" label="状态" valuePropName="checked">
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>

            <Form.Item
              name="sortNo"
              label="排序"
              rules={[{ type: 'number', min: 0, max: 9999, message: '排序值必须在0-9999之间' }]}
            >
              <InputNumber placeholder="请输入排序值" min={0} max={9999} className="w-full" />
            </Form.Item>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ButtonModal;
