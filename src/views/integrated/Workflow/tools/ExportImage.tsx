import { FileImageOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Tooltip } from 'antd';

/**
 * 导出图片组件
 * @returns
 */
const ExportImage: React.FC = () => {
  // 导出图片菜单项
  const exportImageMenuItems: MenuProps['items'] = [
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
  ];

  return (
    <Tooltip title="导出图片" color="white">
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
