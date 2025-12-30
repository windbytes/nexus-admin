import { useQuery } from '@tanstack/react-query';
import { Tag } from 'antd';
import type React from 'react';
import type { Announcement } from '../../mockData';

// 模拟获取公告数据的API
const fetchAnnouncementsData = async (): Promise<Announcement[]> => {
  // 模拟API延迟
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    {
      id: '1',
      type: 'activity',
      title: '流程管理最新优惠活动',
      time: '2小时前',
    },
    {
      id: '2',
      type: 'message',
      title: '新增流程尚未通过审核',
      time: '4小时前',
    },
    {
      id: '3',
      type: 'notification',
      title: '当前产品试用期即将截止',
      time: '6小时前',
    },
    {
      id: '4',
      type: 'notification',
      title: '1月新系统升级计划通知',
      time: '1天前',
    },
  ];
};

export const Announcements: React.FC = () => {
  const { data: announcements, isFetching } = useQuery({
    queryKey: ['announcementsData'],
    queryFn: fetchAnnouncementsData,
    staleTime: 5 * 60 * 1000, // 5分钟
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'activity':
        return 'blue';
      case 'message':
        return 'green';
      case 'notification':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'activity':
        return '活动';
      case 'message':
        return '消息';
      case 'notification':
        return '通知';
      default:
        return '其他';
    }
  };

  if (isFetching) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (!announcements || announcements.length === 0) {
    return <div className="text-center py-8 text-gray-500">暂无公告数据</div>;
  }

  return (
    <div className="space-y-3">
      {announcements.map((item) => (
        <div
          key={item.id}
          className="flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <Tag color={getTypeColor(item.type)} className="mr-2">
                {getTypeText(item.type)}
              </Tag>
              <span className="text-xs text-gray-400">{item.time}</span>
            </div>
            <div className="text-sm text-gray-700">{item.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
