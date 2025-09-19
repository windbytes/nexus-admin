import type React from 'react';
import { useState, useMemo } from 'react';
import {
  Card,
  Input,
  Select,
  Button,
  Row,
  Col,
  Pagination,
  Spin,
  Empty,
  App,
} from 'antd';
import {
  PlusOutlined,
} from '@ant-design/icons';
import { type WorkflowVersion, VersionStatus } from '@/services/integrated/version/model';
import {
  useVersionList,
  useDeleteVersion,
  usePublishVersion,
  useRollbackVersion,
} from '@/views/integrated/Versions/useVersionQueries';
import VersionListItem from './VersionListItem';
import ReleaseConfirmation from './ReleaseConfirmation';

const { Search } = Input;
const { Option } = Select;

interface VersionListProps {
  workflowId: string;
  onViewVersion?: (version: WorkflowVersion) => void;
  onCompareVersion?: (version: WorkflowVersion) => void;
  onDownloadVersion?: (version: WorkflowVersion) => void;
  onEditVersion?: (version: WorkflowVersion) => void;
  onDeleteVersion?: (version: WorkflowVersion) => void;
  onRollbackVersion?: (version: WorkflowVersion) => void;
  onCreateVersion?: () => void;
}

/**
 * 版本列表
 * @param props
 * @param props.workflowId 工作流ID
 * @param props.onViewVersion 查看版本
 * @param props.onCompareVersion 对比版本
 * @param props.onDownloadVersion 下载版本
 * @param props.onEditVersion 编辑版本
 * @param props.onDeleteVersion 删除版本
 * @param props.onRollbackVersion 回滚版本
 * @param props.onCreateVersion 创建版本
 * @returns 版本列表
 */
const VersionList: React.FC<VersionListProps> = ({
  workflowId,
  onViewVersion,
  onCompareVersion,
  onDownloadVersion,
  onEditVersion,
  onDeleteVersion,
  onRollbackVersion,
  onCreateVersion,
}) => {
  const { modal } = App.useApp();

  // 搜索和筛选状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>();
  const [branchFilter, setBranchFilter] = useState<string | undefined>();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  
  // 弹窗状态管理
  const [releaseModalVisible, setReleaseModalVisible] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<WorkflowVersion | null>(null);

  // 构建查询参数
  const queryParams = useMemo(
    () => ({
      workflowId,
      keyword: searchKeyword,
      status: statusFilter,
      branch: branchFilter,
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
    }),
    [workflowId, searchKeyword, statusFilter, branchFilter, pagination.current, pagination.pageSize],
  );

  // 使用 React Query 获取版本列表
  const { data: versionResult, isLoading, error } = useVersionList(queryParams);

  // 版本数据和分页信息
  const versions = versionResult?.records || [];
  const total = versionResult?.totalRow || 0;

  // 更新分页总数
  useMemo(() => {
    setPagination((prev) => ({
      ...prev,
      total,
    }));
  }, [total]);

  // Mutations
  const deleteVersionMutation = useDeleteVersion();
  const publishVersionMutation = usePublishVersion();
  const rollbackVersionMutation = useRollbackVersion();


  /**
   * 删除版本
   * @param version 版本
   */
  const handleDelete = (version: WorkflowVersion) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除版本 ${version.version} 吗？此操作不可撤销。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        deleteVersionMutation.mutate({
          workflowId,
          versionId: version.id,
        });
        onDeleteVersion?.(version);
      },
    });
  };

  /**
   * 发布版本
   * @param version 版本
   */
  const handlePublish = (version: WorkflowVersion) => {
    setSelectedVersion(version);
    setReleaseModalVisible(true);
  };

  /**
   * 回滚版本
   * @param version 版本
   */
  const handleRollback = (version: WorkflowVersion) => {
    modal.confirm({
      title: '确认回滚',
      content: `确定要回滚到版本 ${version.version} 吗？此操作将覆盖当前版本，且不可撤销。`,
      okText: '确认回滚',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        rollbackVersionMutation.mutate({
          workflowId,
          versionId: version.id,
        });
        onRollbackVersion?.(version);
      },
    });
  };

  /**
   * 关闭发布确认弹窗
   */
  const handleCloseReleaseModal = () => {
    setReleaseModalVisible(false);
    setSelectedVersion(null);
  };

  /**
   * 分页变化处理
   * @param page 页码
   * @param pageSize 页大小
   */
  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  /**
   * 搜索处理
   * @param value 搜索值
   */
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setPagination((prev) => ({
      ...prev,
      current: 1, // 搜索时重置到第一页
    }));
  };


  /**
   * 错误处理
   */
  if (error) {
    return (
      <div className="h-full flex flex-col box-border">
        <Card className="mb-4! flex-shrink-0">
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">数据加载失败</div>
            <Button onClick={() => window.location.reload()}>重新加载</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col box-border">
      {/* 搜索和筛选区域 */}
      <Card className="mb-4! flex-shrink-0">
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Search
              placeholder="搜索版本..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearch}
              style={{ maxWidth: 400 }}
            />
          </Col>
          <Col>
            <Select
              placeholder="全部状态"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120, marginRight: 8 }}
              allowClear
            >
              <Option value={VersionStatus.DRAFT}>草稿</Option>
              <Option value={VersionStatus.PUBLISHED}>已发布</Option>
              <Option value={VersionStatus.DEPRECATED}>已弃用</Option>
              <Option value={VersionStatus.ARCHIVED}>已归档</Option>
            </Select>
            <Select
              placeholder="全部分支"
              value={branchFilter}
              onChange={setBranchFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="master">主分支</Option>
              <Option value="feature">功能分支</Option>
              <Option value="hotfix">热修复分支</Option>
            </Select>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={onCreateVersion}>
              创建新版本
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 版本列表区域 - 占据剩余空间并支持滚动 */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            paddingRight: '8px', // 为滚动条留出空间
          }}
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {versions.length > 0 ? (
                versions.map((version) => {
                  const isCurrentVersion = version.status === VersionStatus.PUBLISHED && version.version === 'v2.1.0';

                  return (
                    <VersionListItem
                      key={version.id}
                      version={version}
                      isCurrentVersion={isCurrentVersion}
                      onViewVersion={onViewVersion}
                      onEditVersion={onEditVersion}
                      onPublishVersion={handlePublish}
                      onDeleteVersion={handleDelete}
                      onRollbackVersion={handleRollback}
                      onCompareVersion={onCompareVersion}
                      onDownloadVersion={onDownloadVersion}
                      isPublishing={publishVersionMutation.isPending}
                      isDeleting={deleteVersionMutation.isPending}
                      isRollingBack={rollbackVersionMutation.isPending}
                    />
                  );
                })
              ) : (
                <Empty description="暂无版本数据">
                  <Button type="primary" onClick={onCreateVersion}>
                    创建新版本
                  </Button>
                </Empty>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 分页组件 - 固定在底部 */}
      <Pagination
        className="flex-shrink-0 flex justify-center p-4 bg-bg-container mt-4!  "
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={handlePageChange}
        onShowSizeChange={handlePageChange}
        showSizeChanger
        showQuickJumper
        showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`}
        pageSizeOptions={['10', '20', '50', '100']}
      />

      {/* 发布确认弹窗 */}
      <ReleaseConfirmation
        visible={releaseModalVisible}
        onClose={handleCloseReleaseModal}
        version={selectedVersion}
      />
    </div>
  );
};

export default VersionList;
