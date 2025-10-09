import type React from 'react';
import { memo, useState } from 'react';
import { Upload, App } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Dragger } = Upload;

interface FileUploadEditorProps {
  onFileChange: (file: File | null) => void;
  disabled: boolean;
}

/**
 * 文件上传编辑器组件
 */
const FileUploadEditor: React.FC<FileUploadEditorProps> = memo(({ onFileChange, disabled }) => {
  const { message } = App.useApp();
  const [fileList, setFileList] = useState<any[]>([]);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    fileList,
    accept: '.wsdl,.xml',
    beforeUpload: (file) => {
      // 验证文件类型
      const isValidType = file.name.endsWith('.wsdl') || file.name.endsWith('.xml');
      if (!isValidType) {
        message.error('只支持 .wsdl 或 .xml 格式的文件！');
        return false;
      }

      // 验证文件大小（最大10MB）
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        message.error('文件大小不能超过 10MB！');
        return false;
      }

      setFileList([file]);
      onFileChange(file);
      
      return false; // 阻止自动上传
    },
    onRemove: () => {
      setFileList([]);
      onFileChange(null);
    },
    disabled,
  };

  return (
    <div className="py-4">
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽WSDL文件到此区域</p>
        <p className="ant-upload-hint">
          支持 .wsdl 或 .xml 格式文件，最大 10MB
        </p>
      </Dragger>
    </div>
  );
});

FileUploadEditor.displayName = 'FileUploadEditor';

export default FileUploadEditor;

