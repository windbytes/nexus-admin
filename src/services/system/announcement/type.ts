export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  level: 'info' | 'success' | 'warning' | 'error';
  publishedBy: string;
  publishedById: string;
  publishedAt: number;
}

export interface AnnouncementPublishFormData {
  title: string;
  content: string;
  level?: 'info' | 'success' | 'warning' | 'error';
}
