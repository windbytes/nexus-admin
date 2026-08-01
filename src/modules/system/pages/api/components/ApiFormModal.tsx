/**
 * @file 系统接口注册项新增/编辑弹窗
 */

import { Form, Input, Select, Switch, TreeSelect } from 'antd';
import { type ComponentProps, useEffect, useMemo } from 'react';
import type { ApiModel, ApiSaveParams } from '@/shared/api/system/api/type';
import type { PermissionModel } from '@/shared/api/system/permission/type';
import DragModal from '@/shared/components/modal/DragModal';
import { METHOD_OPTIONS } from '../constants';

export interface ApiFormModalProps {
  open: boolean;
  /** 编辑时的接口数据 */
  record?: Partial<ApiModel> | null;
  /** 权限点树（分组 + 接口权限点），用于绑定权限点选择 */
  permTree: PermissionModel[];
  onOk: (values: ApiSaveParams) => void | Promise<void>;
  onClose: () => void;
}

/**
 * 权限点树转 TreeSelect 数据（分组节点仅作层级展示，不可选）。
 *
 * @param nodes - 权限点树节点
 * @returns TreeSelect treeData
 */
function buildPermTreeData(nodes: PermissionModel[]): NonNullable<ComponentProps<typeof TreeSelect>['treeData']> {
  return nodes.map((node) => ({
    value: node.id,
    title: `${node.permName}（${node.permCode}）`,
    disabled: node.permType !== 2,
    children: node.children?.length ? buildPermTreeData(node.children) : undefined,
  }));
}

/**
 * 系统接口注册项新增/编辑弹窗：permId 为空表示仅认证即可访问。
 *
 * @param props - 开关、行数据、权限点树与回调
 * @returns DragModal + 表单
 */
function ApiFormModal({ open, record, permTree, onOk, onClose }: ApiFormModalProps) {
  const [form] = Form.useForm();
  const isEdit = !!record?.id;
  const permTreeData = useMemo(() => buildPermTreeData(permTree), [permTree]);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (isEdit && record) {
      form.setFieldsValue({
        apiName: record.apiName,
        path: record.path,
        method: record.method,
        permId: record.permId ?? undefined,
        isPublic: record.isPublic ?? false,
        status: record.status ?? true,
        remark: record.remark ?? '',
      });
    } else {
      form.setFieldsValue({
        method: 'POST',
        isPublic: false,
        status: true,
        remark: '',
      });
    }
  }, [open, isEdit, record, form]);

  /**
   * 校验并提交表单。
   */
  async function handleSubmit() {
    try {
      const values = await form.validateFields();
      const payload: ApiSaveParams = {
        id: record?.id,
        apiName: values.apiName?.trim(),
        path: values.path?.trim(),
        method: values.method,
        permId: values.permId ?? undefined,
        isPublic: values.isPublic ?? false,
        status: values.status ?? true,
        remark: values.remark?.trim() ?? '',
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
      <Form form={form} labelCol={{ span: 5 }}>
        <Form.Item
          name="apiName"
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
          <Input placeholder="如：/system/user/addUser" maxLength={200} showCount />
        </Form.Item>
        <Form.Item name="method" label="请求方法" rules={[{ required: true, message: '请选择请求方法' }]}>
          <Select options={METHOD_OPTIONS} placeholder="GET / POST / PUT / DELETE 等" allowClear={false} />
        </Form.Item>
        <Form.Item
          name="permId"
          label="绑定权限点"
          extra="留空表示登录即可访问；绑定后需角色授予对应接口权限点"
        >
          <TreeSelect
            treeData={permTreeData}
            placeholder="选择接口权限点，可选"
            allowClear
            showSearch
            treeDefaultExpandAll
            treeNodeFilterProp="title"
          />
        </Form.Item>
        <Form.Item name="remark" label="描述" rules={[{ max: 64, message: '最多64个字符' }]}>
          <Input.TextArea placeholder="接口说明" maxLength={64} showCount rows={2} />
        </Form.Item>
        <Form.Item name="isPublic" label="是否公开" valuePropName="checked" initialValue={false}>
          <Switch checkedChildren="公开（免认证）" unCheckedChildren="需鉴权" />
        </Form.Item>
        <Form.Item name="status" label="状态" valuePropName="checked" initialValue={true}>
          <Switch checkedChildren="启用" unCheckedChildren="停用" />
        </Form.Item>
      </Form>
    </DragModal>
  );
}

export default ApiFormModal;
