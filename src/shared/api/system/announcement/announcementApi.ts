import { HttpRequest } from '@/shared/utils/request';
import type { AnnouncementItem, AnnouncementPublishFormData } from './type';

const AnnouncementApi = {
  list: '/system/announcement/list',
  publish: '/system/announcement/publish',
};

export interface AnnouncementService {
  list(limit?: number): Promise<AnnouncementItem[]>;
  publish(data: AnnouncementPublishFormData): Promise<AnnouncementItem>;
}

export const announcementService: AnnouncementService = {
  async list(limit = 20) {
    return HttpRequest.get<AnnouncementItem[]>(
      {
        url: AnnouncementApi.list,
        params: { limit },
      },
      { successMessageMode: 'none' }
    );
  },

  async publish(data: AnnouncementPublishFormData) {
    return HttpRequest.post<AnnouncementItem>(
      {
        url: AnnouncementApi.publish,
        data,
      },
      { successMessageMode: 'success' }
    );
  },
};
