import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { App, Button, Card, Empty, Form, Input, List, Select, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  type AnnouncementItem,
  type AnnouncementPublishFormData,
  announcementService,
} from '@/services/system/announcement';
import { useUserStore } from '@/stores/userStore';
import webSocketClient, { type AnnouncementMessagePayload } from '@/utils/webscoketClient';

const Announcement: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<AnnouncementPublishFormData>();
  const queryClient = useQueryClient();
  const accessToken = useUserStore((state) => state.accessToken);
  const [liveAnnouncements, setLiveAnnouncements] = useState<AnnouncementItem[]>([]);

  useEffect(() => {
    if (accessToken) {
      webSocketClient.connect(accessToken);
    }
  }, [accessToken]);

  useEffect(() => {
    const handleAnnouncement = (event: { payload: AnnouncementMessagePayload }) => {
      setLiveAnnouncements((prev) => mergeAnnouncements([event.payload], prev));
    };
    webSocketClient.on('announcement', handleAnnouncement);
    return () => {
      webSocketClient.off('announcement', handleAnnouncement);
    };
  }, []);

  const { data, isFetching } = useQuery({
    queryKey: ['system-announcements'],
    queryFn: () => announcementService.list(20),
  });

  const publishMutation = useMutation({
    mutationFn: (values: AnnouncementPublishFormData) => announcementService.publish(values),
    onSuccess: () => {
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['system-announcements'] });
      message.success('公告已发布');
    },
  });

  const announcements = useMemo(() => mergeAnnouncements(liveAnnouncements, data || []), [data, liveAnnouncements]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <Card title="发布公告" bordered={false}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ level: 'info' }}
          onFinish={(values) => publishMutation.mutate(values)}
        >
          <Form.Item name="title" label="公告标题" rules={[{ required: true, message: '请输入公告标题' }]}>
            <Input maxLength={100} placeholder="请输入公告标题" />
          </Form.Item>
          <Form.Item name="content" label="公告内容" rules={[{ required: true, message: '请输入公告内容' }]}>
            <Input.TextArea maxLength={1000} rows={4} placeholder="请输入需要实时推送的公告内容" />
          </Form.Item>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Form.Item name="level" label="公告级别" className="mb-0 min-w-[180px]">
              <Select
                options={[
                  { label: '普通', value: 'info' },
                  { label: '成功', value: 'success' },
                  { label: '提醒', value: 'warning' },
                  { label: '紧急', value: 'error' },
                ]}
              />
            </Form.Item>
            <Space>
              <Button onClick={() => form.resetFields()}>重置</Button>
              <Button type="primary" htmlType="submit" loading={publishMutation.isPending}>
                发布并广播
              </Button>
            </Space>
          </div>
        </Form>
      </Card>

      <Card title="实时公告列表" bordered={false}>
        {announcements.length === 0 && !isFetching ? (
          <Empty description="暂无公告" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List
            loading={isFetching}
            dataSource={announcements}
            renderItem={(item) => (
              <List.Item>
                <div className="w-full">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <Space wrap size={[8, 8]}>
                      <Tag color={getAnnouncementTagColor(item.level)}>{getAnnouncementLevelText(item.level)}</Tag>
                      <Typography.Text strong>{item.title}</Typography.Text>
                    </Space>
                    <Typography.Text type="secondary">
                      {dayjs(item.publishedAt).format('YYYY-MM-DD HH:mm:ss')}
                    </Typography.Text>
                  </div>
                  <Typography.Paragraph className="mb-2! whitespace-pre-wrap text-sm text-gray-700">
                    {item.content}
                  </Typography.Paragraph>
                  <Typography.Text type="secondary" className="text-xs">
                    发布人: {item.publishedBy || '-'}
                  </Typography.Text>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>
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

function getAnnouncementLevelText(level: AnnouncementItem['level']) {
  switch (level) {
    case 'success':
      return '成功';
    case 'warning':
      return '提醒';
    case 'error':
      return '紧急';
    default:
      return '普通';
  }
}

function getAnnouncementTagColor(level: AnnouncementItem['level']) {
  switch (level) {
    case 'success':
      return 'green';
    case 'warning':
      return 'orange';
    case 'error':
      return 'red';
    default:
      return 'blue';
  }
}

export default Announcement;
