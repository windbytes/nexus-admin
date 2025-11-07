import { FileImageOutlined } from '@ant-design/icons';
import { Button, Dropdown, Tooltip } from 'antd';
import type { MenuProps } from 'antd';

/**
 * 导出图片组件
 * @returns
 */
const ExportImage: React.FC = () => {
  // 导出图片菜单项
  const exportImageMenuItems: MenuProps['items'] = [
    {
      type: 'group',
      label: '当前视图',
      children: [
        {
          key: 'current-view-png',
          label: '导出为 PNG',
          onClick: () => console.log('导出当前视图为 PNG'),
        },
        {
          key: 'current-view-jpeg',
          label: '导出为 JPEG',
          onClick: () => console.log('导出当前视图为 JPEG'),
        },
        {
          key: 'current-view-svg',
          label: '导出为 SVG',
          onClick: () => console.log('导出当前视图为 SVG'),
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      type: 'group',
      label: '整个流程',
      children: [
        {
          key: 'workflow-png',
          label: '导出为 PNG',
          onClick: () => console.log('导出整个流程为 PNG'),
        },
        {
          key: 'workflow-jpeg',
          label: '导出为 JPEG',
          onClick: () => console.log('导出整个流程为 JPEG'),
        },
        {
          key: 'workflow-svg',
          label: '导出为 SVG',
          onClick: () => console.log('导出整个流程为 SVG'),
        },
      ],
    },
  ];

  return (
    <Tooltip title="导出图片">
      <Dropdown
        menu={{
          items: exportImageMenuItems,
        }}
        trigger={['click']}
        placement="bottomRight"
      >
        <Button type="text" icon={<FileImageOutlined />} onClick={(e) => e.preventDefault()} />
      </Dropdown>
    </Tooltip>
  );
};

export default ExportImage;

