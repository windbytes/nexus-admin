import { useQuery } from '@tanstack/react-query';
import { Card, Table, Select, DatePicker, Button, Tag, Descriptions, Modal } from 'antd';
import { EyeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useState, useCallback, useMemo, useId } from 'react';
import type React from 'react';
import {
  permissionAuditService,
  type PermissionChangeLog,
} from '@/services/system/permission/PermissionAudit/permissionAuditApi';
import type { TableProps } from 'antd';

/**
 * 变更日志组件
 * 展示权限变更的历史记录
 */
const ChangeLog: React.FC = () => {
  const [searchParams, setSearchParams] = useState({
    pageNumber: 1,
    pageSize: 10,
    operationType: undefined as string | undefined,
    targetType: undefined as string | undefined,
    startTime: undefined as string | undefined,
    endTime: undefined as string | undefined,
  });
  const [selectedLog, setSelectedLog] = useState<PermissionChangeLog | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const operationTypeId = useId();
  const targetTypeId = useId();
  const timeRangeId = useId();

  /**
   * 查询变更日志
   */
  const {
    data: changeLogResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['permission-change-log', searchParams],
    queryFn: () => permissionAuditService.getPermissionChangeLog(searchParams),
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
   * @param log 变更日志
   */
  const handleViewDetail = useCallback((log: PermissionChangeLog) => {
    setSelectedLog(log);
    setDetailModalVisible(true);
  }, []);

  /**
   * 处理刷新
   */
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  /**
   * 处理重置搜索
   */
  const handleResetSearch = useCallback(() => {
    setSearchParams({
      pageNumber: 1,
      pageSize: 10,
      operationType: undefined,
      targetType: undefined,
      startTime: undefined,
      endTime: undefined,
    });
  }, []);

  /**
   * 获取操作类型标签
   * @param operationType 操作类型
   */
  const getOperationTypeTag = useCallback((operationType: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      create: { color: 'green', text: '创建' },
      update: { color: 'blue', text: '更新' },
      delete: { color: 'red', text: '删除' },
      assign: { color: 'orange', text: '分配' },
      revoke: { color: 'purple', text: '回收' },
    };
    const type = typeMap[operationType] || { color: 'default', text: operationType };
    return <Tag color={type.color}>{type.text}</Tag>;
  }, []);

  /**
   * 获取目标类型标签
   * @param targetType 目标类型
   */
  const getTargetTypeTag = useCallback((targetType: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      button: { color: 'blue', text: '按钮' },
      interface: { color: 'purple', text: '接口' },
      role: { color: 'green', text: '角色' },
    };
    const type = typeMap[targetType] || { color: 'default', text: targetType };
    return <Tag color={type.color}>{type.text}</Tag>;
  }, []);

  /**
   * 表格列定义
   */
  const columns: TableProps<PermissionChangeLog>['columns'] = useMemo(
    () => [
      {
        title: '序号',
        key: 'index',
        width: 80,
        align: 'center',
        render: (_, __, index) => (searchParams.pageNumber - 1) * searchParams.pageSize + index + 1,
      },
      {
        title: '操作类型',
        dataIndex: 'operationType',
        key: 'operationType',
        width: 100,
        render: (operationType: string) => getOperationTypeTag(operationType),
      },
      {
        title: '目标类型',
        dataIndex: 'targetType',
        key: 'targetType',
        width: 100,
        render: (targetType: string) => getTargetTypeTag(targetType),
      },
      {
        title: '目标名称',
        dataIndex: 'targetName',
        key: 'targetName',
        ellipsis: true,
        render: (name: string) => <span className="font-medium">{name}</span>,
      },
      {
        title: '操作人',
        dataIndex: 'operatorName',
        key: 'operatorName',
        width: 120,
        render: (name: string) => <span className="text-blue-600">{name}</span>,
      },
      {
        title: '操作时间',
        dataIndex: 'operationTime',
        key: 'operationTime',
        width: 180,
        sorter: true,
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
        render: (description: string) => <span className="text-gray-600">{description}</span>,
      },
      {
        title: '操作',
        key: 'action',
        width: 100,
        align: 'center',
        render: (_, record) => (
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
        ),
      },
    ],
    [searchParams.pageNumber, searchParams.pageSize, getOperationTypeTag, getTargetTypeTag, handleViewDetail],
  );

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* 搜索栏 */}
      <Card size="small">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-200">
            <label htmlFor={operationTypeId} className="text-sm font-medium mb-1 block">
              操作类型：
            </label>
            <Select
              id={operationTypeId}
              placeholder="请选择操作类型"
              value={searchParams.operationType}
              onChange={(value) => handleSearchParamChange('operationType', value)}
              style={{ width: '100%' }}
              allowClear
              options={[
                { label: '创建', value: 'create' },
                { label: '更新', value: 'update' },
                { label: '删除', value: 'delete' },
                { label: '分配', value: 'assign' },
                { label: '回收', value: 'revoke' },
              ]}
            />
          </div>
          <div className="flex-1 min-w-200">
            <label htmlFor={targetTypeId} className="text-sm font-medium mb-1 block">
              目标类型：
            </label>
            <Select
              id={targetTypeId}
              placeholder="请选择目标类型"
              value={searchParams.targetType}
              onChange={(value) => handleSearchParamChange('targetType', value)}
              style={{ width: '100%' }}
              allowClear
              options={[
                { label: '按钮', value: 'button' },
                { label: '接口', value: 'interface' },
                { label: '角色', value: 'role' },
              ]}
            />
          </div>
          <div className="flex-1 min-w-200">
            <label htmlFor={timeRangeId} className="text-sm font-medium mb-1 block">
              时间范围：
            </label>
            <DatePicker.RangePicker
              id={timeRangeId}
              placeholder={['开始时间', '结束时间']}
              value={
                searchParams.startTime && searchParams.endTime
                  ? [searchParams.startTime as any, searchParams.endTime as any]
                  : null
              }
              onChange={(dates) => {
                if (dates) {
                  handleSearchParamChange('startTime', dates[0]?.format('YYYY-MM-DD'));
                  handleSearchParamChange('endTime', dates[1]?.format('YYYY-MM-DD'));
                } else {
                  handleSearchParamChange('startTime', undefined);
                  handleSearchParamChange('endTime', undefined);
                }
              }}
              style={{ width: '100%' }}
            />
          </div>
          <div className="flex gap-2">
            <Button type="primary" icon={<SearchOutlined />} onClick={handleRefresh}>
              搜索
            </Button>
            <Button onClick={handleResetSearch}>重置</Button>
            <Button type="text" icon={<ReloadOutlined />} onClick={handleRefresh} loading={isLoading}>
              刷新
            </Button>
          </div>
        </div>
      </Card>

      {/* 变更日志表格 */}
      <div className="flex-1">
        <Card title="变更日志" size="small" className="h-full">
          <Table<PermissionChangeLog>
            columns={columns}
            dataSource={changeLogResponse?.records || []}
            loading={isLoading}
            rowKey="id"
            pagination={{
              current: searchParams.pageNumber,
              pageSize: searchParams.pageSize,
              total: changeLogResponse?.totalRow || 0,
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
              emptyText: '暂无变更记录',
            }}
          />
        </Card>
      </div>

      {/* 详情弹窗 */}
      <Modal
        title="变更详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedLog && (
          <div className="py-4">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="操作类型">{getOperationTypeTag(selectedLog.operationType)}</Descriptions.Item>
              <Descriptions.Item label="目标类型">{getTargetTypeTag(selectedLog.targetType)}</Descriptions.Item>
              <Descriptions.Item label="目标名称">
                <span className="font-medium">{selectedLog.targetName}</span>
              </Descriptions.Item>
              <Descriptions.Item label="操作人">
                <span className="text-blue-600">{selectedLog.operatorName}</span>
              </Descriptions.Item>
              <Descriptions.Item label="操作时间">{selectedLog.operationTime}</Descriptions.Item>
              <Descriptions.Item label="描述">{selectedLog.description}</Descriptions.Item>
            </Descriptions>

            {selectedLog.beforeData && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">变更前数据：</h4>
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-40">
                  {JSON.stringify(selectedLog.beforeData, null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.afterData && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">变更后数据：</h4>
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-40">
                  {JSON.stringify(selectedLog.afterData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChangeLog;
