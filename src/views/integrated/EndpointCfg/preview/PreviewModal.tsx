import type { EndpointTypeConfig } from '@/services/integrated/endpointConfig/endpointConfigApi';
import { CloseOutlined, CodeOutlined, EyeOutlined, FileTextOutlined, SaveOutlined } from '@ant-design/icons';
import { App, Badge, Button, Divider, Empty, Form, Modal, Space, Tabs } from 'antd';
import React, { memo, useState } from 'react';
import PreviewFormRenderer from './PreviewFormRenderer';

interface PreviewModalProps {
  /** 是否显示 */
  visible: boolean;
  /** 端点配置数据 */
  config: EndpointTypeConfig | null;
  /** 关闭回调 */
  onClose: () => void;
}

/**
 * 预览弹窗组件
 * 根据端点配置生成预览表单
 * 支持多种作用模式的切换预览
 * 使用 memo 因为组件被懒加载
 */
const PreviewModal: React.FC<PreviewModalProps> = memo(({ visible, config, onClose }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>('IN');
  const [viewMode, setViewMode] = useState<'form' | 'json'>('form');

  /**
   * 获取表单数据并返回
   */
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // 展示保存的数据
      Modal.info({
        title: '表单数据预览',
        width: 700,
        content: (
          <div>
            <p className="text-gray-600 mb-4">这是根据配置生成的表单数据：</p>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 border border-gray-200">
              {JSON.stringify(values, null, 2)}
            </pre>
          </div>
        ),
        okText: '关闭',
        icon: <CodeOutlined className="text-blue-500" />,
      });

      message.success('表单验证通过！');
    } catch (error: any) {
      message.error('请完善表单信息');
      console.error('表单验证失败:', error);
    }
  };

  /**
   * 重置表单
   */
  const handleReset = () => {
    form.resetFields();
    message.info('表单已重置');
  };

  /**
   * 渲染配置的 JSON 视图
   */
  const renderJsonView = () => {
    if (!config) return null;

    return (
      <div className="json-view-container">
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-4 border border-blue-100">
          <h4 className="text-base font-semibold text-gray-800 mb-2 flex items-center">
            <FileTextOutlined className="mr-2 text-blue-500" />
            端点配置信息
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">类型名称：</span>
              <span className="font-medium text-gray-800">{config.typeName}</span>
            </div>
            <div>
              <span className="text-gray-500">类型编码：</span>
              <span className="font-medium text-gray-800">{config.typeCode}</span>
            </div>
            <div>
              <span className="text-gray-500">Schema版本：</span>
              <span className="font-medium text-gray-800">{config.schemaVersion}</span>
            </div>
            <div>
              <span className="text-gray-500">字段数量：</span>
              <span className="font-medium text-gray-800">{config.schemaFields?.length || 0} 个</span>
            </div>
          </div>
        </div>

        <Divider orientation="left" className="text-sm">
          完整配置 JSON
        </Divider>

        <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-auto max-h-[500px] text-sm leading-relaxed shadow-inner">
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>
    );
  };

  /**
   * 根据模式获取对应的字段数量
   */
  const getFieldCountByMode = (mode: string) => {
    if (!config?.schemaFields) return 0;
    return config.schemaFields.filter((field) => !field.mode || field.mode.includes(mode)).length;
  };

  /**
   * 生成 Tab 项
   */
  const tabItems = React.useMemo(() => {
    if (!config?.supportMode || config.supportMode.length === 0) {
      return [
        {
          key: 'default',
          label: '默认模式',
          children: <PreviewFormRenderer form={form} fields={config?.schemaFields || []} initialValues={{}} />,
        },
      ];
    }

    return config.supportMode.map((mode) => {
      const fieldCount = getFieldCountByMode(mode);

      return {
        key: mode,
        label: (
          <span className="flex items-center gap-2">
            {mode}
            <Badge count={fieldCount} showZero style={{ backgroundColor: '#52c41a' }} />
          </span>
        ),
        children: (
          <PreviewFormRenderer form={form} fields={config?.schemaFields || []} mode={mode} initialValues={{}} />
        ),
      };
    });
  }, [config, form]);

  /**
   * 弹窗关闭后重置状态
   */
  const handleModalClose = () => {
    form.resetFields();
    setActiveTab('IN');
    setViewMode('form');
    onClose();
  };

  if (!config) {
    return null;
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <EyeOutlined className="text-blue-500 text-xl" />
          <span className="text-lg font-semibold">配置预览</span>
          <span className="text-sm font-normal text-gray-500">
            {config.typeName} ({config.typeCode})
          </span>
        </div>
      }
      open={visible}
      onCancel={handleModalClose}
      width={1200}
      centered
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto',
          padding: '24px',
        },
      }}
      footer={
        <div className="flex justify-between items-center">
          <Space>
            <Button
              type={viewMode === 'form' ? 'primary' : 'default'}
              size="small"
              onClick={() => setViewMode('form')}
              icon={<FileTextOutlined />}
            >
              表单视图
            </Button>
            <Button
              type={viewMode === 'json' ? 'primary' : 'default'}
              size="small"
              onClick={() => setViewMode('json')}
              icon={<CodeOutlined />}
            >
              JSON视图
            </Button>
          </Space>

          <Space>
            {viewMode === 'form' && (
              <>
                <Button onClick={handleReset}>重置表单</Button>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                  验证并查看数据
                </Button>
              </>
            )}
            <Button icon={<CloseOutlined />} onClick={handleModalClose}>
              关闭
            </Button>
          </Space>
        </div>
      }
    >
      {viewMode === 'form' ? (
        <div className="preview-modal-content">
          {/* 配置信息展示 */}
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6 border border-blue-100 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">端点类型</span>
                <span className="font-semibold text-gray-800 truncate" title={config.endpointType}>
                  {config.endpointType}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Schema版本</span>
                <span className="font-semibold text-gray-800">{config.schemaVersion}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">字段总数</span>
                <span className="font-semibold text-gray-800">{config.schemaFields?.length || 0} 个</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">状态</span>
                <span className={`font-semibold ${config.status ? 'text-green-600' : 'text-red-600'}`}>
                  {config.status ? '已启用' : '已禁用'}
                </span>
              </div>
            </div>

            {config.description && (
              <div className="mt-3 pt-3 border-t border-blue-100">
                <span className="text-xs text-gray-500">描述：</span>
                <p className="text-sm text-gray-700 mt-1 leading-relaxed">{config.description}</p>
              </div>
            )}
          </div>

          {/* 表单内容区域 */}
          <div className="form-content-area bg-white rounded-lg border border-gray-200 p-6">
            {config.schemaFields && config.schemaFields.length > 0 ? (
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                size="large"
                tabBarStyle={{
                  marginBottom: 24,
                }}
              />
            ) : (
              <Empty description="暂无字段配置" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        </div>
      ) : (
        renderJsonView()
      )}

      <style>{`
        .preview-modal-content {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .json-view-container {
          animation: fadeIn 0.3s ease-in-out;
        }

        .ant-tabs-tab {
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .ant-tabs-tab:hover {
          color: #1890ff;
        }

        .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #1890ff;
          font-weight: 600;
        }

        .form-content-area {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </Modal>
  );
});

PreviewModal.displayName = 'PreviewModal';

export default PreviewModal;
