import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';

interface TitleProps {
  searchValue: string;
  onSearch: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<any>;
}

/**
 * 搜索菜单模态框标题组件
 * @returns 搜索菜单模态框标题组件
 */
const Title: React.FC<TitleProps> = ({
  searchValue,
  onSearch,
  onKeyDown,
  inputRef
}) => {
  return (
    <div className='flex justify-start items-center'>
      <Input 
        ref={inputRef}
        className='w-[95%]!'
        placeholder='搜索导航菜单 (支持模糊搜索)' 
        variant='borderless'
        value={searchValue}
        onChange={(e) => onSearch(e.target.value)}
        onKeyDown={onKeyDown}
        prefix={<SearchOutlined className='text-[18px] cursor-pointer' />}
        allowClear
      />
    </div>
  );
};

export default Title;