import { BookOutlined, ClockCircleOutlined, MonitorOutlined, RightOutlined, SettingOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import type { RecentVisit } from '../../mockData';

// 模拟获取最近访问数据的API
const fetchRecentVisitsData = async (): Promise<RecentVisit[]> => {
  // 模拟API延迟
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    {
      icon: React.createElement(MonitorOutlined, { className: 'text-blue-500' }),
      title: '流程监控',
      description: '实时监控页面',
      link: '/workflow/monitor',
      visitTime: '2分钟前',
    },
    {
      icon: React.createElement(BookOutlined, { className: 'text-green-500' }),
      title: '流程模板库',
      description: '模板管理页面',
      link: '/workflow/templates',
      visitTime: '15分钟前',
    },
    {
      icon: React.createElement(SettingOutlined, { className: 'text-orange-500' }),
      title: '节点管理',
      description: '节点配置页面',
      link: '/workflow/nodes',
      visitTime: '1小时前',
    },
  ];
};

export const RecentVisits: React.FC = () => {
  const { data: recentVisits, isFetching } = useQuery({
    queryKey: ['recentVisitsData'],
    queryFn: fetchRecentVisitsData,
    staleTime: 5 * 60 * 1000, // 5分钟
  });

  if (isFetching) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <div key={index} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (!recentVisits || recentVisits.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-3">📋</div>
        <div className="text-sm">暂无最近访问数据</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentVisits.map((item, index) => (
        <div
          key={`recent-${item.title}-${index}`}
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          {/* 左侧渐变装饰条 */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* 主要内容 */}
          <div className="flex items-center p-4 relative">
            {/* 图标容器 */}
            <div className="relative mr-4">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300">
                <div className="text-xl">{item.icon}</div>
              </div>
              {/* 访问时间指示器 */}
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <ClockCircleOutlined className="text-white text-xs" />
              </div>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800 text-base group-hover:text-blue-600 transition-colors duration-200 truncate">
                  {item.title}
                </h3>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <RightOutlined className="text-blue-400 text-sm" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2 leading-relaxed">{item.description}</p>
              <div className="flex items-center text-xs text-gray-400">
                <ClockCircleOutlined className="mr-1" />
                <span>{item.visitTime || '刚刚'}</span>
              </div>
            </div>
          </div>

          {/* 悬停时的背景光效 */}
          <div className="absolute inset-0 bg-linear-to-r from-blue-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      ))}
    </div>
  );
};
