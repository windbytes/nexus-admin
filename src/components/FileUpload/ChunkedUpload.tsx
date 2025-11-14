import { frameworkService } from '@/services/framework/frameworkApi';
import { driverService } from '@/services/resource/database/driverApi';
import { InboxOutlined } from '@ant-design/icons';
import { App, Progress, Upload, type UploadFile, type UploadProps } from 'antd';
import CryptoJS from 'crypto-js';
import type React from 'react';
import { memo, useCallback, useState } from 'react';

const { Dragger } = Upload;

interface ChunkedUploadProps {
  uploadUrl: string;
  onUploadSuccess: (filePath: string, fileName: string) => void;
  onUploadError?: (error: Error) => void;
  accept?: string;
  maxSize?: number; // MB
  chunkSize?: number; // MB
}

/**
 * 文件分片上传组件（支持断点续传、大文件上传）
 */
const ChunkedUpload: React.FC<ChunkedUploadProps> = memo(
  ({ uploadUrl, onUploadSuccess, onUploadError, accept = '.jar', maxSize = 500, chunkSize = 2 }) => {
    const { message } = App.useApp();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    /**
     * 计算文件哈希值（用于断点续传标识）
     */
    const calculateFileHash = useCallback((file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
          const hash = CryptoJS.MD5(wordArray).toString();
          resolve(hash);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    }, []);

    /**
     * 文件分片上传
     */
    const uploadFileInChunks = useCallback(
      async (file: File) => {
        setUploading(true);
        setUploadProgress(0);

        try {
          // 计算文件哈希
          const fileHash = await calculateFileHash(file);
          const chunkSizeBytes = chunkSize * 1024 * 1024; // 转换为字节
          const totalChunks = Math.ceil(file.size / chunkSizeBytes);

          // 已上传的分片数量
          let uploadedChunks = 0;

          // 上传每个分片
          for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            // 检查该分片是否已上传（断点续传）
            const isChunkUploaded = await driverService.checkChunk(fileHash, chunkIndex);

            if (isChunkUploaded) {
              uploadedChunks++;
              const progress = Math.round((uploadedChunks / totalChunks) * 100);
              setUploadProgress(progress);
              continue;
            }

            // 切分文件
            const start = chunkIndex * chunkSizeBytes;
            const end = Math.min(start + chunkSizeBytes, file.size);
            const chunk = file.slice(start, end);

            // 上传分片
            await frameworkService.uploadChunk(
              uploadUrl,
              chunk,
              chunkIndex,
              totalChunks,
              file.name,
              fileHash,
              (progress) => {
                // 计算总进度
                const totalProgress = Math.round(((uploadedChunks + progress / 100) / totalChunks) * 100);
                setUploadProgress(totalProgress);
              }
            );

            uploadedChunks++;
          }

          // 合并分片
          message.loading({ content: '正在合并文件...', key: 'merging' });
          const result = await driverService.mergeChunks(file.name, fileHash);
          message.success({ content: '文件上传成功！', key: 'merging' });

          // 回调
          onUploadSuccess(result.filePath, file.name);
          setFileList([]);
          setUploadProgress(0);
        } catch (error) {
          message.error('文件上传失败，请重试！');
          if (onUploadError && error instanceof Error) {
            onUploadError(error);
          }
          console.error('文件上传失败:', error);
        } finally {
          setUploading(false);
        }
      },
      [calculateFileHash, chunkSize, message, onUploadSuccess, onUploadError]
    );

    /**
     * 上传前的文件校验
     */
    const beforeUpload = useCallback(
      (file: File) => {
        // 检查文件类型
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        const acceptedExtensions = accept.split(',').map((ext) => ext.trim().toLowerCase());

        if (!acceptedExtensions.includes(fileExtension)) {
          message.error(`只支持 ${accept} 格式的文件！`);
          return Upload.LIST_IGNORE;
        }

        // 检查文件大小
        const fileSizeMB = file.size / 1024 / 1024;
        if (fileSizeMB > maxSize) {
          message.error(`文件大小不能超过 ${maxSize}MB！`);
          return Upload.LIST_IGNORE;
        }

        // 开始上传
        uploadFileInChunks(file);

        return false; // 阻止自动上传
      },
      [accept, maxSize, message, uploadFileInChunks]
    );

    /**
     * 文件列表变化处理
     */
    const handleChange: UploadProps['onChange'] = useCallback((info: any) => {
      let newFileList = [...info.fileList];
      // 只保留最新的一个文件
      newFileList = newFileList.slice(-1);
      setFileList(newFileList);
    }, []);

    /**
     * 删除文件
     */
    const handleRemove = useCallback(() => {
      setFileList([]);
      setUploadProgress(0);
    }, []);

    return (
      <div className="chunked-upload-wrapper">
        <Dragger
          fileList={fileList}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          onRemove={handleRemove}
          disabled={uploading}
          accept={accept}
          maxCount={1}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持单个文件上传，支持大文件分片上传和断点续传
            <br />
            文件格式：{accept}，大小限制：{maxSize}MB
          </p>
        </Dragger>

        {uploading && (
          <div className="mt-4">
            <Progress percent={uploadProgress} status="active" />
            <p className="text-center text-gray-500 text-sm mt-2">正在上传文件，请勿关闭页面...</p>
          </div>
        )}
      </div>
    );
  }
);

export default ChunkedUpload;
