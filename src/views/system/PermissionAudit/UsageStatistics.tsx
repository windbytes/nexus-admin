import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Statistic, Table, DatePicker, Button, Space, Spin, Empty } from 'antd';
import { ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import { useState, useCallback, useMemo } from 'react';
import type React from 'react';
import { permissionAuditService } from '@/services/system/permission/PermissionAudit/permissionAuditApi';
import type { TableProps } from 'antd';
import { useECharts } from '@/hooks/useECharts';

/**
 * 使用统计组件
 * 展示权限使用情况的统计数据和图表
 */
const UsageStatistics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<[string, string] | null>(null);
  const { chartRef: buttonUsageChartRef } = useECharts();
  const { chartRef: interfaceUsageChartRef } = useECharts();

  /**
   * 查询权限统计数据
   */
  const {
    data: statistics,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['permission-statistics', timeRange],
    queryFn: () =>
      permissionAuditService.getPermissionStatistics(
        timeRange ? { startTime: timeRange[0], endTime: timeRange[1] } : undefined,
      ),
  });

  /**
   * 处理时间范围变化
   * @param dates 时间范围
   */
  const handleTimeRangeChange = useCallback((dates: [string, string] | null) => {
    setTimeRange(dates);
  }, []);

  /**
   * 处理刷新
   */
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  /**
   * 处理导出
   */
  const handleExport = useCallback(() => {
    // TODO: 实现导出功能
    console.log('导出统计数据');
  }, []);

  /**
   * 按钮使用统计表格列定义
   */
  const buttonUsageColumns: TableProps<any>['columns'] = useMemo(
    () => [
      {
        title: '按钮名称',
        dataIndex: 'buttonName',
        key: 'buttonName',
        render: (name: string) => <span className="font-medium">{name}</span>,
      },
      {
        title: '使用次数',
        dataIndex: 'usageCount',
        key: 'usageCount',
        render: (count: number) => <span className="text-orange-600 font-bold">{count}</span>,
        sorter: (a: any, b: any) => a.usageCount - b.usageCount,
      },
      {
        title: '使用率',
        dataIndex: 'usageRate',
        key: 'usageRate',
        render: (rate: number) => <span className="text-blue-600">{rate}%</span>,
        sorter: (a: any, b: any) => a.usageRate - b.usageRate,
      },
    ],
    [],
  );

  /**
   * 接口使用统计表格列定义
   */
  const interfaceUsageColumns: TableProps<any>['columns'] = useMemo(
    () => [
      {
        title: '接口编码',
        dataIndex: 'interfaceCode',
        key: 'interfaceCode',
        render: (code: string) => <span className="font-mono text-sm">{code}</span>,
      },
      {
        title: '使用次数',
        dataIndex: 'usageCount',
        key: 'usageCount',
        render: (count: number) => <span className="text-purple-600 font-bold">{count}</span>,
        sorter: (a: any, b: any) => a.usageCount - b.usageCount,
      },
      {
        title: '使用率',
        dataIndex: 'usageRate',
        key: 'usageRate',
        render: (rate: number) => <span className="text-blue-600">{rate}%</span>,
        sorter: (a: any, b: any) => a.usageRate - b.usageRate,
      },
    ],
    [],
  );

  /**
   * 渲染按钮使用图表
   */
  const renderButtonUsageChart = useCallback(() => {
    if (!statistics?.topUsedButtons?.length) return null;

    const option = {
      title: {
        text: '按钮使用统计',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
      },
      series: [
        {
          type: 'pie',
          radius: '50%',
          data: statistics.topUsedButtons.map((item, index) => ({
            value: item.usageCount,
            name: item.buttonName,
            itemStyle: {
              color: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'][index % 5],
            },
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };

    return <div ref={buttonUsageChartRef} style={{ width: '100%', height: '300px' }} />;
  }, [statistics?.topUsedButtons, buttonUsageChartRef]);

  /**
   * 渲染接口使用图表
   */
  const renderInterfaceUsageChart = useCallback(() => {
    if (!statistics?.topUsedInterfaces?.length) return null;

    const option = {
      title: {
        text: '接口使用统计',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
      },
      series: [
        {
          type: 'pie',
          radius: '50%',
          data: statistics.topUsedInterfaces.map((item, index) => ({
            value: item.usageCount,
            name: item.interfaceCode,
            itemStyle: {
              color: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'][index % 5],
            },
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };

    return <div ref={interfaceUsageChartRef} style={{ width: '100%', height: '300px' }} />;
  }, [statistics?.topUsedInterfaces, interfaceUsageChartRef]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* 操作栏 */}
      <Card size="small">
        <div className="flex justify-between items-center">
          <Space>
            <DatePicker.RangePicker
              placeholder={['开始时间', '结束时间']}
              onChange={(dates) => {
                if (dates) {
                  handleTimeRangeChange([dates[0]?.format('YYYY-MM-DD') || '', dates[1]?.format('YYYY-MM-DD') || '']);
                } else {
                  handleTimeRangeChange(null);
                }
              }}
            />
          </Space>
          <Space>
            <Button type="text" icon={<ReloadOutlined />} onClick={handleRefresh} loading={isLoading}>
              刷新
            </Button>
            <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
              导出
            </Button>
          </Space>
        </div>
      </Card>

      {/* 统计概览 */}
      <Row gutter={16}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="总按钮数" value={statistics?.totalButtons || 0} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="启用按钮数" value={statistics?.activeButtons || 0} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="总接口数" value={statistics?.totalInterfaces || 0} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="使用接口数" value={statistics?.usedInterfaces || 0} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="按钮使用统计" size="small" className="h-80">
            {statistics?.topUsedButtons?.length ? renderButtonUsageChart() : <Empty description="暂无数据" />}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="接口使用统计" size="small" className="h-80">
            {statistics?.topUsedInterfaces?.length ? renderInterfaceUsageChart() : <Empty description="暂无数据" />}
          </Card>
        </Col>
      </Row>

      {/* 详细统计表格 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="按钮使用排行" size="small">
            <Table
              columns={buttonUsageColumns}
              dataSource={
                statistics?.topUsedButtons?.map((item) => ({
                  ...item,
                  key: item.buttonId,
                  usageRate: Math.round((item.usageCount / (statistics?.totalButtons || 1)) * 100),
                })) || []
              }
              pagination={false}
              size="small"
              scroll={{ y: 200 }}
              locale={{
                emptyText: '暂无数据',
              }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="接口使用排行" size="small">
            <Table
              columns={interfaceUsageColumns}
              dataSource={
                statistics?.topUsedInterfaces?.map((item) => ({
                  ...item,
                  key: item.interfaceId,
                  usageRate: Math.round((item.usageCount / (statistics?.totalInterfaces || 1)) * 100),
                })) || []
              }
              pagination={false}
              size="small"
              scroll={{ y: 200 }}
              locale={{
                emptyText: '暂无数据',
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UsageStatistics;
