import { HttpRequest } from '@/utils/request';
import type { RoleModel } from '../system/role/type';

/**
 * 框架相关接口
 */
const FrameworkApi = {
  /**
   * 根据用户ID获取角色列表
   */
  getUserRolesByUserName: '/sys/framework/queryRolesByUserName',
};

/**
 * 上传进度回调
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * 框架相关接口
 */
interface IFrameworkService {
  /**
   * 根据用户名获取角色列表
   */
  getUserRolesByUserName(username: string): Promise<RoleModel[]>;

  uploadChunk(
    uploadUrl: string,
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number,
    fileName: string,
    fileHash: string,
    onProgress?: UploadProgressCallback
  ): Promise<boolean>;
}

/**
 * 框架相关接口实现
 */
export const frameworkService: IFrameworkService = {
  /*
   * 根据用户ID获取角色列表
   * @param userName 用户名
   * @returns 角色列表
   */
  getUserRolesByUserName(username: string): Promise<RoleModel[]> {
    return HttpRequest.get(
      {
        url: FrameworkApi.getUserRolesByUserName,
        params: { username },
        adapter: 'fetch',
      },
      { successMessageMode: 'none' }
    );
  },

  /**
   * 上传文件分片
   * @param uploadUrl 上传URL
   * @param chunk 文件分片
   * @param chunkIndex 文件分片索引
   * @param totalChunks 文件分片总数
   * @param fileName 文件名称
   * @param fileHash 文件哈希
   * @param onProgress 上传进度回调
   * @returns 是否上传成功
   */
  async uploadChunk(
    uploadUrl: string,
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number,
    fileName: string,
    fileHash: string,
    onProgress?: UploadProgressCallback
  ): Promise<boolean> {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('fileName', fileName);
    formData.append('fileHash', fileHash);
    // 在 frameworkApi.ts 的 uploadChunk 方法中添加
    console.log('FormData:', formData);
    console.log('FormData instanceof FormData:', formData instanceof FormData);
    for (const pair of formData.entries()) {
      console.log('FormData entry:', pair[0], pair[1]);
    }

    const response = await HttpRequest.post<boolean>(
      {
        url: uploadUrl,
        data: formData,
        // 不需要手动设置 headers，拦截器会自动处理 FormData 的 Content-Type
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      },
      { successMessageMode: 'none' }
    );
    return response;
  },
};
