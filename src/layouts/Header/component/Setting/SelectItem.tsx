import type { BasicOptions } from '@/types/global';
import { Select } from 'antd';
import "./switchItem.scss";
import classNames from '@/utils/classnames';

/**
 * 选择项
 * @returns
 */
const SelectItem: React.FC<SelectItemProps> = (props) => {
  const { title, disabled, placeholder, items } = props;

  return (
    <div
      className={classNames('select-item', {
        'pointer-events-none opacity-50': disabled,
      })}
    >
      <span className='flex items-center text-sm leading-5'>
        {title}
      </span>
      {/* Select组件 */}
      <Select options={items} disabled={disabled} placeholder={placeholder} className='w-[165px]'/>
    </div>
  );
};
export default SelectItem;

export interface SelectItemProps {
  title?: string;
  disabled?: boolean;
  placeholder?: string;
  items?: BasicOptions[];
}
