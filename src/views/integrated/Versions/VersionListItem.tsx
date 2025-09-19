import type React from 'react';
import { memo, useCallback } from 'react';
import { Card, Row, Col, Tag, Typography, Button, Space, theme } from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  SwapOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { WorkflowVersion } from '@/services/integrated/version/model';
import { VersionStatus, VersionType } from '@/services/integrated/version/model';

const { Title, Text } = Typography;

interface VersionListItemProps {
  version: WorkflowVersion;
  isCurrentVersion?: boolean;
  onViewVersion?: (version: WorkflowVersion) => void;
  onEditVersion?: (version: WorkflowVersion) => void;
  onPublishVersion?: (version: WorkflowVersion) => void;
  onDeleteVersion?: (version: WorkflowVersion) => void;
  onRollbackVersion?: (version: WorkflowVersion) => void;
  onCompareVersion?: (version: WorkflowVersion) => void;
  onDownloadVersion?: (version: WorkflowVersion) => void;
  isPublishing?: boolean;
  isDeleting?: boolean;
  isRollingBack?: boolean;
}

/**
 * 版本列表项
 * @param props
 * @param props.version 版本
 * @param props.isCurrentVersion 是否当前版本
 * @param props.onViewVersion 查看版本
 * @param props.onEditVersion 编辑版本
 * @param props.onPublishVersion 发布版本
 * @param props.onDeleteVersion 删除版本
 * @param props.onRollbackVersion 回滚版本
 * @param props.onCompareVersion 对比版本
 * @param props.onDownloadVersion 下载版本
 * @param props.isPublishing 是否发布中
 * @param props.isDeleting 是否删除中
 * @param props.isRollingBack 是否回滚中
 */
const VersionListItem: React.FC<VersionListItemProps> = memo(
  ({
    version,
    isCurrentVersion = false,
    onViewVersion,
    onEditVersion,
    onPublishVersion,
    onDeleteVersion,
    onRollbackVersion,
    onCompareVersion,
    onDownloadVersion,
    isPublishing = false,
    isDeleting = false,
    isRollingBack = false,
  }) => {
    const { token } = theme.useToken();

    // 获取状态信息
    const getStatusInfo = useCallback((status: number) => {
      switch (status) {
        case VersionStatus.DRAFT:
          return { text: '草稿', color: '#faad14', icon: '📝' };
        case VersionStatus.PUBLISHED:
          return { text: '已发布', color: '#52c41a', icon: '✅' };
        case VersionStatus.DEPRECATED:
          return { text: '已弃用', color: '#ff4d4f', icon: '⚠️' };
        case VersionStatus.ARCHIVED:
          return { text: '已归档', color: '#8c8c8c', icon: '📦' };
        default:
          return { text: '未知', color: '#8c8c8c', icon: '❓' };
      }
    }, []);

    // 获取版本类型文本
    const getVersionTypeText = useCallback((type: VersionType) => {
      switch (type) {
        case VersionType.MAJOR:
          return '主版本';
        case VersionType.MINOR:
          return '次版本';
        case VersionType.PATCH:
          return '补丁版本';
        case VersionType.HOTFIX:
          return '热修复';
        default:
          return '未知';
      }
    }, []);

    // 格式化日期
    const formatDate = useCallback((date: string | Date) => {
      const d = new Date(date);
      return d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }, []);

    // 格式化文件大小
    const formatFileSize = useCallback((bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    }, []);

    // 渲染操作按钮
    const renderActionButtons = useCallback(() => {
      const buttons = [];
      const status = version.status;

      // 查看按钮 - 所有版本都有
      buttons.push(
        <Button key="view" type="text" icon={<EyeOutlined />} onClick={() => onViewVersion?.(version)}>
          查看
        </Button>,
      );

      // 根据状态显示不同按钮
      if (status === VersionStatus.DRAFT) {
        // 草稿状态：编辑、发布、删除
        buttons.push(
          <Button key="edit" type="text" icon={<EditOutlined />} onClick={() => onEditVersion?.(version)}>
            编辑
          </Button>,
          <Button
            key="publish"
            type="primary"
            icon={<CloudUploadOutlined />}
            loading={isPublishing}
            onClick={() => onPublishVersion?.(version)}
          >
            发布
          </Button>,
          <Button
            key="delete"
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={isDeleting}
            onClick={() => onDeleteVersion?.(version)}
          >
            删除
          </Button>,
        );
      } else if (status === VersionStatus.PUBLISHED) {
        // 已发布状态：回滚、对比、下载
        buttons.push(
          <Button
            key="rollback"
            type="primary"
            icon={<SwapOutlined />}
            loading={isRollingBack}
            onClick={() => onRollbackVersion?.(version)}
          >
            回滚
          </Button>,
          <Button key="compare" type="text" icon={<SwapOutlined />} onClick={() => onCompareVersion?.(version)}>
            对比
          </Button>,
          <Button key="download" type="text" icon={<DownloadOutlined />} onClick={() => onDownloadVersion?.(version)}>
            下载
          </Button>,
        );
      } else {
        // 其他状态：对比、下载
        buttons.push(
          <Button key="compare" type="text" icon={<SwapOutlined />} onClick={() => onCompareVersion?.(version)}>
            对比
          </Button>,
          <Button key="download" type="text" icon={<DownloadOutlined />} onClick={() => onDownloadVersion?.(version)}>
            下载
          </Button>,
        );
      }

      return <Space>{buttons}</Space>;
    }, [
      version,
      isPublishing,
      isDeleting,
      isRollingBack,
      onViewVersion,
      onEditVersion,
      onPublishVersion,
      onDeleteVersion,
      onRollbackVersion,
      onCompareVersion,
      onDownloadVersion,
    ]);

    const statusInfo = getStatusInfo(version.status);

    return (
      <Card
        hoverable
        style={{
          border: isCurrentVersion ? `2px solid ${token.colorPrimary}` : undefined,
          position: 'relative',
        }}
      >
        <Row gutter={16} align="middle">
          <Col flex="none">
            <Tag color={version.versionType === 'MAJOR' ? 'blue' : 'green'}>{version.version}</Tag>
          </Col>
          <Col flex="auto">
            <div>
              <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                {version.versionName}
                {isCurrentVersion && (
                  <Tag color="green" style={{ marginLeft: 8 }}>
                    当前版本
                  </Tag>
                )}
              </Title>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: statusInfo.color }}>{statusInfo.icon}</span>
                  <Text type="secondary">{statusInfo.text}</Text>
                </div>
                <Text type="secondary">{getVersionTypeText(version.versionType as any)}</Text>
                <Text type="secondary">创建人：{version.createBy}</Text>
                <Text type="secondary">{formatDate(version.createTime)}</Text>
                <Text type="secondary">{formatFileSize(version.fileSize)}</Text>
              </div>
            </div>
          </Col>
          <Col flex="none">{renderActionButtons()}</Col>
        </Row>
      </Card>
    );
  },
);

VersionListItem.displayName = 'VersionListItem';

export default VersionListItem;
