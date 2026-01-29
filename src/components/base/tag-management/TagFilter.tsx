import {
  TagOutlined,
  DownOutlined,
  SearchOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import {useQuery} from '@tanstack/react-query';
import {useDebounceFn} from 'ahooks';
import {Dropdown, Button, Space, Input} from 'antd';
import type React from 'react';
import {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {tagsService} from '@/services/common/tags/tagsApi';
import type {Tag} from '@/services/common/tags/tagsModel';

type TagFilterProps = {
  type: 'app';
  value: string[];
  onChange: (tag: string[]) => void;
};

/**
 * 标签过滤
 */
const TagFilter: React.FC<TagFilterProps> = ({type, value, onChange}) => {
  // 关键字
  const [keyword, setKeyword] = useState<string>('');
  // 输入框输入的检索关键字
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const {t} = useTranslation();

  /**
   * 获取标签数据
   */
  const {data} = useQuery({
    queryKey: ['integrated_apps_tagsFilter'],
    queryFn: () => tagsService.getTagsList(type),
  });

  // 防抖输入
  const {run: handleSearch} = useDebounceFn(
    () => {
      setSearchKeyword(keyword);
    },
    {wait: 500},
  );

  /**
   * 输入框关键字改变
   * @param value 输入框值
   */
  const handleKeywordsChange = (value: string) => {
    setKeyword(value);
    handleSearch();
  };

  /**
   * 过滤后的标签
   */
  const filteredTagList = useMemo(() => {
    return (
      data?.filter(
        (tag) => tag.type === type && tag.name.includes(searchKeyword),
      ) || []
    );
  }, [type, data, searchKeyword]);

  /**
   * 当前选中的标签
   */
  const currentTag = useMemo(() => {
    return data?.find((tag) => tag.id === value[0]);
  }, [value, data]);

  /**
   * 选中标签
   */
  const selectTag = (tag: Tag) => {
    if (value.includes(tag.id)) {
      onChange(value.filter((id) => id !== tag.id));
    } else {
      onChange([...value, tag.id]);
    }
  };

  /**
   * 渲染标签
   * @returns 渲染下拉框
   */
  const renderDropDown = () => {
    return (
      <div
        className="relative w-[240px] rounded-lg border-[0.5] shadow-lg backdrop-blur-[5px] bg-[#fffffff2] border-[#10182814]">
        <div className="p-2">
          <Input
            prefix={<SearchOutlined/>}
            allowClear
            value={keyword}
            onChange={(e) => handleKeywordsChange(e.target.value)}
            onClear={() => handleKeywordsChange('')}
          />
        </div>
        <div className="max-h-72 overflow-auto p-1">
          {filteredTagList.map((tag) => (
            <div
              key={tag.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg py-[6px] pl-3 pr-2 hover:bg-[#c8ceda33]"
              onClick={() => selectTag(tag)}
            >
              <div
                title={tag.name}
                className="grow truncate text-sm leading-5 color-[#676f83]"
              >
                {tag.name}
              </div>
              {value.includes(tag.id) && (
                <CheckOutlined className="h-4 w-4 shrink-0 text-[#354052]"/>
              )}
            </div>
          ))}
          {!filteredTagList.length && (
            <div className="flex flex-col items-center gap-1 p-3">
              <TagOutlined className="h-6 w-6 text-gray-400! text-xl"/>
              <div className="text-xs leading-[14px] text-gray-400">
                {t('common.tag.noTag')}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dropdown popupRender={renderDropDown} trigger={['click']}>
      <Button color="default" variant="filled">
        {/* 这里显示选中的标签 */}
        <Space>
          <TagOutlined/>
          <div className='text-[13px] font-medium leading-[18px] text-[#676f83]'>
            {!value.length && t('common.tag.placeholder')}
            {!!value.length && currentTag?.name}
          </div>
          {
            value.length > 1 && (
              <div className='text-xs font-medium leading-[18px] text-[#676f83]'>
                {`+${value.length - 1}`}
              </div>
            )
          }
          {
            !value.length && (
              <div className='p-px'>
                <DownOutlined className='h-3.5 w-3.5 text-[#354052]'/>
              </div>
            )
          }
        </Space>
      </Button>
    </Dropdown>
  );
};
export default TagFilter;
