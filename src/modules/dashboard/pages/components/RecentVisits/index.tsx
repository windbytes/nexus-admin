import { ClockCircleOutlined, RightOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { fetchRecentVisitsData } from '@/modules/dashboard/api';

export const RecentVisits: React.FC = () => {
  const { data: recentVisits, isFetching } = useQuery({
    queryKey: ['recentVisitsData'],
    queryFn: fetchRecentVisitsData,
    staleTime: 5 * 60 * 1000,
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
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center p-4 relative">
            <div className="relative mr-4">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300">
                <div className="text-xl">{item.icon}</div>
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <ClockCircleOutlined className="text-white text-xs" />
              </div>
            </div>
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
              <div className="text-xs text-gray-400 flex items-center">
                <ClockCircleOutlined className="mr-1" />
                <span>{item.visitTime || '刚刚'}</span>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-linear-to-r from-blue-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      ))}
    </div>
  );
};
