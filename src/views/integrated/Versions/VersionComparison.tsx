import type React from 'react';
import { useState } from 'react';
import { Select, Typography, Row, Col, Alert, Spin } from 'antd';
import DragModal from '@/components/modal/DragModal';
import { DiffEditor } from '@/components/DiffEditor';
import { useVersionList, useCompareVersions } from './useVersionQueries';

const { Option } = Select;
const { Title, Text } = Typography;

/**
 * 版本对比Props
 */
interface VersionComparisonProps {
  workflowId: string;
  visible: boolean;
  onClose: () => void;
  baseVersion?: string;
  targetVersion?: string;
}

/**
 * 版本对比
 */
const VersionComparison: React.FC<VersionComparisonProps> = ({
  workflowId,
  visible,
  onClose,
  baseVersion: initialBaseVersion,
  targetVersion: initialTargetVersion,
}) => {
  const [baseVersion, setBaseVersion] = useState<string>(initialBaseVersion || '');
  const [targetVersion, setTargetVersion] = useState<string>(initialTargetVersion || '');
  // 使用 React Query 获取版本列表
  const { data: versionResult } = useVersionList(
    {
      workflowId,
      pageNum: 1,
      pageSize: 100,
    },
    visible,
  );

  const versions = versionResult?.records || [];

  // 使用 React Query 获取版本对比数据
  const { data: comparisonResult, isLoading: comparisonLoading } = useCompareVersions(
    {
      workflowId,
      baseVersion,
      targetVersion,
    },
    visible && !!baseVersion && !!targetVersion && baseVersion !== targetVersion,
  );

  const deltas = comparisonResult?.deltas || [];

  const generateOriginalContent = () => {
    return JSON.stringify(
      {
        nodes: [
          {
            id: 'start_node',
            name: '开始节点',
            type: 'start',
          },
          {
            id: 'process_node',
            name: '处理节点',
            timeout: 300,
          },
        ],
      },
      null,
      2,
    );
  };

  const generateModifiedContent = () => {
    return JSON.stringify(
      {
        nodes: [
          {
            id: 'start_node',
            name: '流程开始',
            type: 'start',
          },
          {
            id: 'validation_node',
            name: '数据验证',
            type: 'validation',
          },
          {
            id: 'process_node',
            name: '处理节点',
            timeout: 600,
          },
        ],
      },
      null,
      2,
    );
  };

  const getChangeSummary = () => {
    const addCount = deltas.filter((d) => d.deltaType === 'ADD').length;
    const modifyCount = deltas.filter((d) => d.deltaType === 'MODIFY').length;
    const deleteCount = deltas.filter((d) => d.deltaType === 'DELETE').length;

    return {
      add: addCount,
      modify: modifyCount,
      delete: deleteCount,
      total: addCount + modifyCount + deleteCount,
    };
  };

  if (!visible) return null;

  const summary = getChangeSummary();

  return (
    <DragModal
      open={visible}
      onCancel={onClose}
      width="90%"
      style={{ maxWidth: '1200px' }}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            版本对比
          </Title>
        </div>
      }
      footer={null}
    >
      <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
        {/* 版本选择 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Text strong>基础版本：</Text>
            <Select
              value={baseVersion}
              onChange={setBaseVersion}
              style={{ width: '100%', marginTop: 8 }}
              placeholder="选择基础版本"
            >
              {versions.map((version) => (
                <Option key={version.version} value={version.version}>
                  {version.version} - {version.versionName}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={12}>
            <Text strong>目标版本：</Text>
            <Select
              value={targetVersion}
              onChange={setTargetVersion}
              style={{ width: '100%', marginTop: 8 }}
              placeholder="选择目标版本"
            >
              {versions.map((version) => (
                <Option key={version.version} value={version.version}>
                  {version.version} - {version.versionName}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        {/* 变更摘要 */}
        {summary.total > 0 && (
          <Alert
            message={`变更摘要: ${summary.modify}个节点修改, ${summary.add}个节点新增, ${summary.delete}个节点删除`}
            type="info"
            style={{ marginBottom: 16 }}
          />
        )}

        {/* 差异内容 */}
        <Spin spinning={comparisonLoading}>
          {baseVersion && targetVersion && baseVersion !== targetVersion ? (
            <div>
              <Title level={5}>详细差异</Title>
              <DiffEditor
                original={baseVersion ? generateOriginalContent() : ''}
                modified={targetVersion ? generateModifiedContent() : ''}
                language="json"
                height="400px"
                originalTitle={`${baseVersion} (原始版本)`}
                modifiedTitle={`${targetVersion} (修改版本)`}
                renderSideBySide={true}
                enableSplitViewResizing={true}
                showMinimap={false}
                fontSize={12}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>请选择要对比的两个版本</div>
          )}
        </Spin>
      </div>
    </DragModal>
  );
};

export default VersionComparison;
