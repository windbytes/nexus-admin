import { App, Input } from 'antd';
import type React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DragModal from '@/components/modal/DragModal';
import { useTagStore } from '@/stores/useTagStore.ts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tagsService } from '@/services/common/tags/tagsApi';
import TagItemEditor from './tag-item-editor';

type TagManagementModalProps = {
  type: string;
  show: boolean;
};

/**
 * 标签管理弹窗
 */
const TagManagementModal: React.FC<TagManagementModalProps> = ({ type, show }) => {
  // 只订阅需要的 store 方法，不订阅 tagList 避免重复渲染
  const { setShowTagManagementModal, setTagList } = useTagStore();
  const { t } = useTranslation();
  const { notification } = App.useApp();
  const queryClient = useQueryClient();

  // 查询标签列表 - 使用 useQuery 返回的 data 作为数据源
  const { data: tagList = [] } = useQuery({
    queryKey: ['tag_management_list', type],
    queryFn: async () => {
      const res = await tagsService.getTagsList(type);
      // 更新 store 供其他组件使用，但本组件不订阅
      setTagList(res);
      return res;
    },
    enabled: show, // 只在弹窗显示时查询
  });

  const [pending, setPending] = useState<boolean>(false);
  const [name, setName] = useState<string>('');

  // 创建新标签
  const createNewTagMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await tagsService.addTag({
        name,
        type,
      });
      return res;
    },
    onMutate: () => {
      setPending(true);
    },
    onError: (err) => {
      notification.error({
        message: t('common.createFailed') + err.message,
      });
      setPending(false);
    },
    onSuccess: (res) => {
      const newTagList = [res, ...tagList];
      // 更新 store 供其他组件使用
      setTagList(newTagList);
      // 更新 react-query 缓存，保持数据一致性
      queryClient.setQueryData(['tag_management_list', type], newTagList);
      setName('');
      setPending(false);
      notification.success({
        message: t('common.createSuccess'),
      });
    },
  });

  /**
   * 创建新标签
   * @returns
   */
  const createNewTag = async () => {
    if (!name) return;
    if (pending) return;
    createNewTagMutation.mutateAsync(name);
  };

  return (
    <DragModal
      className="!w-[600px] !max-w-[600px] px-8 py-6"
      centered
      open={show}
      title={t('common.tag.manageTags')}
      footer={null}
      onCancel={() => setShowTagManagementModal(false)}
    >
      <div className="flex flex-wrap gap-2">
        <Input
          value={name}
          className="!w-[100px]"
          size="small"
          onChange={(e) => setName(e.target.value)}
          placeholder={t('common.tag.addNew')}
          autoFocus
          onBlur={createNewTag}
          onPressEnter={(e) => !e.nativeEvent.isComposing && createNewTag()}
        />
        {tagList.map((tag) => (
          <TagItemEditor key={tag.id} tag={tag} />
        ))}
      </div>
    </DragModal>
  );
};
export default TagManagementModal;
