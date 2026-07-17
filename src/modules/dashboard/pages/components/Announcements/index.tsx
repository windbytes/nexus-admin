import { useQuery } from '@tanstack/react-query';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import type React from 'react';
import { useEffect, useState } from 'react';
import { announcementService, type AnnouncementItem } from '@/shared/api/system/announcement';
import webSocketClient, { type AnnouncementMessagePayload } from '@/shared/utils/webscoketClient';

export const Announcements: React.FC = () => {
  const [liveAnnouncements, setLiveAnnouncements] = useState<AnnouncementItem[]>([]);

  useEffect(() => {
    const handleAnnouncement = (event: { payload: AnnouncementMessagePayload }) => {
      setLiveAnnouncements((prev) => mergeAnnouncements([event.payload], prev));
    };
    webSocketClient.on('announcement', handleAnnouncement);
    return () => {
      webSocketClient.off('announcement', handleAnnouncement);
    };
  }, []);

  const { data: announcements, isFetching } = useQuery({
    queryKey: ['announcementsData'],
    queryFn: () => announcementService.list(4),
    staleTime: 5 * 60 * 1000,
  });

  const mergedAnnouncements = mergeAnnouncements(liveAnnouncements, announcements || []).slice(0, 4);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'blue';
      case 'info':
        return 'green';
      case 'warning':
        return 'orange';
      case 'error':
        return 'red';
      default:
        return 'default';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'success':
        return '成功';
      case 'info':
        return '公告';
      case 'warning':
        return '通知';
      case 'error':
        return '紧急';
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

  if (!mergedAnnouncements || mergedAnnouncements.length === 0) {
    return <div className="text-center py-8 text-gray-500">暂无公告数据</div>;
  }

  return (
    <div className="space-y-3">
      {mergedAnnouncements.map((item) => (
        <div
          key={item.id}
          className="flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <Tag color={getTypeColor(item.level)} className="mr-2">
                {getTypeText(item.level)}
              </Tag>
              <span className="text-xs text-gray-400">{dayjs(item.publishedAt).format('MM-DD HH:mm')}</span>
            </div>
            <div className="text-sm text-gray-700">{item.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

function mergeAnnouncements(primary: AnnouncementItem[], secondary: AnnouncementItem[]) {
  const announcementMap = new Map<string, AnnouncementItem>();
  for (const item of [...primary, ...secondary]) {
    announcementMap.set(item.id, item);
  }
  return Array.from(announcementMap.values()).sort((left, right) => right.publishedAt - left.publishedAt);
}
