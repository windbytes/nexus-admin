import { ColumnHeightOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Dropdown } from 'antd';
import type { TableDensity } from '../types';

export interface DensitySettingProps {
  value: TableDensity;
  onChange: (density: TableDensity) => void;
}

/**
 * 表格密度下拉设置。
 *
 * @param props.value - 当前密度
 * @param props.onChange - 密度变更回调
 * @returns 密度切换按钮 + 下拉菜单
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
    <Dropdown menu={{ items, selectedKeys: value ? [value] : [] }} trigger={['click']}>
      <Button type="text" icon={<ColumnHeightOutlined />} />
    </Dropdown>
  );
}
