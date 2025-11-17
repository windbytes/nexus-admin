import { HttpRequest } from '@/utils/request';
import type { RoleModel } from '../system/role/type';

/**
 * 框架相关接口
 */
export const FrameworkApi = {
  /**
   * 根据用户ID获取角色列表
   */
  getUserRolesByUserName: '/sys/framework/queryRolesByUserName',

  /**
   * 上传文件分片
   */
  uploadChunk: '/files/uploadChunk',
  /**
   * 检查文件分片是否已上传
   */
  checkChunk: '/files/checkChunk',
  /**
   * 合并文件分片
   */
  mergeChunks: '/files/mergeChunks',
  /**
   * 删除已上传的文件（包括分片和合并后的文件）
   */
  deleteUploadedFile: '/files/deleteUploadedFile',
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

  /**
   * 上传分片
   * @param chunk 分片
   * @param chunkIndex 分片索引
   * @param totalChunks 总分片数目
   * @param fileName 文件名
   * @param fileHash 分片hash
   * @param onProgress 进度
   */
  uploadChunk(
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number,
    fileName: string,
    fileHash: string,
    onProgress?: UploadProgressCallback
  ): Promise<boolean>;

  /**
   * 检查文件分片是否已上传
   */
  checkChunk(fileHash: string, chunkIndex: number): Promise<boolean>;

  /**
   * 合并文件分片
   */
  mergeChunks(fileName: string, fileHash: string): Promise<{ filePath: string }>;

  /**
   * 删除已上传的文件（包括分片和合并后的文件）
   */
  deleteUploadedFile(fileHash: string, fileName?: string): Promise<boolean>;

  /**
   * 下载文件
   */
  downloadFile(downloadUrl: string, fileName: string): Promise<void>;

  /**
   * 批量下载文件
   */
  batchDownloadFile(batchDownloadUrl: string, ids: string[], fileName?: string): Promise<void>;
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
        url: FrameworkApi.uploadChunk,
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

  /**
   * 检查文件分片是否已上传
   * @param fileHash 文件哈希值
   * @param chunkIndex 分片索引
   * @returns 是否已上传
   */
  async checkChunk(fileHash: string, chunkIndex: number): Promise<boolean> {
    const response = await HttpRequest.post<boolean>(
      {
        url: FrameworkApi.checkChunk,
        data: { fileHash, chunkIndex },
      },
      { successMessageMode: 'none' }
    );
    return response;
  },

  /**
   * 合并文件分片
   * @param fileName 文件名
   * @param fileHash 文件哈希值
   * @returns 合并后的文件路径
   */
  async mergeChunks(fileName: string, fileHash: string): Promise<{ filePath: string }> {
    const response = await HttpRequest.post<{ filePath: string }>({
      url: FrameworkApi.mergeChunks,
      data: { fileName, fileHash },
    });
    return response;
  },

  /**
   * 删除已上传的文件（包括分片和合并后的文件）
   * @param fileHash 文件哈希值
   * @param fileName 合并后的文件名（可选，如果有则同时清理合并后的文件）
   * @returns 是否删除成功
   */
  async deleteUploadedFile(fileHash: string, fileName?: string): Promise<boolean> {
    const response = await HttpRequest.post<boolean>(
      {
        url: FrameworkApi.deleteUploadedFile,
        data: { fileHash, fileName },
      },
      { successMessageMode: 'none' }
    );
    return response;
  },

  /**
   * 下载文件
   * @param downloadUrl 下载URL
   * @param fileName 文件名
   */
  async downloadFile(downloadUrl: string, fileName: string): Promise<void> {
    const response = await HttpRequest.postDownload<Blob>({
      url: downloadUrl,
      responseType: 'blob',
    });

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * 批量下载文件
   * @param batchDownloadUrl 批量下载URL
   * @param ids 文件ID列表
   * @param fileName 文件名（可选，默认为带时间戳的zip文件名）
   */
  async batchDownloadFile(batchDownloadUrl: string, ids: string[], fileName?: string): Promise<void> {
    const response = await HttpRequest.postDownload<Blob>({
      url: batchDownloadUrl,
      data: { ids },
      responseType: 'blob',
    });

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || `files_${Date.now()}.zip`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
