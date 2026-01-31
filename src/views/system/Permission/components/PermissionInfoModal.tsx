import { Form, Input, InputNumber, type InputRef, Select, Switch } from 'antd';
import { useEffect, useRef } from 'react';
import DragModal from '@/components/modal/DragModal';
import type { PermissionModel } from '@/services/system/permission/type';
import { resourceTypeOptions } from '../constants';

interface PermissionInfoModalProps {
  /** 弹窗是否打开 */
  open: boolean;
  /** 操作类型 */
  action: 'add' | 'edit' | 'view';
  /** 确认回调 */
  onOk: (values: Partial<PermissionModel>) => void;
  /** 取消回调 */
  onCancel: () => void;
  /** 权限点信息 */
  permissionInfo: Partial<PermissionModel> | null;
}

/**
 * 权限点信息弹窗组件
 * 用于新增、编辑和查看权限点信息
 */
const PermissionInfoModal: React.FC<PermissionInfoModalProps> = ({ open, onOk, onCancel, permissionInfo, action }) => {
  const [form] = Form.useForm();
  const permCodeRef = useRef<InputRef>(null);

  /**
   * 初始化表单数据
   */
  useEffect(() => {
    if (!open) {
      return;
    }
    if (permissionInfo) {
      form.setFieldsValue(permissionInfo);
    }
  }, [permissionInfo, open, form]);

  /**
   * 弹窗打开关闭的回调
   * 打开时聚焦到第一个输入框
   */
  const handleAfterOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      // 延迟聚焦，确保DOM已渲染
      setTimeout(() => {
        permCodeRef.current?.focus({ cursor: 'end' });
      }, 100);
    }
  };

  /**
   * 确认回调
   */
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onOk(values);
      })
      .catch((errorInfo) => {
        // 滚动并聚焦到第一个错误字段
        if (errorInfo.errorFields?.[0]?.name) {
          form.scrollToField(errorInfo.errorFields[0].name);
          form.focusField(errorInfo.errorFields[0].name);
        }
      });
  };

  /**
   * 取消回调
   */
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  /**
   * 获取弹窗标题
   */
  const getTitle = () => {
    switch (action) {
      case 'add':
        return '新增权限点';
      case 'edit':
        return '编辑权限点';
      case 'view':
        return '权限点详情';
      default:
        return '权限点';
    }
  };

  return (
    <DragModal
      title={getTitle()}
      open={open}
      onOk={handleOk}
      okButtonProps={{ disabled: action === 'view' }}
      onCancel={handleCancel}
      width={560}
      afterOpenChange={handleAfterOpenChange}
    >
      <Form
        form={form}
        disabled={action === 'view'}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 18 }}
        validateMessages={{
          required: "'${name}'不能为空",
        }}
        initialValues={{
          resourceType: 1,
          sort: 0,
          status: true,
        }}
      >
        <Form.Item
          label="权限编码"
          name="permCode"
          rules={[
            { required: true },
            { max: 100, message: '权限编码最多100个字符' },
            {
              pattern: /^[a-zA-Z][a-zA-Z0-9:_-]*$/,
              message: '权限编码必须以字母开头，只能包含字母、数字、冒号、下划线和短横线',
            },
          ]}
          tooltip="权限编码是权限点的唯一标识，建议使用 模块:功能:操作 的格式，如 sys:user:add"
        >
          <Input
            ref={permCodeRef}
            placeholder="请输入权限编码，如 sys:permission:add"
            autoFocus
            disabled={action === 'edit'}
          />
        </Form.Item>

        <Form.Item
          label="权限名称"
          name="permName"
          rules={[{ required: true }, { max: 128, message: '权限名称最多128个字符' }]}
        >
          <Input placeholder="请输入权限名称" />
        </Form.Item>

        <Form.Item label="资源类型" name="resourceType" rules={[{ required: true }]}>
          <Select options={resourceTypeOptions} placeholder="请选择资源类型" />
        </Form.Item>

        <Form.Item label="排序" name="sort" tooltip="数值越小排序越靠前">
          <InputNumber min={0} max={9999} className="w-full" placeholder="请输入排序值" />
        </Form.Item>

        <Form.Item label="状态" name="status" valuePropName="checked">
          <Switch checkedChildren="启用" unCheckedChildren="停用" />
        </Form.Item>

        <Form.Item label="描述" name="description" rules={[{ max: 256, message: '描述最多256个字符' }]}>
          <Input.TextArea rows={3} placeholder="请输入权限点描述" showCount maxLength={256} />
        </Form.Item>
      </Form>
    </DragModal>
  );
};

export default PermissionInfoModal;
