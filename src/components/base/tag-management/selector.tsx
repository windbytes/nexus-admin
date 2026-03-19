import { PlusOutlined, SearchOutlined, TagOutlined, TagsOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { Tag as AntdTag, App, Checkbox, Divider, Input, Tooltip } from 'antd';
import { noop } from 'lodash-es';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Tag } from '@/components/base/tag-management/constant';
import type { HtmlContentProps } from '@/components/popover';
import CustomPopover from '@/components/popover';
import { tagService } from '@/services/engine';
import { useTagStore } from '@/stores/useTagStore';
import cn from '@/utils/classnames';

const TAG_TYPE_COLOR_PALETTE = [
  '#2F54EB', // blue
  '#13C2C2', // cyan
  '#52C41A', // green
  '#FAAD14', // gold
  '#FA541C', // volcano
  '#EB2F96', // magenta
  '#722ED1', // purple
  '#A0D911', // lime
  '#1890FF', // geekblue-ish
  '#F5222D', // red
];

function hashStringToIndex(input: string, modulo: number) {
  // djb2
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash) % modulo;
}

function getTagColorByType(type?: string) {
  if (!type) {
    return TAG_TYPE_COLOR_PALETTE[0];
  }
  const idx = hashStringToIndex(type, TAG_TYPE_COLOR_PALETTE.length);
  return TAG_TYPE_COLOR_PALETTE[idx];
}

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
  const { type, targetID, value, selectedTags, onCacheUpdate, onChange, onCreate } = props;
  const { tagList, setTagList, setShowTagManagementModal } = useTagStore();

  const typeColor = useMemo(() => getTagColorByType(type), [type]);

  // 选中的标签id
  const [selectedTagIDs, setSelectedTagIDs] = useState<string[]>(value ?? []);
  // 检索关键词
  const [keywords, setKeywords] = useState<string>('');

  // 面板打开时拉取最新标签列表
  useEffect(() => {
    onCreate?.();
    // 只在 mount 时拉取一次即可
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 打开面板时同步选中态（外部 value 变化时也同步）
  useEffect(() => {
    setSelectedTagIDs(value ?? []);
  }, [value]);

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
      (tag) => tag.type === type && !selectedTagIDs.includes(tag.id) && tag.name.includes(keywords)
    );
  }, [type, tagList, selectedTagIDs, keywords]);

  const [creating, setCreating] = useState<boolean>(false);

  const resolveSelectedTags = (ids: string[]) => {
    const dict = new Map<string, Tag>();
    (selectedTags ?? []).forEach((tag) => {
      if (tag?.id) {
        dict.set(tag.id, tag);
      }
    });
    tagList.forEach((tag) => {
      if (tag?.id) {
        dict.set(tag.id, tag);
      }
    });
    return ids.map((id) => dict.get(id)).filter(Boolean) as Tag[];
  };

  // 标签新建（应用标签走 engine tagService）
  const createTagMutation = useMutation({
    mutationFn: (name: string) => tagService.createTag({ name, type }),
    // 请求前设置状态
    onMutate: () => {
      setCreating(true);
    },
    onSuccess: (data) => {
      setTagList([...tagList, data]);
      notification.success({
        title: t('common.tag.created'),
        description: t('common.tag.created'),
      });
      // 创建后自动选中并立即绑定
      setSelectedTagIDs((prev) => {
        const next = prev.includes(data.id) ? prev : [...prev, data.id];
        onCacheUpdate(resolveSelectedTags(next));
        bindTagsMutation.mutateAsync(next).finally(() => {
          onChange?.();
        });
        return next;
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

  // 覆盖式绑定（后端 bind 会先删后插）
  const bindTagsMutation = useMutation({
    mutationFn: (tagIDs: string[]) => tagService.bindTags(tagIDs, targetID),
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

  const unbindTagMutation = useMutation({
    mutationFn: (tagId: string) => tagService.unbindTag(tagId, targetID),
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
    await createTagMutation.mutateAsync(keywords);
  };

  /**
   * 选中标签
   */
  const selectTag = async (tag: Tag) => {
    const isSelected = selectedTagIDs.includes(tag.id);
    const nextSelectedTagIDs = isSelected ? selectedTagIDs.filter((v) => v !== tag.id) : [...selectedTagIDs, tag.id];

    // 乐观更新 UI
    setSelectedTagIDs(nextSelectedTagIDs);
    onCacheUpdate(resolveSelectedTags(nextSelectedTagIDs));

    if (isSelected) {
      await unbindTagMutation.mutateAsync(tag.id).finally(() => {
        onChange?.();
      });
      return;
    }

    // bind 为覆盖式绑定：必须传全量 ids，避免覆盖掉已有绑定
    await bindTagsMutation.mutateAsync(nextSelectedTagIDs).finally(() => {
      onChange?.();
    });
  };

  // 注意：缓存更新由 selectTag / createTag 主动触发，避免与外部 value 同步产生循环更新

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
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: getTagColorByType(tag.type ?? type) }}
              />
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
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: typeColor }} />
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
  const { setTagList } = useTagStore();

  /**
   * 获取标签列表
   * @returns 标签列表
   */
  const getTagList = async () => {
    const tags = await tagService.listTags(type);
    setTagList(tags);
  };

  /**
   * 用于显示选中标签的内容（优先使用 selectedTags）
   */
  const triggerTags = useMemo(() => {
    const unique = new Map<string, Tag>();
    (selectedTags ?? []).forEach((tag) => {
      if (tag?.id) {
        unique.set(tag.id, tag);
      }
    });
    return Array.from(unique.values());
  }, [selectedTags]);

  /**
   * 触发器内容
   * @returns 触发器内容
   */
  const Trigger = () => {
    const maxVisible = 2;
    const visibleTags = triggerTags.slice(0, maxVisible);
    const overflow = triggerTags.length - visibleTags.length;

    return (
      <div
        className={cn(
          'relative flex w-full cursor-pointer items-center gap-1 rounded-md px-2 py-[7px] hover:bg-[#c8ceda33]'
        )}
      >
        <TagOutlined className="h-3 w-3 shrink-0" />
        {!triggerTags.length ? (
          <div className="text-[#98a2b2] grow truncate text-start text-[13px] font-normal leading-5">
            {t('common.tag.addTag')}
          </div>
        ) : (
          <div className="min-w-0 grow truncate text-start">
            <div className="flex items-center gap-1 truncate">
              {visibleTags.map((tag) => (
                <Tooltip key={tag.id} title={tag.name}>
                  <AntdTag
                    color={getTagColorByType(tag.type)}
                    style={{
                      maxWidth: 120,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'inline-block',
                      verticalAlign: 'middle',
                    }}
                  >
                    {tag.name}
                  </AntdTag>
                </Tooltip>
              ))}
              {overflow > 0 && <AntdTag>{`+${overflow}`}</AntdTag>}
            </div>
          </div>
        )}
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
              '!w-full !border-0 !p-0 !text-[#101828] hover:!bg-[#c8ceda33] hover:!text-[#101828]'
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
