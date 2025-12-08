import { useQuery } from '@tanstack/react-query';
import { Button, Form, Input, InputNumber, type InputRef, Modal, Space, Switch, TreeSelect } from 'antd';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { menuService } from '@/services/system/menu/menuApi';
import type { MenuModel } from '@/services/system/menu/type';
import type { ButtonFormData } from '@/services/system/permission/PermissionButton/permissionButtonApi';
import { addIcon } from '@/utils/optimized-icons';

// 菜单类型枚举
const MenuType = {
  TOP_LEVEL: 0,
  SUB_MENU: 1,
  SUB_ROUTE: 2,
  PERMISSION_BUTTON: 3,
} as const;

/**
 * 按钮Modal组件Props
 */
interface ButtonModalProps {
  open: boolean;
  button?: MenuModel | null;
  onOk: (formData: ButtonFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * 按钮Modal组件
 * 合并了DragModal和ButtonForm的功能
 */
const ButtonModal: React.FC<ButtonModalProps> = ({ open, button, onOk, onCancel, loading = false }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const nameRef = useRef<InputRef>(null);
  /**
   * 递归处理目录数据，只允许选择子菜单和子路由类型的节点
   */
  const translateDirectory = (data: any[]): any[] => {
    const loop = (items: any[]): any[] =>
      items.map((item) => {
        const iconNode = item.icon ? addIcon(item.icon) : null;

        const newItem: any = {
          ...item,
          value: item.id,
          selectable: item.menuType === MenuType.SUB_MENU || item.menuType === MenuType.SUB_ROUTE, // 子菜单和子路由都可以选择
          title: (
            <Space>
              {iconNode}
              {t(item.title || item.name)}
            </Space>
          ),
        };

        if (Array.isArray(item.children) && item.children.length > 0) {
          newItem.children = loop(item.children);
        }

        return newItem;
      });

    return loop(data);
  };

  /**
   * 查询目录数据
   */
  const { data: allDirectoryData, isLoading } = useQuery({
    queryKey: ['sys_menu_directory'],
    queryFn: async () => {
      return await menuService.getDirectory();
    },
    enabled: open,
  });

  // 根据菜单类型进行过滤并国际化
  const directoryData = useMemo(() => {
    return translateDirectory(allDirectoryData || []);
  }, [allDirectoryData, translateDirectory]);

  /**
   * 初始化表单数据
   */
  useEffect(() => {
    if (!open) {
      return;
    }
    if (button) {
      form.setFieldsValue({
        name: button.name,
        perms: button.perms,
        parentId: button.parentId,
        description: button.description,
        status: button.status,
        sortNo: button.sortNo,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: true,
      });
    }
  }, [button, open]);

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

  const handleAfterOpenChange = (open: boolean) => {
    if (open) {
      nameRef.current?.focus();
    }
  };

  const handleAfterClose = () => {
    form.resetFields();
  };

  return (
    <Modal
      title={button ? '编辑按钮' : '新增按钮'}
      open={open}
      width={600}
      confirmLoading={loading}
      afterOpenChange={handleAfterOpenChange}
      afterClose={handleAfterClose}
      footer={
        <div className="flex justify-end space-x-2">
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleFormSubmit} loading={loading}>
            {button ? '更新' : '保存'}
          </Button>
        </div>
      }
    >
      <div className="h-full">
        <Form form={form} layout="horizontal" labelCol={{ span: 4 }} className="h-full flex flex-col">
          <div className="flex-1 overflow-auto p-4">
            <Form.Item
              name="name"
              label="按钮名称"
              rules={[
                { required: true, message: '请输入按钮名称' },
                { max: 50, message: '按钮名称不能超过50个字符' },
              ]}
            >
              <Input placeholder="请输入按钮名称" ref={nameRef} autoFocus />
            </Form.Item>

            <Form.Item
              name="perms"
              label="权限标识"
              rules={[
                { required: true, message: '请输入权限标识' },
                { pattern: /^[a-zA-Z0-9:_-]+$/, message: '权限标识只能包含字母、数字、冒号、下划线和连字符' },
              ]}
            >
              <Input placeholder="请输入权限标识，如：user:add" />
            </Form.Item>

            <Form.Item name="parentId" label="所属菜单" rules={[{ required: true, message: '请选择所属菜单' }]}>
              <TreeSelect
                showSearch
                loading={isLoading}
                style={{ width: '100%' }}
                styles={{ popup: { root: { maxHeight: 400, overflow: 'auto' } } }}
                placeholder="请选择所属菜单"
                treeData={directoryData}
                treeNodeFilterProp="title"
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
