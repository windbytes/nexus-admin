import type React from 'react';
import { useEffect, useMemo } from 'react';
import { Modal, Form, Input, Select, Checkbox, Button, message, Typography } from 'antd';
import type { CreateVersionParams } from '@/services/integrated/version/model';
import { useVersionList, useCreateVersion } from '@/views/integrated/Versions/useVersionQueries';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

interface CreateVersionModalProps {
  visible: boolean;
  onClose: () => void;
  workflowId: string;
  currentVersion?: string;
}

const CreateVersionModal: React.FC<CreateVersionModalProps> = ({
  visible,
  onClose,
  workflowId,
  currentVersion = 'v2.1.0',
}) => {
  const [form] = Form.useForm();

  // 使用 React Query 获取版本列表
  const { data: versionResult } = useVersionList(
    {
      workflowId,
      pageNum: 1,
      pageSize: 100,
    },
    visible,
  );

  // 版本数据
  const versions = versionResult?.records || [];

  // 创建版本 mutation
  const createVersionMutation = useCreateVersion();

  useEffect(() => {
    if (visible) {
      form.resetFields();
      // 设置默认的基于版本
      form.setFieldsValue({
        basedOnVersion: currentVersion,
      });
    }
  }, [visible, currentVersion, form]);

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const params: CreateVersionParams = {
        workflowId,
        versionType: values.versionType,
        version: values.version,
        versionName: values.versionName,
        description: values.description,
        basedOnVersion: values.basedOnVersion,
        publishImmediately: values.publishImmediately || false,
      };

      createVersionMutation.mutate(params, {
        onSuccess: () => {
          onClose();
        },
      });
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error('创建版本失败');
    }
  };

  // 版本类型选项，使用 useMemo 避免不必要的重新计算
  const versionTypeOptions = useMemo(() => {
    // 只有在弹窗打开时才获取表单值，避免警告
    let versionType: string | undefined, basedOnVersion: string | undefined;
    if (visible) {
      try {
        versionType = form.getFieldValue('versionType');
        basedOnVersion = form.getFieldValue('basedOnVersion');
      } catch (error) {
        // 如果表单还没有初始化，忽略错误
        console.debug('Form not initialized yet:', error);
      }
    }

    // 根据基础版本自动建议版本类型
    if (basedOnVersion && !versionType) {
      const baseVersion = versions.find((v) => v.version === basedOnVersion);
      if (baseVersion) {
        // @todo 这里可以根据版本号规则自动建议下一个版本类型
        // @todo 简化处理，提供所有选项
      }
    }

    return [
      { value: 'PATCH', label: '补丁版本 (v2.1.1)', description: '修复bug，向后兼容' },
      { value: 'MINOR', label: '次版本 (v2.2.0)', description: '新功能，向后兼容' },
      { value: 'MAJOR', label: '主版本 (v3.0.0)', description: '重大变更，可能不兼容' },
      { value: 'HOTFIX', label: '热修复 (v2.1.1-hotfix)', description: '紧急修复' },
    ];
  }, [visible, versions]);

  return (
    <Modal
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            创建版本
          </Title>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={600}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="versionType" label="版本类型" rules={[{ required: true, message: '请选择版本类型' }]}>
          <Select placeholder="选择版本类型">
            {versionTypeOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="versionName"
          label="版本名称"
          rules={[
            { required: true, message: '请输入版本名称' },
            { max: 255, message: '版本名称不能超过255个字符' },
          ]}
        >
          <Input placeholder="输入版本名称..." />
        </Form.Item>

        <Form.Item name="version" label="版本号" rules={[{ required: true, message: '请输入版本号' }]}>
          <Input placeholder="输入版本号..." />
        </Form.Item>

        <Form.Item name="description" label="版本描述" rules={[{ max: 1000, message: '版本描述不能超过1000个字符' }]}>
          <TextArea placeholder="描述本次版本的主要变更..." rows={4} showCount maxLength={1000} />
        </Form.Item>

        <Form.Item name="basedOnVersion" label="基于版本" rules={[{ required: true, message: '请选择基于版本' }]}>
          <Select placeholder="选择基于版本">
            {versions.map((version) => (
              <Option key={version.version} value={version.version}>
                {version.version} {version.versionName && `(${version.versionName})`}
                {version.version === currentVersion && ' (当前版本)'}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="publishImmediately" valuePropName="checked">
          <Checkbox>创建后立即发布</Checkbox>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={createVersionMutation.isPending}>
            创建版本
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateVersionModal;
