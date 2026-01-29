import { HttpRequest } from '@/utils/request';
import type { Tag } from './tagsModel';

/**
 * 标签相关接口
 */
const TagsApi = {
  /**
   * 获取标签列表
   */
  getTagsList: '/engine/tags/getTagsList',
  /**
   * 新增标签
   */
  addTag: '/engine/tags/addTag',
  /**
   * 更新标签
   */
  updateTag: '/engine/tags/updateTag',
  /**
   * 绑定标签
   */
  bindTag: '/engine/tags/bindTags',
  /**
   * 解绑标签
   */
  unbindTag: '/engine/tags/unbindTag',

  /**
   * 删除标签
   */
  deleteTag: '/engine/tags/deleteTag',
};

/**
 * 标签服务接口
 */
export interface ITagsService {
  /**
   * 获取标签列表
   * @param type 标签类型
   */
  getTagsList(type: string): Promise<Tag[]>;

  /**
   * 新增标签
   */
  addTag(tag: Partial<Tag>): Promise<Tag>;
  /**
   * 更新标签
   */
  updateTag(tag: Partial<Tag>): Promise<boolean>;

  /**
   * 删除标签
   */
  deleteTag(tagID: string): Promise<boolean>;

  /**
   * 绑定标签
   */
  bindTag(tagIDs: string[], targetID: string, type: string): Promise<boolean>;
  /**
   * 解绑标签
   */
  unbindTag(tagID: string, targetID: string, type: string): Promise<boolean>;
}

/**
 * 标签服务实现
 */
export const tagsService: ITagsService = {
  /**
   * 获取标签列表
   */
  async getTagsList(type: string): Promise<Tag[]> {
    const response = await HttpRequest.get(
      {
        url: TagsApi.getTagsList,
        params: { type },
      },
      {
        successMessageMode: 'none',
      },
    );
    return response;
  },

  /**
   * 新增标签
   */
  async addTag(tag: Partial<Tag>): Promise<Tag> {
    const response = await HttpRequest.post({
      url: TagsApi.addTag,
      data: tag,
    });
    return response;
  },
  /**
   * 更新标签
   */
  async updateTag(tag: Partial<Tag>): Promise<boolean> {
    const response = await HttpRequest.post({
      url: TagsApi.updateTag,
      data: tag,
    });
    return response;
  },

  /**
   * 删除标签
   */
  async deleteTag(tagID: string): Promise<boolean> {
    const response = await HttpRequest.delete({
      url: TagsApi.deleteTag,
      params: { tagID },
    });
    return response;
  },
  /**
   * 绑定标签
   */
  async bindTag(
    tagIDs: string[],
    targetID: string,
    type: string,
  ): Promise<boolean> {
    const response = await HttpRequest.post({
      url: TagsApi.bindTag,
      data: { tagIDs, targetID, type },
    });
    return response;
  },
  /**
   * 解绑标签
   */
  async unbindTag(
    tagID: string,
    targetID: string,
    type: string,
  ): Promise<boolean> {
    const response = await HttpRequest.post({
      url: TagsApi.unbindTag,
      data: { tagID, targetID, type },
    });
    return response;
  },
};
