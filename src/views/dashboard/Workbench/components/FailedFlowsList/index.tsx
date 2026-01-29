import { ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Table, type TableProps, Tag, Tooltip } from 'antd';
import type React from 'react';
import type { FailedFlow } from '../../mockData';

// 模拟获取失败流程数据的API
const fetchFailedFlowsData = async (): Promise<FailedFlow[]> => {
  // 模拟API延迟
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    {
      id: '1',
      name: '用户数据同步流程',
      errorMessage: '数据库连接超时',
      failedTime: '2分钟前',
      retryCount: 3,
    },
    {
      id: '2',
      name: '订单处理自动化',
      errorMessage: 'API接口返回错误',
      failedTime: '5分钟前',
      retryCount: 2,
    },
    {
      id: '3',
      name: '库存管理系统',
      errorMessage: '文件上传失败',
      failedTime: '10分钟前',
      retryCount: 1,
    },
  ];
};

export const FailedFlowsList: React.FC = () => {
  const { data: failedFlows, isFetching } = useQuery({
    queryKey: ['failedFlowsData'],
    queryFn: fetchFailedFlowsData,
    staleTime: 5 * 60 * 1000, // 5分钟
  });

  const columns: TableProps['columns'] = [
    {
      title: '流程名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-medium text-gray-800">{name}</span>,
    },
    {
      title: '错误信息',
      dataIndex: 'errorMessage',
      key: 'errorMessage',
      render: (errorMessage: string) => (
        <div className="flex items-center">
          <ExclamationCircleOutlined className="text-red-500 mr-2" />
          <span className="text-red-600 text-sm">{errorMessage}</span>
        </div>
      ),
    },
    {
      title: '失败时间',
      dataIndex: 'failedTime',
      key: 'failedTime',
      render: (failedTime: string) => <span className="text-gray-500 text-sm">{failedTime}</span>,
    },
    {
      title: '重试次数',
      dataIndex: 'retryCount',
      key: 'retryCount',
      render: (retryCount: number) => <Tag color={retryCount >= 3 ? 'red' : 'orange'}>{retryCount}/3</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      render: (_: any, record: any) => (
        <Tooltip title="重试">
          <Button
            type="primary"
            size="small"
            shape="circle"
            icon={<ReloadOutlined />}
            disabled={record.retryCount >= 3}
          />
        </Tooltip>
      ),
    },
  ];

  if (isFetching) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((index) => (
          <div key={index} className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!failedFlows || failedFlows.length === 0) {
    return <div className="text-center py-8 text-gray-500">暂无失败流程数据</div>;
  }

  return (
    <Table
      columns={columns}
      dataSource={failedFlows}
      pagination={false}
      rowKey="id"
      size="small"
      className="custom-table"
      loading={isFetching}
    />
  );
};
