import type { InputRef, TabsProps } from 'antd';
import { Form, Tabs } from 'antd';
import type React from 'react';
import { useRef } from 'react';
import DragModal from '@/components/modal/DragModal';
import BasicInfoForm from './components/BasicInfoForm';
import ConfigInfoForm from './components/ConfigInfoForm';
import RetryStrategyForm from './components/RetryStrategyForm';
import TestTab from './components/TestTab';
import { useEndpointForm } from './hooks/useEndpointForm';
import { useEndpointTypeConfig } from './hooks/useEndpointTypeConfig';
import { useTestTab } from './hooks/useTestTab';
import type { EndpointModalProps } from './types';

/**
 * 端点信息弹窗
 * @todo 需要调整结构，采用分步表单配置
 */
const EndpointModal: React.FC<EndpointModalProps> = ({
  open,
  title,
  loading,
  initialValues,
  isViewMode,
  onOk,
  onCancel,
}) => {
  const nameRef = useRef<InputRef | null>(null);
  const [form] = Form.useForm();
  // 使用端点表单 Hook
  const endpointForm = useEndpointForm(open, initialValues, form, onOk);

  // 使用端点类型配置 Hook
  const endpointTypeConfig = useEndpointTypeConfig(
    open,
    endpointForm.endpointTypeName,
    endpointForm.selectedMode,
    form,
    initialValues
  );

  // 使用测试 Tab Hook
  const testTab = useTestTab();

  /**
   * 窗口打开聚焦
   */
  const handleOpenChange = (open: boolean) => {
    if (open) {
      nameRef.current?.focus();
    }
  };

  // Tab配置
  const tabItems: TabsProps['items'] = [
    {
      key: 'config',
      label: '属性配置',
      children: (
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          disabled={isViewMode || false}
          onValuesChange={endpointForm.handleValuesChange}
        >
          {/* 基础信息区域 */}
          <BasicInfoForm
            endpointTypeConfig={endpointTypeConfig}
            initialValues={initialValues}
            endpointTypeName={endpointForm.endpointTypeName}
            nameRef={nameRef}
          />

          {/* 配置信息区域 - 只有选择了端点类型和模式后才显示 */}
          {endpointForm.endpointTypeName &&
            endpointForm.selectedMode &&
            endpointTypeConfig.selectedEndpointTypeConfig && (
              <ConfigInfoForm
                formValues={endpointForm.formValues}
                schemaFields={endpointTypeConfig.schemaFields}
                selectedMode={endpointForm.selectedMode}
              />
            )}

          {/* 重试策略表单 */}
          {endpointTypeConfig.selectedEndpointTypeConfig?.supportRetry && (
            <RetryStrategyForm useExponentialBackoff={endpointForm.useExponentialBackoff} />
          )}
        </Form>
      ),
    },
    {
      key: 'test',
      label: '测试',
      children: <TestTab testTab={testTab} />,
    },
  ];

  return (
    <DragModal
      title={title}
      open={open}
      onOk={() => endpointForm.handleOk()}
      onCancel={onCancel}
      confirmLoading={loading}
      width={900}
      maskClosable={false}
      centered
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto',
        },
      }}
      afterOpenChange={handleOpenChange}
    >
      <Tabs defaultActiveKey="config" type="card" items={tabItems} />
    </DragModal>
  );
};

export default EndpointModal;
