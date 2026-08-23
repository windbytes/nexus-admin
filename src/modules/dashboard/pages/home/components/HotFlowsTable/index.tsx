import { FallOutlined, RiseOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Table } from 'antd';
import type React from 'react';
import { fetchHotFlowsData, type HotFlow } from '@/modules/dashboard/api';

export const HotFlowsTable: React.FC = () => {
  const { data: hotFlows, isFetching } = useQuery({
    queryKey: ['hotFlowsData'],
    queryFn: fetchHotFlowsData,
    staleTime: 5 * 60 * 1000,
  });

  const columns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank: number) => (
        <div className="flex items-center justify-center">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
              rank === 1
                ? 'bg-yellow-500 text-white'
                : rank === 2
                  ? 'bg-gray-400 text-white'
                  : rank === 3
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-600'
            }`}
          >
            {rank}
          </span>
        </div>
      ),
    },
    {
      title: '流程名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-medium text-gray-800">{name}</span>,
    },
    {
      title: '执行次数',
      dataIndex: 'executions',
      key: 'executions',
      render: (executions: number) => <span className="text-gray-600">{(executions / 10000).toFixed(1)}w+</span>,
    },
    {
      title: '日涨幅',
      dataIndex: 'dailyIncrease',
      key: 'dailyIncrease',
      render: (dailyIncrease: number, record: HotFlow) => (
        <div className="flex items-center">
          {record.increaseType === 'up' ? (
            <RiseOutlined className="text-green-500 mr-1" />
          ) : (
            <FallOutlined className="text-red-500 mr-1" />
          )}
          <span className={`font-medium ${record.increaseType === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {dailyIncrease}%
          </span>
        </div>
      ),
    },
  ];

  if (isFetching) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!hotFlows || hotFlows.length === 0) {
    return <div className="text-center py-8 text-gray-500">暂无热门流程数据</div>;
  }

  return (
    <Table
      columns={columns}
      dataSource={hotFlows}
      pagination={false}
      rowKey="rank"
      className="custom-table"
      loading={isFetching}
    />
  );
};
