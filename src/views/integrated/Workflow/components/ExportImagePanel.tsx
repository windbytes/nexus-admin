/**
 * 更多操作 Popover 内容：导出图片
 * 分组为「当前视图」「整个工作流」，每组支持 PNG / JPEG / SVG
 */
import { PictureOutlined } from '@ant-design/icons';
import { Button, Space, Typography } from 'antd';
import type { ExportFormat, ExportScope } from '../hooks/useWorkflowExportImage';
import { useWorkflowExportImage } from '../hooks/useWorkflowExportImage';

const { Text } = Typography;

const FORMATS: { format: ExportFormat; label: string }[] = [
  { format: 'png', label: '导出为 PNG' },
  { format: 'jpeg', label: '导出为 JPEG' },
  { format: 'svg', label: '导出为 SVG' },
];

export function ExportImagePanel() {
  const { exportAsImage, isExporting } = useWorkflowExportImage();

  const handleExport = (scope: ExportScope, format: ExportFormat) => {
    exportAsImage({ scope, format });
  };

  return (
    <div style={{ width: 240 }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space>
          <PictureOutlined />
          <Text strong>导出图片</Text>
        </Space>

        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            当前视图
          </Text>
          <Space direction="vertical" style={{ width: '100%' }}>
            {FORMATS.map(({ format, label }) => (
              <Button
                key={`current-${format}`}
                type="text"
                block
                disabled={isExporting}
                onClick={() => handleExport('current', format)}
                style={{ textAlign: 'left' }}
              >
                {label}
              </Button>
            ))}
          </Space>
        </Space>

        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            整个工作流
          </Text>
          <Space direction="vertical" style={{ width: '100%' }}>
            {FORMATS.map(({ format, label }) => (
              <Button
                key={`full-${format}`}
                type="text"
                block
                disabled={isExporting}
                onClick={() => handleExport('full', format)}
                style={{ textAlign: 'left' }}
              >
                {label}
              </Button>
            ))}
          </Space>
        </Space>
      </Space>
    </div>
  );
}
