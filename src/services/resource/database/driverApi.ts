import type { PageQueryParams } from '@/types/global';
import { HttpRequest } from '@/utils/request';

/**
 * 数据库驱动信息
 */
export interface DatabaseDriver {
  id: string;
  name: string;
  driverClass: string;
  driverVersion: string;
  databaseType: string;
  fileName: string;
  fileSize: number;
  filePath: string;
  uploadTime: string;
  status: boolean;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

/**
 * 驱动搜索参数
 */
export interface DriverSearchParams extends PageQueryParams {
  name?: string;
  databaseType?: string;
  status?: boolean;
}

/**
 * 驱动表单数据
 */
export interface DriverFormData {
  id?: string;
  name: string;
  driverClass: string;
  driverVersion?: string;
  databaseType: string;
  fileName?: string;
  filePath?: string;
  status?: boolean;
  remark?: string;
}

/**
 * 分页结果
 */
export interface PageResult<T> {
  records: T[];
  total: number;
  totalRow?: number;
  pageNum: number;
  pageSize: number;
}

/**
 * 文件分片信息
 */
export interface FileChunk {
  chunk: Blob;
  chunkIndex: number;
  totalChunks: number;
  fileName: string;
  fileHash: string;
}

/**
 * 驱动API路径
 */
export enum DriverAction {
  /**
   * 分页查询驱动列表
   */
  list = '/resource/driver/list',
  /**
   * 新增驱动
   */
  add = '/resource/driver/add',
  /**
   * 更新驱动
   */
  update = '/resource/driver/update',
  /**
   * 删除驱动
   */
  delete = '/resource/driver/delete',
  /**
   * 批量删除驱动
   */
  batchDelete = '/resource/driver/batchDelete',
  /**
   * 获取驱动详情
   */
  detail = '/resource/driver/detail',
  /**
   * 上传驱动
   */
  upload = '/resource/driver/upload',
  /**
   * 检查文件分片是否已上传
   */
  checkChunk = '/resource/driver/checkChunk',
  /**
   * 合并文件分片
   */
  mergeChunks = '/resource/driver/mergeChunks',
  /**
   * 删除已上传的文件（包括分片和合并后的文件）
   */
  deleteUploadedFile = '/resource/driver/deleteUploadedFile',
  /**
   * 下载驱动
   */
  download = '/resource/driver/download',
  /**
   * 批量下载驱动
   */
  batchDownload = '/resource/driver/batchDownload',
}

/**
 * 数据库驱动服务
 */
export const driverService = {
  /**
   * 分页查询驱动列表
   */
  async getDriverList(params: DriverSearchParams): Promise<PageResult<DatabaseDriver>> {
    const response = await HttpRequest.post<PageResult<DatabaseDriver>>(
      {
        url: DriverAction.list,
        data: params,
      },
      { successMessageMode: 'none' }
    );
    return response;
  },

  /**
   * 新增驱动
   */
  async addDriver(data: DriverFormData): Promise<DatabaseDriver> {
    const response = await HttpRequest.post<DatabaseDriver>({
      url: DriverAction.add,
      data,
    });
    return response;
  },

  /**
   * 更新驱动
   */
  async updateDriver(data: DriverFormData): Promise<DatabaseDriver> {
    const response = await HttpRequest.post<DatabaseDriver>({
      url: DriverAction.update,
      data,
    });
    return response;
  },

  /**
   * 删除驱动
   */
  async deleteDriver(id: string): Promise<boolean> {
    const response = await HttpRequest.post<boolean>({
      url: DriverAction.delete,
      data: { id },
    });
    return response;
  },

  /**
   * 批量删除驱动
   */
  async batchDeleteDriver(ids: string[]): Promise<boolean> {
    const response = await HttpRequest.post<boolean>({
      url: DriverAction.batchDelete,
      data: { ids },
    });
    return response;
  },

  /**
   * 获取驱动详情
   */
  async getDriverDetail(id: string): Promise<DatabaseDriver> {
    const response = await HttpRequest.get<DatabaseDriver>({
      url: `${DriverAction.detail}/${id}`,
    });
    return response;
  },

  /**
   * 检查文件分片是否已上传
   */
  async checkChunk(fileHash: string, chunkIndex: number): Promise<boolean> {
    const response = await HttpRequest.post<boolean>(
      {
        url: DriverAction.checkChunk,
        data: { fileHash, chunkIndex },
      },
      { successMessageMode: 'none' }
    );
    return response;
  },

  /**
   * 合并文件分片
   */
  async mergeChunks(fileName: string, fileHash: string): Promise<{ filePath: string }> {
    const response = await HttpRequest.post<{ filePath: string }>({
      url: DriverAction.mergeChunks,
      data: { fileName, fileHash },
    });
    return response;
  },

  /**
   * 删除已上传的文件（包括分片和合并后的文件）
   * @param fileHash 文件哈希值
   * @param fileName 合并后的文件名（可选，如果有则同时清理合并后的文件）
   */
  async deleteUploadedFile(fileHash: string, fileName?: string): Promise<boolean> {
    const response = await HttpRequest.post<boolean>(
      {
        url: DriverAction.deleteUploadedFile,
        data: { fileHash, fileName },
      },
      { successMessageMode: 'none' }
    );
    return response;
  },

  /**
   * 下载驱动文件
   */
  async downloadDriver(id: string, fileName: string): Promise<void> {
    const response = await HttpRequest.postDownload<Blob>({
      url: `${DriverAction.download}/${id}`,
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
   * 批量下载驱动文件
   */
  async batchDownloadDriver(ids: string[]): Promise<void> {
    const response = await HttpRequest.postDownload<Blob>({
      url: DriverAction.batchDownload,
      data: { ids },
      responseType: 'blob',
    });

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `drivers_${Date.now()}.zip`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
