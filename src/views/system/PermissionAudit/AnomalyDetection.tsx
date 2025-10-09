import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Table, Select, Button, Space, Tag, Modal, message, App } from 'antd';
import { ReloadOutlined, EyeOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useState, useCallback, useMemo, useId } from 'react';
import type React from 'react';
import { permissionAuditService } from '@/services/system/permission/PermissionAudit/permissionAuditApi';
import type { TableProps } from 'antd';

/**
 * 异常检测组件
 * 展示权限使用异常情况并提供处理功能
 */
const AnomalyDetection: React.FC = () => {
  const { modal } = App.useApp();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState({
    pageNumber: 1,
    pageSize: 10,
    anomalyType: undefined as string | undefined,
  });
  const [selectedAnomaly, setSelectedAnomaly] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const anomalyTypeId = useId();

  /**
   * 查询异常检测结果
   */
  const {
    data: anomalyResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['anomaly-detection', searchParams],
    queryFn: () => permissionAuditService.getAnomalyDetection(searchParams),
  });

  /**
   * 处理异常状态的mutation
   */
  const handleAnomalyMutation = useMutation({
    mutationFn: ({ anomalyId, status }: { anomalyId: string; status: 'resolved' | 'ignored' }) => {
      // 这里应该调用处理异常的API
      console.log('处理异常:', anomalyId, status);
      return Promise.resolve(true);
    },
    onSuccess: () => {
      message.success('操作成功');
      queryClient.invalidateQueries({ queryKey: ['anomaly-detection'] });
    },
    onError: (error: any) => {
      message.error(error.message || '操作失败');
    },
  });

  /**
   * 处理搜索参数变化
   * @param key 参数名
   * @param value 参数值
   */
  const handleSearchParamChange = useCallback((key: string, value: any) => {
    setSearchParams((prev) => ({
      ...prev,
      [key]: value,
      pageNumber: 1, // 重置页码
    }));
  }, []);

  /**
   * 处理分页变化
   * @param page 页码
   * @param pageSize 页大小
   */
  const handleTableChange = useCallback((page: number, pageSize: number) => {
    setSearchParams((prev) => ({
      ...prev,
      pageNumber: page,
      pageSize,
    }));
  }, []);

  /**
   * 处理查看详情
   * @param anomaly 异常记录
   */
  const handleViewDetail = useCallback((anomaly: any) => {
    setSelectedAnomaly(anomaly);
    setDetailModalVisible(true);
  }, []);

  /**
   * 处理解决异常
   * @param anomalyId 异常ID
   */
  const handleResolveAnomaly = useCallback(
    (anomalyId: string) => {
      modal.confirm({
        title: '确认解决',
        content: '确定要标记此异常为已解决吗？',
        onOk: () => {
          handleAnomalyMutation.mutate({ anomalyId, status: 'resolved' });
        },
      });
    },
    [handleAnomalyMutation, modal],
  );

  /**
   * 处理忽略异常
   * @param anomalyId 异常ID
   */
  const handleIgnoreAnomaly = useCallback(
    (anomalyId: string) => {
      modal.confirm({
        title: '确认忽略',
        content: '确定要忽略此异常吗？',
        onOk: () => {
          handleAnomalyMutation.mutate({ anomalyId, status: 'ignored' });
        },
      });
    },
    [handleAnomalyMutation, modal],
  );

  /**
   * 处理刷新
   */
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  /**
   * 获取严重程度标签
   * @param severity 严重程度
   */
  const getSeverityTag = useCallback((severity: string) => {
    const severityMap: Record<string, { color: string; text: string }> = {
      low: { color: 'green', text: '低' },
      medium: { color: 'orange', text: '中' },
      high: { color: 'red', text: '高' },
    };
    const severityInfo = severityMap[severity] || { color: 'default', text: severity };
    return <Tag color={severityInfo.color}>{severityInfo.text}</Tag>;
  }, []);

  /**
   * 获取状态标签
   * @param status 状态
   */
  const getStatusTag = useCallback((status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: '待处理' },
      resolved: { color: 'green', text: '已解决' },
      ignored: { color: 'gray', text: '已忽略' },
    };
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  }, []);

  /**
   * 获取异常类型标签
   * @param anomalyType 异常类型
   */
  const getAnomalyTypeTag = useCallback((anomalyType: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      unusual_access: { color: 'red', text: '异常访问' },
      permission_escalation: { color: 'orange', text: '权限提升' },
      unused_permission: { color: 'blue', text: '未使用权限' },
      excessive_permission: { color: 'purple', text: '过度权限' },
    };
    const typeInfo = typeMap[anomalyType] || { color: 'default', text: anomalyType };
    return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
  }, []);

  /**
   * 表格列定义
   */
  const columns: TableProps<any>['columns'] = useMemo(
    () => [
      {
        title: '序号',
        key: 'index',
        width: 80,
        align: 'center',
        render: (_, __, index) => (searchParams.pageNumber - 1) * searchParams.pageSize + index + 1,
      },
      {
        title: '异常类型',
        dataIndex: 'anomalyType',
        key: 'anomalyType',
        width: 120,
        render: (anomalyType: string) => getAnomalyTypeTag(anomalyType),
      },
      {
        title: '严重程度',
        dataIndex: 'severity',
        key: 'severity',
        width: 100,
        render: (severity: string) => getSeverityTag(severity),
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
        render: (description: string) => <span className="text-gray-700">{description}</span>,
      },
      {
        title: '检测时间',
        dataIndex: 'detectedTime',
        key: 'detectedTime',
        width: 180,
        sorter: true,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: string) => getStatusTag(status),
      },
      {
        title: '操作',
        key: 'action',
        width: 200,
        align: 'center',
        render: (_, record) => (
          <Space size="small">
            <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
              详情
            </Button>
            {record.status === 'pending' && (
              <>
                <Button
                  type="link"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => handleResolveAnomaly(record.id)}
                  loading={handleAnomalyMutation.isPending}
                >
                  解决
                </Button>
                <Button
                  type="link"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => handleIgnoreAnomaly(record.id)}
                  loading={handleAnomalyMutation.isPending}
                >
                  忽略
                </Button>
              </>
            )}
          </Space>
        ),
      },
    ],
    [
      searchParams.pageNumber,
      searchParams.pageSize,
      getAnomalyTypeTag,
      getSeverityTag,
      getStatusTag,
      handleViewDetail,
      handleResolveAnomaly,
      handleIgnoreAnomaly,
      handleAnomalyMutation.isPending,
    ],
  );

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* 搜索栏 */}
      <Card size="small">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-200">
            <label htmlFor={anomalyTypeId} className="text-sm font-medium mb-1 block">
              异常类型：
            </label>
            <Select
              id={anomalyTypeId}
              placeholder="请选择异常类型"
              value={searchParams.anomalyType}
              onChange={(value) => handleSearchParamChange('anomalyType', value)}
              style={{ width: '100%' }}
              allowClear
              options={[
                { label: '异常访问', value: 'unusual_access' },
                { label: '权限提升', value: 'permission_escalation' },
                { label: '未使用权限', value: 'unused_permission' },
                { label: '过度权限', value: 'excessive_permission' },
              ]}
            />
          </div>
          <div className="flex gap-2">
            <Button type="text" icon={<ReloadOutlined />} onClick={handleRefresh} loading={isLoading}>
              刷新
            </Button>
          </div>
        </div>
      </Card>

      {/* 异常检测表格 */}
      <div className="flex-1">
        <Card title="异常检测结果" size="small" className="h-full">
          <Table
            columns={columns}
            dataSource={anomalyResponse?.records || []}
            loading={isLoading}
            rowKey="id"
            pagination={{
              current: searchParams.pageNumber,
              pageSize: searchParams.pageSize,
              total: anomalyResponse?.totalRow || 0,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: handleTableChange,
              onShowSizeChange: handleTableChange,
            }}
            scroll={{ x: 'max-content', y: 'calc(100vh - 400px)' }}
            size="middle"
            locale={{
              emptyText: '暂无异常记录',
            }}
          />
        </Card>
      </div>

      {/* 详情弹窗 */}
      <Modal
        title="异常详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedAnomaly && (
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-sm text-gray-500">异常类型：</span>
                  {getAnomalyTypeTag(selectedAnomaly.anomalyType)}
                </div>
                <div>
                  <span className="text-sm text-gray-500">严重程度：</span>
                  {getSeverityTag(selectedAnomaly.severity)}
                </div>
                <div>
                  <span className="text-sm text-gray-500">状态：</span>
                  {getStatusTag(selectedAnomaly.status)}
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-500">检测时间：</span>
                <span className="ml-2">{selectedAnomaly.detectedTime}</span>
              </div>

              <div>
                <span className="text-sm text-gray-500">描述：</span>
                <div className="mt-1 p-3 bg-gray-50 rounded text-sm">{selectedAnomaly.description}</div>
              </div>

              {selectedAnomaly.details && (
                <div>
                  <span className="text-sm text-gray-500">详细信息：</span>
                  <pre className="mt-1 p-3 bg-gray-50 rounded text-sm overflow-auto max-h-40">
                    {JSON.stringify(selectedAnomaly.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AnomalyDetection;
