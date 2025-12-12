import { FileImageOutlined } from '@ant-design/icons';
import { FlowDownloadFormat, FlowDownloadService } from '@flowgram.ai/export-plugin';
import { usePlayground, useService } from '@flowgram.ai/free-layout-editor';
import type { MenuProps } from 'antd';
import { App, Button, Dropdown, Tooltip } from 'antd';
import { useEffect, useState } from 'react';

/**
 * 导出图片组件
 * @returns
 */
const ExportImage: React.FC = () => {
  const { message } = App.useApp();
  // 正在导出中
  const [isExporting, setIsExporting] = useState(false);
  const playground = usePlayground();
  const { readonly } = playground.config;
  const downloadService = useService(FlowDownloadService);

  // 监听导出进度
  useEffect(() => {
    const subscription = downloadService.onDownloadingChange((v) => {
      setIsExporting(v);
    });
    return () => subscription.dispose();
  }, [downloadService, readonly]);

  // 处理下载导出
  const handleDownload = async (format: FlowDownloadFormat) => {
    await downloadService.download({ format });
    const formatOption = exportImageMenuItems?.find((option) => option?.key === format);
    if (formatOption) {
      message.success(`导出${formatOption.key}成功`);
    }
  };

  // 导出图片菜单项
  const exportImageMenuItems: MenuProps['items'] = [
    {
      key: 'png',
      label: '导出为 PNG',
      onClick: () => handleDownload(FlowDownloadFormat.PNG),
    },
    {
      key: 'jpeg',
      label: '导出为 JPEG',
      onClick: () => handleDownload(FlowDownloadFormat.JPEG),
    },
    {
      key: 'svg',
      label: '导出为 SVG',
      onClick: () => handleDownload(FlowDownloadFormat.SVG),
    },
    {
      key: 'json',
      label: '导出为 JSON',
      onClick: () => handleDownload(FlowDownloadFormat.JSON),
    },
    {
      key: 'yaml',
      label: '导出为 YAML',
      onClick: () => handleDownload(FlowDownloadFormat.YAML),
    },
  ];

  return (
    <Tooltip title="导出" color="white">
      <Dropdown
        menu={{
          items: exportImageMenuItems,
        }}
        disabled={isExporting}
        trigger={['click']}
        placement="bottomRight"
      >
        <Button type="text" icon={<FileImageOutlined />} onClick={(e) => e.preventDefault()} />
      </Dropdown>
    </Tooltip>
  );
};

export default ExportImage;
