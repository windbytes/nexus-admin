import { Dropdown, Button } from 'antd';
import { ColumnHeightOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { TableDensity } from '../types';

export interface DensitySettingProps {
  value: TableDensity;
  onChange: (density: TableDensity) => void;
}

/**
 * 表格密度设置组件
 */
export function DensitySetting({ value, onChange }: DensitySettingProps) {
  const items: MenuProps['items'] = [
    {
      key: 'large',
      label: '默认',
      onClick: () => onChange('large'),
    },
    {
      key: 'middle',
      label: '中等',
      onClick: () => onChange('middle'),
    },
    {
      key: 'small',
      label: '紧凑',
      onClick: () => onChange('small'),
    },
  ];

  return (
    <Dropdown menu={{ items, selectedKeys: [value] }} trigger={['click']}>
      <Button type="text" icon={<ColumnHeightOutlined />} />
    </Dropdown>
  );
}
