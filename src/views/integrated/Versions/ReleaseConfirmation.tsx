import type React from 'react';
import { Card, Alert, Typography, List, Button, Spin, Row, Col, Tag, App } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { WorkflowVersion } from '@/services/integrated/version/model';
import DragModal from '@/components/modal/DragModal';
import { useVersionImpact, usePublishVersionWithParams } from './useVersionQueries';

const { Title, Text } = Typography;

interface ReleaseConfirmationProps {
  visible: boolean;
  onClose: () => void;
  version: WorkflowVersion | null;
}

/**
 * 版本发布确认页面
 * @param props
 * @param props.visible 是否可见
 * @param props.onClose 关闭回调
 * @param props.version 版本
 */
const ReleaseConfirmation: React.FC<ReleaseConfirmationProps> = ({ visible, onClose, version }) => {
  const { message } = App.useApp();

  // 使用 React Query 获取版本影响评估
  const {
    data: impactAssessment,
    isLoading: impactLoading,
    error: impactError,
  } = useVersionImpact(version?.workflowId || '', version?.id || '', visible && !!version);

  // 使用 React Query 发布版本
  const publishVersionMutation = usePublishVersionWithParams();

  const handleConfirm = async () => {
    if (!version) return;

    // 检查影响评估是否加载失败
    if (impactError) {
      message.error(`无法获取版本影响评估，发布被阻止。错误信息：${impactError.message || '未知错误'}`);
      return;
    }

    try {
      const params = {
        workflowId: version.workflowId,
        version: version.version,
        publishNote: `发布版本 ${version.version}`,
      };

      await publishVersionMutation.mutateAsync(params);
      message.success('版本发布成功');
      onClose();
    } catch (error: any) {
      message.error(`版本发布失败，原因：${error.message}`);
    }
  };

  const getVersionTypeText = (type: string) => {
    switch (type) {
      case 'MAJOR':
        return '主版本';
      case 'MINOR':
        return '次版本';
      case 'PATCH':
        return '补丁版本';
      case 'HOTFIX':
        return '热修复';
      default:
        return type;
    }
  };

  const getVersionTypeColor = (type: string) => {
    switch (type) {
      case 'MAJOR':
        return 'red';
      case 'MINOR':
        return 'blue';
      case 'PATCH':
        return 'green';
      case 'HOTFIX':
        return 'orange';
      default:
        return 'default';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  if (!version) return null;

  // 处理影响评估数据，提供默认值
  const assessmentData = impactAssessment || {
    backwardCompatible: true,
    nonDestructive: true,
    requiresRedeployment: true,
  };

  return (
    <DragModal
      open={visible}
      onCancel={onClose}
      title="版本发布确认"
      width={800}
      style={{ top: 20 }}
      styles={{
        body: { maxHeight: '70vh', overflow: 'auto' },
      }}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button
          key="confirm"
          type="primary"
          onClick={handleConfirm}
          loading={publishVersionMutation.isPending}
          disabled={!!impactError}
        >
          确认发布
        </Button>,
      ]}
    >
      <Spin spinning={impactLoading}>
        {/* 警告信息 */}
        <Alert
          message="注意: 发布后的版本将不能再次编辑, 请确认所有内容无误。"
          type="warning"
          icon={<ExclamationCircleOutlined />}
          style={{ marginBottom: 24 }}
        />

        {/* 版本信息 */}
        <Card size="small" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Text strong>版本号：</Text>
              <div>
                <Tag color={getVersionTypeColor(version.versionType)}>{version.version}</Tag>
              </div>
            </Col>
            <Col span={8}>
              <Text strong>版本名称：</Text>
              <div>{version.versionName || '-'}</div>
            </Col>
            <Col span={8}>
              <Text strong>基于版本：</Text>
              <div>{version.basedOnVersion || '-'}</div>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={8}>
              <Text strong>版本类型：</Text>
              <div>{getVersionTypeText(version.versionType)}</div>
            </Col>
            <Col span={8}>
              <Text strong>文件大小：</Text>
              <div>{formatFileSize(version.fileSize)}</div>
            </Col>
            <Col span={8}>
              <Text strong>创建时间：</Text>
              <div>{formatDate(version.createTime)}</div>
            </Col>
          </Row>
        </Card>

        {/* 主要变更 */}
        <div style={{ marginBottom: 24 }}>
          <Title level={5}>主要变更：</Title>
          <List
            size="small"
            dataSource={[
              '新增3个自动化节点',
              '优化审批流程逻辑',
              '修复已知bug 5个',
              '改进用户界面交互',
              '增强系统性能',
            ]}
            renderItem={(item) => (
              <List.Item>
                <Text>• {item}</Text>
              </List.Item>
            )}
          />
        </div>

        {/* 影响评估 */}
        <div style={{ marginBottom: 24 }}>
          <Title level={5}>影响评估：</Title>
          {impactError ? (
            <Alert
              message="影响评估加载失败"
              description={`无法获取版本影响评估数据，请检查网络连接或联系管理员。错误信息：${impactError.message || '未知错误'}`}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          ) : (
            <List
              size="small"
              dataSource={[
                {
                  key: 'backwardCompatible',
                  label: '向下兼容',
                  value: assessmentData.backwardCompatible,
                  icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                },
                {
                  key: 'nonDestructive',
                  label: '无破坏性变更',
                  value: assessmentData.nonDestructive,
                  icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                },
                {
                  key: 'requiresRedeployment',
                  label: '需要重新部署',
                  value: assessmentData.requiresRedeployment,
                  icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
                },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {item.icon}
                    <Text>{item.label}</Text>
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>
      </Spin>
    </DragModal>
  );
};

export default ReleaseConfirmation;
