import { Form, Input, Select, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import DragModal from '@/components/modal/DragModal';
import type { PermissionModel, PermissionResourceModel } from '@/services/system/permission/type';
import { PERM_STATUS_OPTIONS, PERM_TYPE_OPTIONS } from '../constants';
import ResourceBinding from './ResourceBinding';

interface PermissionInfoModalProps {
  open: boolean;
  action: 'add' | 'edit';
  onOk: (values: Partial<PermissionModel>, resources: PermissionResourceModel[]) => void;
  onCancel: () => void;
  permissionInfo: Partial<PermissionModel> | null;
}

/**
 * 权限点信息弹窗
 */
const PermissionInfoModal: React.FC<PermissionInfoModalProps> = ({
  open,
  onOk,
  onCancel,
  permissionInfo,
  action,
}) => {
  const [form] = Form.useForm();
  const [resources, setResources] = useState<PermissionResourceModel[]>([]);

  // 初始化表单数据
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setResources([]);
      return;
    }
    if (permissionInfo) {
      form.setFieldsValue(permissionInfo);
    } else {
      form.setFieldsValue({
        status: 1,
        permType: 'ACTION',
      });
    }
  }, [permissionInfo, open, form]);

  /**
   * 确认回调
   */
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onOk(values, resources);
      })
      .catch((errorInfo) => {
        // 滚动并聚焦到第一个错误字段
        form.scrollToField(errorInfo.errorFields[0].name);
        form.focusField(errorInfo.errorFields[0].name);
      });
  };

  /**
   * 取消回调
   */
  const handleCancel = () => {
    form.resetFields();
    setResources([]);
    onCancel();
  };

  // 资源绑定变化
  const handleResourceChange = (newResources: PermissionResourceModel[]) => {
    setResources(newResources);
  };

  return (
    <DragModal
      title={action === 'add' ? '新增权限点' : '编辑权限点'}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      width={1200}
      maskClosable={false}
    >
      <Tabs
        items={[
          {
            key: 'basic',
            label: '基础信息',
            children: (
              <Form
                form={form}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
                validateMessages={{
                  required: "'${name}'不能为空",
                }}
              >
                <Form.Item label="权限编码" name="permCode" rules={[{ required: true }]}>
                  <Input
                    placeholder="请输入权限编码"
                    disabled={action === 'edit'}
                    autoComplete="off"
                  />
                </Form.Item>

                <Form.Item label="权限名称" name="permName" rules={[{ required: true }]}>
                  <Input placeholder="请输入权限名称" autoComplete="off" />
                </Form.Item>

                <Form.Item label="权限类型" name="permType" rules={[{ required: true }]}>
                  <Select placeholder="请选择权限类型" options={PERM_TYPE_OPTIONS} />
                </Form.Item>

                <Form.Item label="模块编码" name="moduleCode">
                  <Input placeholder="请输入模块编码" autoComplete="off" />
                </Form.Item>

                <Form.Item label="描述" name="description">
                  <Input.TextArea rows={3} placeholder="请输入描述" autoComplete="off" />
                </Form.Item>

                <Form.Item label="状态" name="status" initialValue={1}>
                  <Select options={PERM_STATUS_OPTIONS} />
                </Form.Item>
              </Form>
            ),
          },
          {
            key: 'resource',
            label: '资源绑定',
            children: (
              <ResourceBinding permissionId={permissionInfo?.id} onChange={handleResourceChange} />
            ),
          },
        ]}
      />
    </DragModal>
  );
};

export default PermissionInfoModal;
