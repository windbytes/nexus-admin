import type { HtmlContentProps } from '@/components/popover';
import CustomPopover from '@/components/popover';
import { tagsService } from '@/services/common/tags/tagsApi';
import type { Tag } from '@/services/common/tags/tagsModel';
import { useTagStore } from '@/stores/useTagStore';
import cn from '@/utils/classnames';
import { PlusOutlined, SearchOutlined, TagOutlined, TagsOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { useUnmount } from 'ahooks';
import { App, Checkbox, Divider, Input } from 'antd';
import { noop } from 'lodash-es';
import type React from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type TagSelectorProps = {
  // 对应的应用ID
  targetID: string;
  isPopover?: boolean;
  position?: 'bl' | 'br';
  type: string;
  value: string[];
  selectedTags: Tag[];
  onCacheUpdate: (tags: Tag[]) => void;
  onChange?: () => void;
};

type PanelProps = {
  onCreate: () => void;
} & HtmlContentProps &
  TagSelectorProps;

/**
 * 标签面板
 */
const Panel: React.FC<PanelProps> = (props) => {
  const { t } = useTranslation();
  const { notification } = App.useApp();
  const { type, targetID, value, selectedTags, onCacheUpdate, onChange } = props;
  const { tagList, setTagList, setShowTagManagementModal } = useTagStore();

  // 选中的标签id
  const [selectedTagIDs, setSelectedTagIDs] = useState<string[]>([]);
  // 检索关键词
  const [keywords, setKeywords] = useState<string>('');

  // 输入框值改变
  const handleKeywordsChange = (value: string) => {
    setKeywords(value);
  };

  // 不存在的节点
 const notExisted = useMemo(() => {
    return tagList.every((tag) => tag.type === type && tag.name !== keywords);
  }, [type, tagList, keywords]);

  // 过滤已经选中的标签列表
  const filteredSelectedTagList = useMemo(() => {
    return selectedTags.filter((tag) => tag.name.includes(keywords));
  }, [keywords, selectedTags]);

  // 过滤后的标签列表
  const filteredTagList = useMemo(() => {
    return tagList.filter(
      (tag) =>
        tag.type === type &&
        !value.includes(tag.id) &&
        tag.name.includes(keywords),
    );
  }, [type, tagList, value, keywords]);

  const [creating, setCreating] = useState<boolean>(false);

  // 标签新建
  const createTagMutation = useMutation({
    mutationFn: ({ name, type }: { name: string; type: string }) => tagsService.addTag({ name, type }),
    // 请求前设置状态
    onMutate: () => {
      setCreating(true);
    },
    onSuccess: (data) => {
      setCreating(true);
      setTagList([...tagList, data]);
      notification.success({
        title: t('common.tag.created'),
        description: t('common.tag.created'),
      });
      setKeywords('');
      setCreating(false);
    },
    onError: (error) => {
      notification.error({
        title: t('common.tag.failed'),
        description: `${t('common.tag.failed')}:${error.message}`,
      });
      setCreating(false);
    },
  });

  // 标签绑定
  const bindTagMutation = useMutation({
    mutationFn: (tagIDs: string[]) => tagsService.bindTag(tagIDs, targetID, type),
    onSuccess: () => {
      notification.success({
        title: t('common.actionMsg.modifiedSuccessfully'),
      });
    },
    onError: (error) => {
      notification.error({
        title: t('common.actionMsg.modifiedFailed'),
        description: `${t('common.actionMsg.modifiedFailed')}:${error.message}`,
      });
    },
  });

  // 标签解绑
  const unbindTagMutation = useMutation({
    mutationFn: (tagID: string) => tagsService.unbindTag(tagID, targetID, type),
    onSuccess: () => {
      notification.success({
        title: t('common.actionMsg.modifiedSuccessfully'),
      });
    },
    onError: (error) => {
      notification.error({
        title: t('common.actionMsg.modifiedFailed'),
        description: `${t('common.actionMsg.modifiedFailed')}:${error.message}`,
      });
    },
  });

  /**
   * 新建标签
   */
  const createNewTag = async () => {
    if (!keywords) {
      return;
    }
    if (creating) {
      return;
    }
    await createTagMutation.mutateAsync({ name: keywords, type });
  };

  /**
   * 选中标签
   */
  const selectTag = (tag: Tag) => {
    if (selectedTagIDs.includes(tag.id)) {
      setSelectedTagIDs(selectedTagIDs.filter((v) => v !== tag.id));
    } else {
      setSelectedTagIDs([...selectedTagIDs, tag.id]);
    }
  };

  /**
   * 值未改变
   */
 const valueNotChanged = useMemo(() => {
    return (
      value.length === selectedTagIDs.length &&
      value.every((v) => selectedTagIDs.includes(v)) &&
      selectedTagIDs.every((v) => value.includes(v))
    );
  }, [value, selectedTagIDs]);

  /**
   * 处理值改变
   */
  const handleValueChange = () => {
    const addTagIDs = selectedTagIDs.filter((v) => !!value.includes(v));
    const removeTagIDs = value.filter((v) => !selectedTagIDs.includes(v));

    const selectedTags = tagList.filter((tag) => selectedTagIDs.includes(tag.id));
    onCacheUpdate(selectedTags);

    Promise.all([
      ...(addTagIDs.length ? [bindTagMutation.mutateAsync(addTagIDs)] : []),
      ...(removeTagIDs.length ? removeTagIDs.map((id) => unbindTagMutation.mutateAsync(id)) : []),
    ]).finally(() => {
      if (onChange) {
        onChange();
      }
    });
  };

  /**
   * 组件卸载的时候（判定是否发生了改变）
   */
  useUnmount(() => {
    if (valueNotChanged) {
      return;
    }
    handleValueChange();
  });

  return (
    <div className="relative w-[300px] rounded-lg border-[0.5px] border-blue-100 bg-white">
      <div className="p-2">
        <Input
          prefix={<SearchOutlined />}
          placeholder={t('common.tag.selectorPlaceholder') || ''}
          allowClear
          value={keywords}
          onChange={(e) => handleKeywordsChange(e.target.value)}
          onClear={() => handleKeywordsChange('')}
        />
      </div>
      <Divider className="my-0! h-px!" />
      {/* 检索到不存在的提示创建标签 */}
      {keywords && notExisted && (
        <div className="p-1">
          <div
            className="flex cursor-pointer items-center gap-2 rounded-lg py-[6px] pl-3 pr-2 hover:bg-gray-200"
            onClick={createNewTag}
          >
            <PlusOutlined className="h-4 w-4 text-[#354052]" />
            <div className="grow truncate text-sm leading-5 text-[#354052]">
              {t('common.tag.create')}
              <span className="font-medium">{`"${keywords}"`}</span>
            </div>
          </div>
        </div>
      )}
      {keywords && notExisted && filteredTagList.length > 0 && <Divider className="my-0! h-px!" />}
      {/* 过滤后的标签和过滤后选中的标签 */}
      {(filteredTagList.length > 0 || filteredSelectedTagList.length > 0) && (
        <div className="max-h-[172px] overflow-auto p-1">
          {filteredSelectedTagList.map((tag) => (
            <div
              key={tag.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg py-[6px] pl-3 pr-2 hover:bg-gray-200"
              onClick={() => selectTag(tag)}
            >
              <Checkbox checked={selectedTagIDs.includes(tag.id)} className="shrink-0" onChange={noop} />
              <div title={tag.name} className="grow truncate text-sm leading-5 text-[#354052]">
                {tag.name}
              </div>
            </div>
          ))}
          {filteredTagList.map((tag) => (
            <div
              key={tag.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg py-[6px] pl-3 pr-2 hover:bg-gray-200"
              onClick={() => selectTag(tag)}
            >
              <Checkbox className="shrink-0" checked={selectedTagIDs.includes(tag.id)} onChange={noop} />
              <div title={tag.name} className="grow truncate text-sm leading-5 text-[#354052]">
                {tag.name}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* 如果过滤后没有标签提示没有 */}
      {!keywords && !filteredTagList.length && !filteredSelectedTagList.length && (
        <div className="p-1">
          <div className="flex flex-col items-center gap-1 p-3">
            <TagOutlined className="h-6 w-6 text-gray-400! text-xl" />
            <div className="text-sm leading-[14px] text-gray-400">{t('common.tag.noTag')}</div>
          </div>
        </div>
      )}
      <Divider className="my-0! h-px!" />
      {/* 管理标签 */}
      <div className="p-1">
        <div
          className="flex cursor-pointer items-center gap-2 rounded-lg py-[6px] pl-3 pr-2  hover:bg-gray-200"
          onClick={() => setShowTagManagementModal(true)}
        >
          <TagsOutlined className="h-4 w-4 text-gray-400" />
          <div className="grow truncate text-sm leading-5 text-gray-400">{t('common.tag.manageTags')}</div>
        </div>
      </div>
    </div>
  );
};

/**
 * 标签选择器
 */
const TagSelector: React.FC<TagSelectorProps> = ({
  targetID,
  isPopover = true,
  position,
  type,
  value,
  selectedTags,
  onCacheUpdate,
  onChange,
}) => {
  const { t } = useTranslation();
  const { tagList, setTagList } = useTagStore();

  /**
   * 获取标签列表
   * @returns 标签列表
   */
  const getTagList = async () => {
    const tags = await tagsService.getTagsList(type);
    setTagList(tags);
  };

  /**
   * 用于显示选中标签的内容
   */
 const triggerContent = useMemo(() => {
    if (selectedTags?.length) {
      return selectedTags
        .filter((tag) => tagList.find((t) => t.id === tag.id))
        .map((tag) => tag.name)
        .join(', ');
    }
    return '';
  }, [selectedTags, tagList]);

  /**
   * 触发器内容
   * @returns 触发器内容
   */
  const Trigger = () => {
    return (
      <div
        className={cn(
          'relative flex w-full cursor-pointer items-center gap-1 rounded-md px-2 py-[7px] hover:bg-[#c8ceda33]',
        )}
      >
        <TagOutlined className="h-3 w-3 shrink-0" />
        <div className="text-[#98a2b2] grow truncate text-start text-[13px] font-normal leading-5">
          {!triggerContent ? t('common.tag.addTag') : triggerContent}
        </div>
      </div>
    );
  };

  return (
    <>
      {isPopover && (
        <CustomPopover
          htmlContent={
            <Panel
              type={type}
              targetID={targetID}
              value={value}
              selectedTags={selectedTags}
              onCacheUpdate={onCacheUpdate}
              onChange={onChange}
              onCreate={getTagList}
            />
          }
          position={position}
          trigger="click"
          btnElement={<Trigger />}
          btnClassName={(open) =>
            cn(
              open ? '!bg-[#c8ceda33] !text-[#101828]' : '!bg-transparent',
              '!w-full !border-0 !p-0 !text-[#101828] hover:!bg-[#c8ceda33] hover:!text-[#101828]',
            )
          }
          popupClassName="!w-full !ring-0"
          className="z-20! h-fit w-[324px]!"
        />
      )}
    </>
  );
};
export default TagSelector;
