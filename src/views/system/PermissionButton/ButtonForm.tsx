import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Select, Switch, InputNumber, Button, Space, App } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import type React from 'react';
import {
  permissionButtonService,
  type PermissionButtonModel,
  type ButtonFormData,
} from '@/services/system/permission/PermissionButton/permissionButtonApi';
import { menuService } from '@/services/system/menu/menuApi';

/**
 * 按钮表单组件Props
 */
interface ButtonFormProps {
  button?: PermissionButtonModel | null;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * 按钮表单组件
 * 用于新增和编辑权限按钮
 */
const ButtonForm: React.FC<ButtonFormProps> = ({ button, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  /**
   * 查询菜单选项
   */
  const { data: menuList } = useMutation({
    mutationFn: () => menuService.getAllMenus({}),
    onSuccess: (menus) => {
      return menus.map((menu) => ({
        label: menu.name,
        value: menu.id,
      }));
    },
  });

  /**
   * 保存按钮的mutation
   */
  const saveButtonMutation = useMutation({
    mutationFn: (data: ButtonFormData) => {
      if (button?.id) {
        return permissionButtonService.updateButton({ ...data, id: button.id });
      } else {
        return permissionButtonService.addButton(data);
      }
    },
    onSuccess: () => {
      message.success(button?.id ? '按钮更新成功' : '按钮创建成功');
      queryClient.invalidateQueries({ queryKey: ['permission-buttons'] });
      onSave();
    },
    onError: (error: any) => {
      message.error(error.message || '操作失败');
    },
  });

  /**
   * 初始化表单数据
   */
  useEffect(() => {
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
  }, [button, form]);

  /**
   * 处理表单提交
   * @param values 表单值
   */
  const handleSubmit = async (values: any) => {
    try {
      const formData: ButtonFormData = {
        name: values.name,
        code: values.code,
        menuId: values.menuId,
        description: values.description,
        status: values.status ?? true,
        sortNo: values.sortNo ?? 0,
      };

      await saveButtonMutation.mutateAsync(formData);
    } catch (error) {
      console.error('保存按钮失败:', error);
    }
  };

  /**
   * 处理取消
   */
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <div className="h-full">
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="h-full flex flex-col">
        <div className="flex-1 overflow-auto p-4">
          <Form.Item
            name="name"
            label="按钮名称"
            rules={[
              { required: true, message: '请输入按钮名称' },
              { max: 50, message: '按钮名称不能超过50个字符' },
            ]}
          >
            <Input placeholder="请输入按钮名称" />
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

        <div className="border-t border-gray-200 p-4">
          <Space className="w-full justify-end">
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saveButtonMutation.isPending}>
              {button?.id ? '更新' : '保存'}
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default ButtonForm;
